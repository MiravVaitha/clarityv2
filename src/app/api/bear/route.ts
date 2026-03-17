import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { BearRequestSchema } from '@/lib/bearSchemas';
import { BearAIResponseSchema } from '@/lib/bearSchemas';
import { BEAR_SYSTEM_PROMPT, buildBearPrompt } from '@/lib/bearPrompts';
import { generateStructuredData, generateSessionTitle } from '@/lib/geminiClient';

const DEBUG = process.env.DEBUG_AI === 'true';

export async function POST(request: NextRequest) {
    try {
        // 1. Verify authentication
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'I need to know who I\'m talking to. Try signing in again.' }, { status: 401 });
        }

        // 2. Parse and validate request body
        const body = await request.json();
        const parsed = BearRequestSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'I didn\'t quite catch that. Could you try again?' },
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
                .insert({ user_id: user.id, engine: 'bear', title: placeholder })
                .select('id')
                .single();

            if (sessionError) {
                console.error('[Bear API] Session creation failed:', sessionError);
                return NextResponse.json({ error: 'Couldn\'t start a new conversation. Give it another go in a moment.' }, { status: 500 });
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
            console.error('[Bear API] Failed to save user message:', userMsgError);
        }

        // 5. Build the conversation prompt and call Gemini
        const conversationPrompt = buildBearPrompt(history, message);

        if (DEBUG) {
            console.log('\n[Bear API] Prompt:\n', conversationPrompt);
        }

        const aiResponse = await generateStructuredData(
            BEAR_SYSTEM_PROMPT,
            conversationPrompt,
            BearAIResponseSchema,
            'BearResponse'
        );

        if (DEBUG) {
            console.log('\n[Bear API] AI response:', JSON.stringify(aiResponse, null, 2));
        }

        // 6. Save Bear's response message.
        // For card responses, embed the card data in message content as JSON so
        // past sessions can be fully reconstructed without a clarity_cards join.
        const bearMessageContent =
            aiResponse.response_type === 'card' && aiResponse.card
                ? JSON.stringify({
                    __bear_card: true,
                    intro: aiResponse.message,
                    card_type: aiResponse.card_type,
                    card: aiResponse.card,
                })
                : aiResponse.message;

        const { error: bearMsgError } = await supabase.from('messages').insert({
            session_id: activeSessionId,
            role: 'bear',
            content: bearMessageContent,
        });
        if (bearMsgError) {
            console.error('[Bear API] Failed to save Bear message:', bearMsgError);
        }

        // 7. If a card was generated, also save to clarity_cards for queryability
        if (aiResponse.response_type === 'card' && aiResponse.card) {
            const { error: cardError } = await supabase.from('clarity_cards').insert({
                session_id: activeSessionId,
                card_type: aiResponse.card_type ?? 'unknown',
                card_data: aiResponse.card,
            });
            if (cardError) {
                console.error('[Bear API] Failed to save clarity card:', cardError);
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
            card_type: aiResponse.card_type ?? null,
            card: aiResponse.card ?? null,
        });

    } catch (error: any) {
        console.error('[Bear API] Unhandled error:', error?.message ?? error);
        return NextResponse.json(
            { error: 'Something\'s stuck on my end. Give me a second and try that again.' },
            { status: 500 }
        );
    }
}
