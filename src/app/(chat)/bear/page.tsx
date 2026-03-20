"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import WoodsBackground from "@/components/bear/WoodsBackground";
import BearCharacter from "@/components/bear/BearCharacter";
import ChatMessage from "@/components/bear/ChatMessage";
import InlineClarityCard from "@/components/bear/InlineClarityCard";
import SessionSidebar from "@/components/bear/SessionSidebar";
import CustomScrollbar from "@/components/CustomScrollbar";
import type { ClarifyOutput } from "@/lib/schemas";

// ── Types ──────────────────────────────────────────────────────────

type BearState = "idle" | "thinking" | "talking";

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

const CARD_MARKER = "__bear_card";

function uid() {
    return Math.random().toString(36).slice(2);
}

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
            // not JSON — plain text
        }
        return { id: uid(), type: "bear", content: rawContent };
    }
    return { id: uid(), type: "user", content: rawContent };
}

function buildHistory(entries: ChatEntry[]): HistoryItem[] {
    return entries
        .filter((e) => e.type !== "card")
        .map((e) => ({
            role: e.type === "user" ? "user" : "bear",
            content: (e as { content: string }).content,
        } as HistoryItem));
}

// ── Hamburger icon ─────────────────────────────────────────────────

function HamburgerLines({ color = "rgba(200,225,210,0.65)" }: { color?: string }) {
    return (
        <>
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    style={{
                        display: "block",
                        width: "18px",
                        height: "2px",
                        borderRadius: "1px",
                        background: color,
                    }}
                />
            ))}
        </>
    );
}

// ── Component ──────────────────────────────────────────────────────

function makeBearWelcome(name: string): ChatEntry {
    return {
        id: "bear-welcome",
        type: "bear",
        content: name
            ? `Hey ${name} — I'm Zulu. Tell me what's on your mind. A decision you're weighing, something you're trying to plan, or just something that feels tangled. I'll help you see it clearly.`
            : "Hey — I'm Zulu. Tell me what's on your mind. A decision you're weighing, something you're trying to plan, or just something that feels tangled. I'll help you see it clearly.",
    };
}

export default function BearPage() {
    const [entries, setEntries] = useState<ChatEntry[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [input, setInput] = useState("");
    const [bearState, setBearState] = useState<BearState>("idle");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [displayName, setDisplayName] = useState<string | null>(null);
    const displayNameRef = useRef<string>("");

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const sessionsRef = useRef<Session[]>([]);
    const supabase = createClient();

    // ── Derived state ──────────────────────────────────────────────

    const hasMessages = entries.length > 0;
    const isSending = bearState === "thinking";
    const sessionTitle = sessions.find((s) => s.id === sessionId)?.title ?? null;
    // Dim the woods when a card just landed — refocuses attention
    const lastEntryIsCard = entries.length > 0 && entries[entries.length - 1].type === "card";

    // ── Fetch display name ─────────────────────────────────────────

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            const name = data.user?.user_metadata?.display_name || "";
            displayNameRef.current = name;
            setDisplayName(name);
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Show welcome whenever entering new-conversation state ──────

    useEffect(() => {
        if (displayName === null) return;
        if (sessionId === null && entries.length === 0) {
            setEntries([makeBearWelcome(displayName)]);
        }
    }, [displayName]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Load sessions ──────────────────────────────────────────────

    const loadSessions = useCallback(async () => {
        const { data } = await supabase
            .from("sessions")
            .select("id, title, created_at")
            .eq("engine", "bear")
            .order("created_at", { ascending: false })
            .limit(40);
        if (data) { setSessions(data); sessionsRef.current = data; }
    }, [supabase]);

    useEffect(() => { loadSessions(); }, [loadSessions]);

    // ── Auto-scroll ────────────────────────────────────────────────

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [entries, bearState]);

    // ── Load a past session ────────────────────────────────────────

    const loadSession = useCallback(async (id: string) => {
        setSessionId(id);
        setEntries([]);
        setBearState("idle");

        const { data: msgs } = await supabase
            .from("messages")
            .select("role, content, created_at")
            .eq("session_id", id)
            .order("created_at", { ascending: true });

        if (!msgs) return;
        setEntries(msgs.map((m) => parseMessageContent(m.role as "user" | "bear", m.content)));
    }, [supabase]);

    // ── New session ────────────────────────────────────────────────

    const startNewSession = useCallback(() => {
        setSessionId(null);
        setEntries([makeBearWelcome(displayNameRef.current)]);
        setBearState("idle");
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    // ── Send message ───────────────────────────────────────────────

    const sendMessage = useCallback(async () => {
        const text = input.trim();
        if (!text || isSending) return;

        setInput("");
        setBearState("thinking");

        const userEntry: ChatEntry = { id: uid(), type: "user", content: text };
        setEntries((prev) => [...prev, userEntry]);

        const history = buildHistory(entries);

        try {
            const res = await fetch("/api/bear", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...(sessionId ? { session_id: sessionId } : {}),
                    message: text,
                    history,
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                setEntries((prev) => [
                    ...prev,
                    { id: uid(), type: "bear", content: err.error ?? "Something's not working on my end. Give it a moment and try again." },
                ]);
                setBearState("idle");
                return;
            }

            const data = await res.json();

            if (!sessionId) {
                setSessionId(data.session_id);
                if (data.title) {
                    const newSession = { id: data.session_id, title: data.title, created_at: new Date().toISOString() };
                    setSessions((prev) => [newSession, ...prev]);
                    sessionsRef.current = [newSession, ...sessionsRef.current];
                }
                loadSessions();
            }

            // Bear animates briefly when responding
            setBearState("talking");
            setTimeout(() => setBearState("idle"), 1800);

            if (data.response_type === "card" && data.card) {
                setEntries((prev) => [
                    ...prev,
                    { id: uid(), type: "card", cardType: data.card_type, card: data.card, introMessage: data.message },
                ]);
            } else {
                setEntries((prev) => [...prev, { id: uid(), type: "bear", content: data.message }]);
            }
        } catch {
            setEntries((prev) => [
                ...prev,
                { id: uid(), type: "bear", content: "I hit a wall there. Try sending that again — I'm not going anywhere." },
            ]);
            setBearState("idle");
        } finally {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [input, isSending, entries, sessionId, loadSessions]);

    const renameSession = useCallback(async (id: string, newTitle: string) => {
        await supabase.from("sessions").update({ title: newTitle }).eq("id", id);
        setSessions((prev) => {
            const updated = prev.map((s) => s.id === id ? { ...s, title: newTitle } : s);
            sessionsRef.current = updated;
            return updated;
        });
    }, [supabase]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // ── Render ─────────────────────────────────────────────────────

    return (
        <div className="relative h-[100dvh] overflow-hidden flex">
            <WoodsBackground />

            {/* ── Background dim overlay — fades in when a card is active ── */}
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 1,
                    background: "rgba(0,0,0,0.45)",
                    opacity: lastEntryIsCard ? 1 : 0,
                    transition: "opacity 0.7s ease",
                    pointerEvents: "none",
                }}
            />

            <SessionSidebar
                sessions={sessions}
                activeSessionId={sessionId}
                onSelectSession={loadSession}
                onNewSession={startNewSession}
                onRenameSession={renameSession}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* ── LEFT PANEL — Bear (hidden on mobile via CSS) ── */}
            <div className="bear-left-panel">
                {/* Sessions button — top-left of bear panel */}
                <button
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open sessions"
                    style={{
                        position: "absolute",
                        top: "16px",
                        left: "16px",
                        background: "rgba(4,14,6,0.55)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                        padding: "8px 10px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        backdropFilter: "blur(8px)",
                    }}
                >
                    <HamburgerLines />
                </button>

                {/* Bear character */}
                <BearCharacter state={bearState} size={240} />

                {/* Bear name */}
                <span
                    style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "rgba(200,225,210,0.4)",
                    }}
                >
                    Zulu
                </span>

                {/* Thinking label */}
                {bearState === "thinking" && (
                    <span
                        style={{
                            fontSize: "0.8rem",
                            fontStyle: "italic",
                            color: "rgba(251,191,36,0.6)",
                            position: "absolute",
                            bottom: "28px",
                        }}
                    >
                        Zulu is thinking…
                    </span>
                )}
            </div>

            {/* ── RIGHT PANEL — Chat ── */}
            <div
                style={{
                    flex: 1,
                    minWidth: 0,
                    position: "relative",
                    zIndex: 10,
                    display: "flex",
                    flexDirection: "column",
                    background: "rgba(2,9,4,0.68)",
                    backdropFilter: "blur(18px)",
                    borderLeft: "1px solid rgba(255,255,255,0.05)",
                }}
            >
                {/* Top bar */}
                <div
                    style={{
                        padding: "14px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    {/* Mobile-only hamburger — hidden on desktop via CSS */}
                    <button
                        className="bear-mobile-menu-btn"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open sessions"
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            flexDirection: "column",
                            gap: "4px",
                            padding: "4px",
                        }}
                    >
                        <HamburgerLines color="rgba(200,225,210,0.5)" />
                    </button>

                    <span
                        style={{
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "rgba(210,235,215,0.4)",
                            flex: 1,
                            textAlign: "center",
                        }}
                    >
                        {sessionTitle ?? "New conversation"}
                    </span>

                    {/* Home button — right side */}
                    <a
                        href="/home"
                        aria-label="Home"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "38px",
                            height: "38px",
                            borderRadius: "10px",
                            color: "rgba(190,220,205,0.65)",
                            background: "rgba(190,220,205,0.06)",
                            border: "1px solid rgba(190,220,205,0.12)",
                            textDecoration: "none",
                            flexShrink: 0,
                            transition: "color 0.15s, background 0.15s, border-color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = "rgba(190,220,205,0.95)";
                            e.currentTarget.style.background = "rgba(190,220,205,0.12)";
                            e.currentTarget.style.borderColor = "rgba(190,220,205,0.25)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = "rgba(190,220,205,0.65)";
                            e.currentTarget.style.background = "rgba(190,220,205,0.06)";
                            e.currentTarget.style.borderColor = "rgba(190,220,205,0.12)";
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                            <path d="M7 18v-6h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                        </svg>
                    </a>
                </div>

                {/* Messages area */}
                <CustomScrollbar
                    outerStyle={{ flex: 1 }}
                    innerStyle={{
                        padding: hasMessages ? "20px 18px 12px" : "0",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {!hasMessages ? (
                        <div
                            style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "32px",
                            }}
                        >
                            <p
                                style={{
                                    color: "rgba(180,210,190,0.35)",
                                    fontSize: "1rem",
                                    fontStyle: "italic",
                                    textAlign: "center",
                                    maxWidth: "240px",
                                    lineHeight: "1.6",
                                    margin: 0,
                                }}
                            >
                                Tell me what&apos;s on your mind.
                            </p>
                        </div>
                    ) : (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "14px",
                                width: "100%",
                            }}
                        >
                            {entries.map((entry) => {
                                if (entry.type === "user") {
                                    return <ChatMessage key={entry.id} role="user" content={entry.content} />;
                                }
                                if (entry.type === "bear") {
                                    return <ChatMessage key={entry.id} role="bear" content={entry.content} />;
                                }
                                return (
                                    <InlineClarityCard
                                        key={entry.id}
                                        cardType={entry.cardType as "decision" | "plan" | "overwhelm" | "message_prep"}
                                        card={entry.card}
                                        introMessage={entry.introMessage}
                                    />
                                );
                            })}

                            {/* Mobile-only thinking indicator — bear panel is hidden on mobile */}
                            {isSending && (
                                <div
                                    className="bear-mobile-thinking"
                                    style={{
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "6px",
                                        padding: "12px 4px",
                                        animation: "message-appear 0.3s ease-out both",
                                    }}
                                >
                                    <div style={{ opacity: 0.85 }}>
                                        <BearCharacter state="thinking" size={64} />
                                    </div>
                                    <span style={{
                                        color: "rgba(200,225,210,0.45)",
                                        fontSize: "0.8rem",
                                        fontStyle: "italic",
                                        letterSpacing: "0.02em",
                                    }}>
                                        Zulu is thinking…
                                    </span>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </CustomScrollbar>

                {/* Input bar */}
                <div
                    style={{
                        padding: "12px 16px 18px",
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                        flexShrink: 0,
                    }}
                >
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="What's going on?"
                            rows={1}
                            disabled={isSending}
                            className="no-scrollbar"
                            style={{
                                flex: 1,
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "14px",
                                padding: "12px 16px",
                                color: "rgba(220,240,225,0.95)",
                                fontSize: "1rem",
                                lineHeight: "1.5",
                                outline: "none",
                                resize: "none",
                                minHeight: "48px",
                                maxHeight: "130px",
                                overflowY: "auto",
                                fontFamily: "inherit",
                            }}
                            onInput={(e) => {
                                const el = e.currentTarget;
                                el.style.height = "auto";
                                el.style.height = Math.min(el.scrollHeight, 130) + "px";
                            }}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || isSending}
                            style={{
                                width: "46px",
                                height: "46px",
                                borderRadius: "50%",
                                background: input.trim() && !isSending
                                    ? "rgba(251,191,36,0.9)"
                                    : "rgba(251,191,36,0.15)",
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
                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                                <path
                                    d="M10 16V6M10 6L6 10M10 6L14 10"
                                    stroke={input.trim() && !isSending ? "#1a0f06" : "rgba(251,191,36,0.4)"}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
