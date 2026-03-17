import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ParrotRequestSchema, ParrotAIResponseSchema } from '@/lib/parrotSchemas';
import { PARROT_SYSTEM_PROMPT, buildParrotPrompt } from '@/lib/parrotPrompts';
import { generateStructuredData, generateSessionTitle } from '@/lib/geminiClient';

const DEBUG = process.env.DEBUG_AI === 'true';

// Marker used when embedding draft data in message content
// (mirrors the Bear __bear_card pattern so sessions reconstruct cleanly)
const DRAFT_MARKER = '__parrot_draft';

export async function POST(request: NextRequest) {
    try {
        // 1. Verify authentication
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Can\'t place your voice — try signing in again.' }, { status: 401 });
        }

        // 2. Parse and validate request body
        const body = await request.json();
        const parsed = ParrotRequestSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'That came through garbled. Send it again?' },
                { status: 400 }
            );
        }
        const { session_id, message, history } = parsed.data;

        // 3. Create a new session if none provided (first message)
        let activeSessionId = session_id;
        let isNewSession = false;
        if (!activeSessionId) {
            const placeholder = message.slice(0, 60) + (message.length > 60 ? '...' : '');
            const { data: session, error: sessionError } = await supabase
                .from('sessions')
                .insert({ user_id: user.id, engine: 'parrot', title: placeholder })
                .select('id')
                .single();

            if (sessionError) {
                console.error('[Parrot API] Session creation failed:', sessionError);
                return NextResponse.json({ error: 'Couldn\'t open a fresh conversation. Try again in a moment.' }, { status: 500 });
            }
            activeSessionId = session.id;
            isNewSession = true;
        }

        // 4. Save the user's message
        const { error: userMsgError } = await supabase.from('messages').insert({
            session_id: activeSessionId,
            role: 'user',
            content: message,
        });
        if (userMsgError) {
            console.error('[Parrot API] Failed to save user message:', userMsgError);
        }

        // 5. Build the conversation prompt and call Gemini
        const conversationPrompt = buildParrotPrompt(history, message);

        if (DEBUG) {
            console.log('\n[Parrot API] Prompt:\n', conversationPrompt);
        }

        const aiResponse = await generateStructuredData(
            PARROT_SYSTEM_PROMPT,
            conversationPrompt,
            ParrotAIResponseSchema,
            'ParrotResponse'
        );

        if (DEBUG) {
            console.log('\n[Parrot API] AI response:', JSON.stringify(aiResponse, null, 2));
        }

        // 6. Save Parrot's response message.
        // For draft responses, embed the full draft data in message content as JSON
        // so past sessions can be fully reconstructed without a drafts table join.
        const parrotMessageContent =
            aiResponse.response_type === 'draft' && aiResponse.draft
                ? JSON.stringify({
                    [DRAFT_MARKER]: true,
                    intro: aiResponse.message,
                    draft: aiResponse.draft,
                })
                : aiResponse.message;

        const { error: parrotMsgError } = await supabase.from('messages').insert({
            session_id: activeSessionId,
            role: 'parrot',
            content: parrotMessageContent,
        });
        if (parrotMsgError) {
            console.error('[Parrot API] Failed to save Parrot message:', parrotMsgError);
        }

        // 7. If a draft was generated, also save to drafts table for queryability
        if (aiResponse.response_type === 'draft' && aiResponse.draft) {
            const { error: draftError } = await supabase.from('drafts').insert({
                session_id: activeSessionId,
                draft_data: aiResponse.draft,
            });
            if (draftError) {
                console.error('[Parrot API] Failed to save draft:', draftError);
            }
        }

        // 8. Generate a title for new sessions (fire-and-forget DB update)
        let generatedTitle: string | null = null;
        if (isNewSession) {
            generatedTitle = await generateSessionTitle(message);
            await supabase.from('sessions').update({ title: generatedTitle }).eq('id', activeSessionId);
        }

        // 9. Return the response to the client
        return NextResponse.json({
            session_id: activeSessionId,
            ...(generatedTitle ? { title: generatedTitle } : {}),
            response_type: aiResponse.response_type,
            message: aiResponse.message,
            draft: aiResponse.draft ?? null,
        });

    } catch (error: any) {
        console.error('[Parrot API] Unhandled error:', error?.message ?? error);
        return NextResponse.json(
            { error: 'Lost my voice for a moment there. Try that again.' },
            { status: 500 }
        );
    }
}
