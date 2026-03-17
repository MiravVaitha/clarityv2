import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || "gemini-3-flash-preview";
const DEBUG_AI = process.env.DEBUG_AI === "true";

export function getGenAI() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Missing Gemini API key. Please set GEMINI_API_KEY in .env.local.");
    }
    return new GoogleGenAI({ apiKey });
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: any): boolean {
    if (!error) return false;

    const message = error.message || '';
    const status = error.status || error.statusCode || 0;

    // Check for HTTP 429 or RESOURCE_EXHAUSTED message
    return status === 429 ||
        message.includes('RESOURCE_EXHAUSTED') ||
        message.includes('rate limit') ||
        message.includes('quota');
}

/**
 * Extract retry delay from error response
 */
export function extractRetryDelay(error: any): number | null {
    if (!error) return null;

    // Try to find retry delay in various formats
    if (error.retryDelay) return error.retryDelay;
    if (error.retryInfo?.retryDelay) return error.retryInfo.retryDelay;

    // Parse from message like "Please retry in 60s"
    const message = error.message || '';
    const match = message.match(/retry in (\d+)\s*s/i);
    if (match) {
        return parseInt(match[1], 10);
    }

    // Default to 60 seconds if no specific delay found
    return 60;
}

/**
 * Extract JSON from text that might contain markdown code blocks or extra text
 */
function extractJSON(text: string): any {
    // First try direct parse
    try {
        return JSON.parse(text);
    } catch (e) {
        // Try to extract JSON from markdown code blocks
        const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (codeBlockMatch) {
            try {
                return JSON.parse(codeBlockMatch[1]);
            } catch (e2) {
                // Continue to brace matching
            }
        }

        // Try to find first complete JSON object using brace matching
        let braceCount = 0;
        let startIdx = -1;
        let endIdx = -1;

        for (let i = 0; i < text.length; i++) {
            if (text[i] === '{') {
                if (braceCount === 0) startIdx = i;
                braceCount++;
            } else if (text[i] === '}') {
                braceCount--;
                if (braceCount === 0 && startIdx !== -1) {
                    endIdx = i;
                    break;
                }
            }
        }

        if (startIdx !== -1 && endIdx !== -1) {
            const jsonStr = text.substring(startIdx, endIdx + 1);
            try {
                return JSON.parse(jsonStr);
            } catch (e3) {
                throw new Error("Could not extract valid JSON from response");
            }
        }

        throw new Error("No valid JSON found in response");
    }
}

/**
 * Generate a short session title from the user's first message.
 * Returns a 3-6 word title. Falls back to a trimmed message on failure.
 */
export async function generateSessionTitle(message: string): Promise<string> {
    const fallback = message.slice(0, 50) + (message.length > 50 ? "…" : "");
    try {
        const ai = getGenAI();
        const result: any = await Promise.race([
            (ai as any).models.generateContent({
                model: MODEL_NAME,
                contents: [{ role: "user", parts: [{ text: `Summarize this in 3-6 words as a short chat title. No quotes, no punctuation at the end. Just the title.\n\n"${message.slice(0, 300)}"` }] }],
                config: { maxOutputTokens: 80, thinkingConfig: { thinkingBudget: 0 } },
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000)),
        ]);
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        return text && text.length > 0 && text.length < 80 ? text : fallback;
    } catch {
        return fallback;
    }
}

export async function generateStructuredData<T>(
    systemPrompt: string,
    userPrompt: string,
    schema: z.ZodType<T>,
    schemaName: string = "Data",
    responseSchema?: any // Native Gemini JSON schema
): Promise<T> {
    const ai = getGenAI();

    // Attempt 1: primary model
    try {
        const result = await executeGeneration(ai, MODEL_NAME, userPrompt, systemPrompt, responseSchema);
        return validateAndParse(result, schema, schemaName);
    } catch (primaryError: any) {
        const isRetryable = isRateLimitError(primaryError) ||
            primaryError.message?.includes("timed out") ||
            primaryError.message?.includes("503") ||
            primaryError.message?.includes("504");

        if (!isRetryable) {
            if (DEBUG_AI) {
                console.error(`\n[DEBUG_AI] Non-retryable error for ${schemaName}: ${primaryError.message}`);
            }
            throw primaryError;
        }

        console.warn(`[AI FALLBACK] ${schemaName} failed on ${MODEL_NAME}. Trying fallback model ${FALLBACK_MODEL}... Error: ${primaryError.message}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Attempt 2: fallback model
    try {
        const result = await executeGeneration(ai, FALLBACK_MODEL, userPrompt, systemPrompt, responseSchema);
        return validateAndParse(result, schema, schemaName);
    } catch (fallbackError: any) {
        if (DEBUG_AI) {
            console.error(`\n[DEBUG_AI] Both models failed for ${schemaName}`);
            console.error(`Fallback error: ${fallbackError.message}`);
        }
        throw fallbackError;
    }
}

function validateAndParse<T>(json: any, schema: z.ZodType<T>, schemaName: string): T {
    const parseResult = schema.safeParse(json);
    if (!parseResult.success) {
        const errorMsg = parseResult.error.issues.map(e => `${e.path.join(".")}: ${e.message}`).join(", ");

        if (DEBUG_AI) {
            console.log(`\n[DEBUG_AI] Schema validation failed for ${schemaName}`);
            console.log(`Raw response (first 2000 chars):`, JSON.stringify(json).substring(0, 2000));
            console.log(`Zod errors:`, parseResult.error.issues);
        }

        const error: any = new Error(`Schema validation failed: ${errorMsg}`);
        error.zodIssues = parseResult.error.issues;
        error.rawData = json;
        throw error;
    }
    return parseResult.data;
}

async function executeGeneration(ai: GoogleGenAI, model: string, prompt: string, systemPrompt: string, responseSchema?: any): Promise<any> {
    const finalSystemPrompt = `${systemPrompt}\n\nCRITICAL: Output ONLY valid JSON.`;

    // Server-side deterministic timeout (20s)
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("AI generation timed out on server (20s)")), 20000);
    });

    try {
        const generatePromise = (ai as any).models.generateContent({
            model,
            contents: [{ role: "user", parts: [{ text: `${finalSystemPrompt}\n\n${prompt}` }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });

        const result: any = await Promise.race([generatePromise, timeoutPromise]);

        // For @google/genai client (v1 SDK)
        const candidates = result.candidates || result.data?.candidates;
        const text = candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error("Gemini returned empty response");
        }

        try {
            return extractJSON(text);
        } catch (e) {
            if (DEBUG_AI) {
                console.log(`\n[DEBUG_AI] JSON extraction failed`);
                console.log(`Raw text (first 2000 chars):`, text.substring(0, 2000));
            }
            throw new Error("Invalid JSON returned by Gemini");
        }
    } catch (error: any) {
        if (error.message?.includes("404") || error.message?.includes("not found")) {
            if (DEBUG_AI) {
                console.error(`\n[DEBUG_AI] Model not found: ${model}`);
            }
        }
        throw error;
    }
}
