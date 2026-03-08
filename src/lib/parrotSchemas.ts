import { z } from 'zod';

// ── Request schemas ────────────────────────────────────────────────

export const ParrotHistoryMessageSchema = z.object({
    role: z.enum(['user', 'parrot']),
    content: z.string().min(1),
});

export const ParrotRequestSchema = z.object({
    session_id: z.string().uuid().optional(),
    message: z.string().min(1).max(5000),
    history: z.array(ParrotHistoryMessageSchema).default([]),
});

// ── Draft schemas ──────────────────────────────────────────────────

export const ParrotDraftVersionSchema = z.object({
    label: z.string().min(1),         // e.g. "Direct", "Warmer", "Formal"
    body: z.string().min(1),           // full draft text
    tone_note: z.string().min(1),      // one sentence on what makes this version distinct
});

export const ParrotDraftSchema = z.object({
    draft_type: z.enum([
        'email', 'message', 'slack', 'letter', 'text',
        'apology', 'request', 'feedback', 'announcement', 'other',
    ]),
    subject: z.string().optional(),    // only for email
    versions: z.array(ParrotDraftVersionSchema).min(2).max(3),
    delivery_tips: z.array(z.string()).optional(),
});

// ── AI response schema (what Gemini returns) ───────────────────────

export const ParrotAIResponseSchema = z.object({
    response_type: z.enum(['chat', 'draft']),
    message: z.string().min(1),
    draft: ParrotDraftSchema.optional(),
});

// ── TypeScript types ───────────────────────────────────────────────

export type ParrotHistoryMessage = z.infer<typeof ParrotHistoryMessageSchema>;
export type ParrotRequest = z.infer<typeof ParrotRequestSchema>;
export type ParrotAIResponse = z.infer<typeof ParrotAIResponseSchema>;
export type ParrotDraft = z.infer<typeof ParrotDraftSchema>;
export type ParrotDraftVersion = z.infer<typeof ParrotDraftVersionSchema>;
