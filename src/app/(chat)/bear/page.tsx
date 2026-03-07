"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import WoodsBackground from "@/components/bear/WoodsBackground";
import BearCharacter from "@/components/bear/BearCharacter";
import ChatMessage from "@/components/bear/ChatMessage";
import InlineClarityCard from "@/components/bear/InlineClarityCard";
import SessionSidebar from "@/components/bear/SessionSidebar";
import type { ClarifyOutput } from "@/lib/schemas";

// ── Types ──────────────────────────────────────────────────────────

type ChatEntry =
    | { id: string; type: "user"; content: string }
    | { id: string; type: "bear"; content: string }
    | { id: string; type: "card"; cardType: string; card: ClarifyOutput; introMessage: string };

interface Session {
    id: string;
    title: string | null;
    created_at: string;
}

interface HistoryItem {
    role: "user" | "bear";
    content: string;
}

// Marker used when storing card data in the messages table
const CARD_MARKER = "__bear_card";

function uid() {
    return Math.random().toString(36).slice(2);
}

// ── Helpers ────────────────────────────────────────────────────────

/** Parse a raw message content string into a ChatEntry */
function parseMessageContent(role: "user" | "bear", rawContent: string): ChatEntry {
    if (role === "bear") {
        try {
            const parsed = JSON.parse(rawContent);
            if (parsed[CARD_MARKER] === true) {
                return {
                    id: uid(),
                    type: "card",
                    cardType: parsed.card_type,
                    card: parsed.card as ClarifyOutput,
                    introMessage: parsed.intro,
                };
            }
        } catch {
            // not JSON — fall through to plain text
        }
        return { id: uid(), type: "bear", content: rawContent };
    }
    return { id: uid(), type: "user", content: rawContent };
}

/** Build the history array to send to the API from current entries */
function buildHistory(entries: ChatEntry[]): HistoryItem[] {
    return entries
        .filter((e) => e.type !== "card") // card entries are covered by the preceding bear message
        .map((e) => ({
            role: e.type === "user" ? "user" : "bear",
            content: e.type === "user" ? e.content : (e as { content: string }).content,
        } as HistoryItem));
}

// ── Component ──────────────────────────────────────────────────────

export default function BearPage() {
    const [entries, setEntries] = useState<ChatEntry[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const supabase = createClient();

    // ── Load sessions on mount ─────────────────────────────────────

    const loadSessions = useCallback(async () => {
        const { data } = await supabase
            .from("sessions")
            .select("id, title, created_at")
            .eq("engine", "bear")
            .order("created_at", { ascending: false })
            .limit(40);
        if (data) setSessions(data);
    }, [supabase]);

    useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    // ── Auto-scroll ────────────────────────────────────────────────

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [entries, isSending]);

    // ── Load a past session ────────────────────────────────────────

    const loadSession = useCallback(async (id: string) => {
        setSessionId(id);
        setEntries([]);

        const { data: msgs } = await supabase
            .from("messages")
            .select("role, content, created_at")
            .eq("session_id", id)
            .order("created_at", { ascending: true });

        if (!msgs) return;

        const rebuilt: ChatEntry[] = msgs.map((m) =>
            parseMessageContent(m.role as "user" | "bear", m.content)
        );
        setEntries(rebuilt);
    }, [supabase]);

    // ── New session ────────────────────────────────────────────────

    const startNewSession = useCallback(() => {
        setSessionId(null);
        setEntries([]);
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    // ── Send message ───────────────────────────────────────────────

    const sendMessage = useCallback(async () => {
        const text = input.trim();
        if (!text || isSending) return;

        setInput("");
        setIsSending(true);

        // Optimistic: add user entry
        const userEntry: ChatEntry = { id: uid(), type: "user", content: text };
        setEntries((prev) => [...prev, userEntry]);

        // Build history (excluding the just-added user entry)
        const history = buildHistory(entries);

        try {
            const res = await fetch("/api/bear", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: sessionId,
                    message: text,
                    history,
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                const errMsg = err.error ?? "Something went wrong. Try again.";
                setEntries((prev) => [
                    ...prev,
                    { id: uid(), type: "bear", content: errMsg },
                ]);
                return;
            }

            const data = await res.json();

            // Update session id if this is a new session
            if (!sessionId) {
                setSessionId(data.session_id);
                // Reload sessions list to show the new one
                loadSessions();
            }

            if (data.response_type === "card" && data.card) {
                setEntries((prev) => [
                    ...prev,
                    {
                        id: uid(),
                        type: "card",
                        cardType: data.card_type,
                        card: data.card,
                        introMessage: data.message,
                    },
                ]);
            } else {
                setEntries((prev) => [
                    ...prev,
                    { id: uid(), type: "bear", content: data.message },
                ]);
            }
        } catch {
            setEntries((prev) => [
                ...prev,
                { id: uid(), type: "bear", content: "Something went wrong. Try again." },
            ]);
        } finally {
            setIsSending(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [input, isSending, entries, sessionId, loadSessions]);

    // ── Keyboard handler ───────────────────────────────────────────

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const hasMessages = entries.length > 0;

    // ── Render ─────────────────────────────────────────────────────

    return (
        <div className="relative h-screen overflow-hidden flex flex-col">
            <WoodsBackground />

            <SessionSidebar
                sessions={sessions}
                activeSessionId={sessionId}
                onSelectSession={loadSession}
                onNewSession={startNewSession}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* ── Top bar ── */}
            <div
                style={{
                    position: "relative",
                    zIndex: 10,
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    background: "rgba(2,9,5,0.45)",
                    backdropFilter: "blur(8px)",
                    flexShrink: 0,
                }}
            >
                <button
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open sessions"
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "rgba(200,225,210,0.6)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        padding: "4px",
                        marginRight: "12px",
                    }}
                >
                    {[0, 1, 2].map((i) => (
                        <span
                            key={i}
                            style={{
                                display: "block",
                                width: "20px",
                                height: "2px",
                                borderRadius: "1px",
                                background: "rgba(200,225,210,0.6)",
                            }}
                        />
                    ))}
                </button>

                <span
                    style={{
                        flex: 1,
                        textAlign: "center",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        color: "rgba(210,235,215,0.7)",
                    }}
                >
                    Bear
                </span>

                {/* Spacer to balance hamburger */}
                <div style={{ width: "28px" }} />
            </div>

            {/* ── Messages area ── */}
            <div
                style={{
                    position: "relative",
                    zIndex: 10,
                    flex: 1,
                    overflowY: "auto",
                    padding: hasMessages ? "24px 16px 16px" : "0",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {!hasMessages ? (
                    /* Welcome / empty state */
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "16px",
                            padding: "24px",
                        }}
                    >
                        <BearCharacter state="idle" size={180} />
                        <p
                            style={{
                                color: "rgba(200,230,210,0.55)",
                                fontSize: "1rem",
                                fontStyle: "italic",
                                textAlign: "center",
                                maxWidth: "280px",
                                lineHeight: "1.6",
                                margin: 0,
                            }}
                        >
                            Tell me what&apos;s on your mind.
                        </p>
                    </div>
                ) : (
                    /* Chat messages */
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "14px",
                            maxWidth: "640px",
                            width: "100%",
                            margin: "0 auto",
                        }}
                    >
                        {entries.map((entry) => {
                            if (entry.type === "user") {
                                return <ChatMessage key={entry.id} role="user" content={entry.content} />;
                            }
                            if (entry.type === "bear") {
                                return <ChatMessage key={entry.id} role="bear" content={entry.content} />;
                            }
                            // card
                            return (
                                <InlineClarityCard
                                    key={entry.id}
                                    cardType={entry.cardType as "decision" | "plan" | "overwhelm" | "message_prep"}
                                    card={entry.card}
                                    introMessage={entry.introMessage}
                                />
                            );
                        })}

                        {/* Thinking indicator */}
                        {isSending && (
                            <div style={{ display: "flex", justifyContent: "flex-start" }}>
                                <BearCharacter state="thinking" size={72} />
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* ── Input bar ── */}
            <div
                style={{
                    position: "relative",
                    zIndex: 10,
                    padding: "12px 16px 20px",
                    background: "rgba(2,9,5,0.55)",
                    backdropFilter: "blur(12px)",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    flexShrink: 0,
                }}
            >
                <div
                    style={{
                        maxWidth: "640px",
                        margin: "0 auto",
                        display: "flex",
                        gap: "10px",
                        alignItems: "flex-end",
                    }}
                >
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="What's going on?"
                        rows={1}
                        disabled={isSending}
                        style={{
                            flex: 1,
                            background: "rgba(10,28,12,0.75)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "14px",
                            padding: "12px 16px",
                            color: "rgba(220,240,225,0.95)",
                            fontSize: "0.9375rem",
                            lineHeight: "1.5",
                            outline: "none",
                            resize: "none",
                            minHeight: "48px",
                            maxHeight: "140px",
                            overflowY: "auto",
                            fontFamily: "inherit",
                        }}
                        onInput={(e) => {
                            const el = e.currentTarget;
                            el.style.height = "auto";
                            el.style.height = Math.min(el.scrollHeight, 140) + "px";
                        }}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || isSending}
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            background: input.trim() && !isSending
                                ? "rgba(251,191,36,0.9)"
                                : "rgba(251,191,36,0.2)",
                            border: "none",
                            cursor: input.trim() && !isSending ? "pointer" : "not-allowed",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            transition: "background 0.2s",
                        }}
                        aria-label="Send"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path
                                d="M10 16V6M10 6L6 10M10 6L14 10"
                                stroke={input.trim() && !isSending ? "#1a0f06" : "rgba(251,191,36,0.5)"}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
