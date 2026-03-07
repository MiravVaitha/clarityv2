import { z } from 'zod';
import { ClarifyOutputSchema } from './schemas';

export const BearHistoryMessageSchema = z.object({
    role: z.enum(['user', 'bear']),
    content: z.string().min(1),
});

export const BearRequestSchema = z.object({
    session_id: z.string().uuid().optional(),
    message: z.string().min(1).max(5000),
    history: z.array(BearHistoryMessageSchema).default([]),
});

// What Gemini returns — validated before saving to DB
export const BearAIResponseSchema = z.object({
    response_type: z.enum(['chat', 'card']),
    message: z.string().min(1),
    card_type: z.enum(['decision', 'plan', 'overwhelm', 'message_prep']).optional(),
    card: ClarifyOutputSchema.optional(),
});

// What the API returns to the client
export const BearAPIResponseSchema = z.object({
    session_id: z.string().uuid(),
    response_type: z.enum(['chat', 'card']),
    message: z.string(),
    card_type: z.string().nullable(),
    card: ClarifyOutputSchema.nullable(),
});

export type BearHistoryMessage = z.infer<typeof BearHistoryMessageSchema>;
export type BearRequest = z.infer<typeof BearRequestSchema>;
export type BearAIResponse = z.infer<typeof BearAIResponseSchema>;
