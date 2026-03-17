import { NextResponse } from "next/server";
import {
    CommunicateInputSchema,
    CommunicateOutputSchema,
    CommunicateRefineInputSchema,
} from "@/lib/schemas";
import { generateStructuredData, isRateLimitError, extractRetryDelay } from "@/lib/geminiClient";
import {
    buildCommunicatePrompt,
    buildCommunicateRefinePrompt,
    COMMUNICATE_SYSTEM_PROMPT,
} from "@/lib/prompts";

const DEBUG_AI = process.env.DEBUG_AI === "true";

// Native Gemini schema (includes refining_questions array of 3)
const COMM_GEMINI_SCHEMA = {
    type: "object",
    properties: {
        drafts: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    context: { type: "string" },
                    intent: { type: "string" },
                    draft: { type: "string" },
                    key_changes: { type: "array", items: { type: "string" } },
                    tone: { type: "string" }
                },
                required: ["context", "intent", "draft", "key_changes", "tone"]
            }
        },
        refining_questions: { type: "array", items: { type: "string" } }
    },
    required: ["drafts", "refining_questions"]
};

export async function POST(req: Request) {
    try {
        let body: any;

        // Parse body
        try {
            body = await req.json();
            if (DEBUG_AI) {
                console.log(`\n========================================`);
                console.log(`[DEBUG_AI] /api/communicate - action: ${body.action || "generate"}`);
                console.log(`Contexts: ${(body.contexts || []).join(", ")}`);
                console.log(`Intent: ${body.intent || "undefined"}`);
                console.log(`Message (first 300 chars): ${(body.message || "").substring(0, 300)}`);
                console.log(`========================================\n`);
            }
        } catch (parseError: any) {
            console.error("[ERROR] Failed to parse request body:", parseError.message);
            return NextResponse.json(
                { errorType: "INVALID_INPUT", message: "That came through garbled. Send it again?" },
                { status: 400 }
            );
        }

        const action = body.action ?? "generate";

        // ── REFINE action ──────────────────────────────────────────────────────
        if (action === "refine") {
            const parseResult = CommunicateRefineInputSchema.safeParse(body);
            if (!parseResult.success) {
                return NextResponse.json(
                    { errorType: "INVALID_INPUT", message: "Something was off with that refinement. Try again?" },
                    { status: 400 }
                );
            }

            const { message, contexts, intent, options, refining_answers, extra_context } = parseResult.data;
            const priorQuestions = body.prior_questions as [string, string, string] | undefined;

            const userPrompt = buildCommunicateRefinePrompt(
                message,
                contexts,
                intent,
                options,
                refining_answers,
                extra_context,
                priorQuestions
            );

            const output = await generateStructuredData(
                COMMUNICATE_SYSTEM_PROMPT,
                userPrompt,
                CommunicateOutputSchema,
                "Communication Refinement",
                COMM_GEMINI_SCHEMA
            );

            if (DEBUG_AI) {
                console.log(`[DEBUG_AI] /api/communicate - Refine success, ${output.drafts.length} drafts\n`);
            }

            return NextResponse.json(output);
        }

        // ── GENERATE action ────────────────────────────────────────────────────
        const parseResult = CommunicateInputSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { errorType: "INVALID_INPUT", message: "I'm missing something. Check your input and try again." },
                { status: 400 }
            );
        }

        const { message, contexts, intent, options, refiningAnswer } = parseResult.data;
        const userPrompt = buildCommunicatePrompt(message, contexts, intent, options, refiningAnswer);

        const output = await generateStructuredData(
            COMMUNICATE_SYSTEM_PROMPT,
            userPrompt,
            CommunicateOutputSchema,
            "Communication Drafts",
            COMM_GEMINI_SCHEMA
        );

        if (DEBUG_AI) {
            console.log(`[DEBUG_AI] /api/communicate - Success, generated ${output.drafts.length} drafts\n`);
        }

        return NextResponse.json(output);

    } catch (error: any) {
        console.error("[ERROR] Communication API Error:", error.message);

        if (isRateLimitError(error)) {
            const retryAfter = extractRetryDelay(error);
            return NextResponse.json({
                errorType: "RATE_LIMIT",
                message: "Too many requests coming in at once. Give it a moment and try again.",
                retryAfterSeconds: retryAfter
            }, { status: 429 });
        }

        const errorResponse: any = {
            errorType: error.errorType || "AI_ERROR",
            message: error.message || "Lost my train of thought. Try that again."
        };

        if (DEBUG_AI) {
            errorResponse.debug = {
                error: error.message,
                issues: error.zodIssues?.slice(0, 5),
                rawPreview: error.rawData ? JSON.stringify(error.rawData).substring(0, 300) : null
            };
        }

        return NextResponse.json(errorResponse, { status: 500 });
    }
}
