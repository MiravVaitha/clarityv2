"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import JungleBackground from "@/components/parrot/JungleBackground";
import ParrotCharacter from "@/components/parrot/ParrotCharacter";
import ChatMessage from "@/components/parrot/ChatMessage";
import InlineDraftCard from "@/components/parrot/InlineDraftCard";
import SessionSidebar from "@/components/parrot/SessionSidebar";
import type { ParrotDraft } from "@/lib/parrotSchemas";

// ── Types ──────────────────────────────────────────────────────────

type ParrotState = "idle" | "thinking" | "talking";

type ChatEntry =
    | { id: string; type: "user"; content: string }
    | { id: string; type: "parrot"; content: string }
    | { id: string; type: "draft"; draft: ParrotDraft; introMessage: string };

interface Session {
    id: string;
    title: string | null;
    created_at: string;
}

interface HistoryItem {
    role: "user" | "parrot";
    content: string;
}

const DRAFT_MARKER = "__parrot_draft";

function uid() {
    return Math.random().toString(36).slice(2);
}

function parseMessageContent(role: "user" | "parrot", rawContent: string): ChatEntry {
    if (role === "parrot") {
        try {
            const parsed = JSON.parse(rawContent);
            if (parsed[DRAFT_MARKER] === true) {
                return {
                    id: uid(),
                    type: "draft",
                    draft: parsed.draft as ParrotDraft,
                    introMessage: parsed.intro,
                };
            }
        } catch {
            // not JSON — plain text
        }
        return { id: uid(), type: "parrot", content: rawContent };
    }
    return { id: uid(), type: "user", content: rawContent };
}

function buildHistory(entries: ChatEntry[]): HistoryItem[] {
    return entries.map((e) => {
        if (e.type === "user") {
            return { role: "user" as const, content: e.content };
        }
        if (e.type === "parrot") {
            return { role: "parrot" as const, content: e.content };
        }
        // Draft entries: include the intro message so Parrot has full context for refinements
        return { role: "parrot" as const, content: e.introMessage };
    });
}

// ── Hamburger icon ─────────────────────────────────────────────────

function HamburgerLines({ color = "rgba(190,225,210,0.65)" }: { color?: string }) {
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

function makeParrotWelcome(name: string): ChatEntry {
    return {
        id: "parrot-welcome",
        type: "parrot",
        content: name
            ? `Hey ${name} — I'm Tango. What do you need to say, and who's it going to? Give me the situation and I'll ask a couple of quick questions. Then I'll put together a few options for you.`
            : "Hey — I'm Tango. What do you need to say, and who's it going to? Give me the situation and I'll ask a couple of quick questions. Then I'll put together a few options for you.",
    };
}

export default function ParrotPage() {
    const [entries, setEntries] = useState<ChatEntry[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [input, setInput] = useState("");
    const [parrotState, setParrotState] = useState<ParrotState>("idle");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [displayName, setDisplayName] = useState<string | null>(null);
    const displayNameRef = useRef<string>("");

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const supabase = createClient();

    // ── Derived state ──────────────────────────────────────────────

    const hasMessages = entries.length > 0;
    const isSending = parrotState === "thinking";
    // Dim the jungle when a draft just landed — focus attention on the card
    const lastEntryIsDraft = entries.length > 0 && entries[entries.length - 1].type === "draft";

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
            setEntries([makeParrotWelcome(displayName)]);
        }
    }, [displayName]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Load sessions ──────────────────────────────────────────────

    const loadSessions = useCallback(async () => {
        const { data } = await supabase
            .from("sessions")
            .select("id, title, created_at")
            .eq("engine", "parrot")
            .order("created_at", { ascending: false })
            .limit(40);
        if (data) setSessions(data);
    }, [supabase]);

    useEffect(() => { loadSessions(); }, [loadSessions]);

    // ── Auto-scroll ────────────────────────────────────────────────

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [entries, parrotState]);

    // ── Load a past session ────────────────────────────────────────

    const loadSession = useCallback(async (id: string) => {
        setSessionId(id);
        setEntries([]);
        setParrotState("idle");

        const { data: msgs } = await supabase
            .from("messages")
            .select("role, content, created_at")
            .eq("session_id", id)
            .order("created_at", { ascending: true });

        if (!msgs) return;
        setEntries(msgs.map((m) => parseMessageContent(m.role as "user" | "parrot", m.content)));
    }, [supabase]);

    // ── New session ────────────────────────────────────────────────

    const startNewSession = useCallback(() => {
        setSessionId(null);
        setEntries([makeParrotWelcome(displayNameRef.current)]);
        setParrotState("idle");
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    // ── Send message ───────────────────────────────────────────────

    const sendMessage = useCallback(async () => {
        const text = input.trim();
        if (!text || isSending) return;

        setInput("");
        setParrotState("thinking");

        const userEntry: ChatEntry = { id: uid(), type: "user", content: text };
        setEntries((prev) => [...prev, userEntry]);

        const history = buildHistory(entries);

        try {
            const res = await fetch("/api/parrot", {
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
                    { id: uid(), type: "parrot", content: err.error ?? "Something went wrong. Tango will be back shortly." },
                ]);
                setParrotState("idle");
                return;
            }

            const data = await res.json();

            if (!sessionId) {
                setSessionId(data.session_id);
                loadSessions();
            }

            // Parrot animates briefly when responding
            setParrotState("talking");
            setTimeout(() => setParrotState("idle"), 1800);

            if (data.response_type === "draft" && data.draft) {
                setEntries((prev) => [
                    ...prev,
                    { id: uid(), type: "draft", draft: data.draft as ParrotDraft, introMessage: data.message },
                ]);
            } else {
                setEntries((prev) => [...prev, { id: uid(), type: "parrot", content: data.message }]);
            }
        } catch {
            setEntries((prev) => [
                ...prev,
                { id: uid(), type: "parrot", content: "Something went wrong. Tango will be back shortly." },
            ]);
            setParrotState("idle");
        } finally {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [input, isSending, entries, sessionId, loadSessions]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // ── Render ─────────────────────────────────────────────────────

    return (
        <div className="relative h-screen overflow-hidden flex">
            <JungleBackground />

            {/* ── Background dim overlay — fades in when a draft is active ── */}
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 1,
                    background: "rgba(0,0,0,0.45)",
                    opacity: lastEntryIsDraft ? 1 : 0,
                    transition: "opacity 0.7s ease",
                    pointerEvents: "none",
                }}
            />

            <SessionSidebar
                sessions={sessions}
                activeSessionId={sessionId}
                onSelectSession={loadSession}
                onNewSession={startNewSession}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* ── LEFT PANEL — Parrot (hidden on mobile via CSS) ── */}
            <div className="bear-left-panel">
                {/* Sessions button — top-left of parrot panel */}
                <button
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open sessions"
                    style={{
                        position: "absolute",
                        top: "16px",
                        left: "16px",
                        background: "rgba(3,12,6,0.55)",
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

                {/* Parrot character */}
                <ParrotCharacter state={parrotState} size={240} />

                {/* Parrot name */}
                <span
                    style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "rgba(190,230,210,0.4)",
                    }}
                >
                    Tango
                </span>

                {/* Crafting label */}
                {parrotState === "thinking" && (
                    <span
                        style={{
                            fontSize: "0.8rem",
                            fontStyle: "italic",
                            color: "rgba(52,211,153,0.6)",
                            position: "absolute",
                            bottom: "28px",
                        }}
                    >
                        Tango is crafting…
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
                    background: "rgba(2,10,5,0.68)",
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
                        <HamburgerLines color="rgba(190,225,210,0.5)" />
                    </button>

                    <span
                        style={{
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "rgba(200,235,215,0.4)",
                            flex: 1,
                            textAlign: "center",
                        }}
                    >
                        {sessionId ? "Session" : "New conversation"}
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
                            color: "rgba(170,220,200,0.65)",
                            background: "rgba(170,220,200,0.06)",
                            border: "1px solid rgba(170,220,200,0.12)",
                            textDecoration: "none",
                            flexShrink: 0,
                            transition: "color 0.15s, background 0.15s, border-color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = "rgba(170,220,200,0.95)";
                            e.currentTarget.style.background = "rgba(170,220,200,0.12)";
                            e.currentTarget.style.borderColor = "rgba(170,220,200,0.25)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = "rgba(170,220,200,0.65)";
                            e.currentTarget.style.background = "rgba(170,220,200,0.06)";
                            e.currentTarget.style.borderColor = "rgba(170,220,200,0.12)";
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                            <path d="M7 18v-6h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                        </svg>
                    </a>
                </div>

                {/* Messages area */}
                <div
                    className="custom-scrollbar"
                    style={{
                        flex: 1,
                        overflowY: "auto",
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
                                    color: "rgba(170,215,190,0.35)",
                                    fontSize: "1rem",
                                    fontStyle: "italic",
                                    textAlign: "center",
                                    maxWidth: "260px",
                                    lineHeight: "1.6",
                                    margin: 0,
                                }}
                            >
                                What do you need to say?
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
                                if (entry.type === "parrot") {
                                    return <ChatMessage key={entry.id} role="parrot" content={entry.content} />;
                                }
                                return (
                                    <InlineDraftCard
                                        key={entry.id}
                                        draft={entry.draft}
                                        introMessage={entry.introMessage}
                                    />
                                );
                            })}

                            {/* Mobile-only thinking indicator — parrot panel is hidden on mobile */}
                            {isSending && (
                                <div
                                    className="bear-mobile-thinking"
                                    style={{
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "6px 4px",
                                        animation: "message-appear 0.3s ease-out both",
                                    }}
                                >
                                    <span style={{ color: "rgba(190,225,210,0.45)", fontSize: "0.85rem", fontStyle: "italic" }}>
                                        Tango is crafting
                                    </span>
                                    <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                                        {[0, 1, 2].map((i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    width: "5px",
                                                    height: "5px",
                                                    borderRadius: "50%",
                                                    background: "rgba(52,211,153,0.75)",
                                                    animation: "think-bounce 1.4s ease-in-out infinite",
                                                    animationDelay: `${i * 0.22}s`,
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

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
                            placeholder="What do you need to say?"
                            rows={1}
                            disabled={isSending}
                            className="no-scrollbar"
                            style={{
                                flex: 1,
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "14px",
                                padding: "12px 16px",
                                color: "rgba(215,245,228,0.95)",
                                fontSize: "0.9375rem",
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
                                    ? "rgba(52,211,153,0.9)"
                                    : "rgba(52,211,153,0.15)",
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
                                    stroke={input.trim() && !isSending ? "#042010" : "rgba(52,211,153,0.4)"}
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
