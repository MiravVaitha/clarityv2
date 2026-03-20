"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ParrotDraft, ParrotDraftVersion } from "@/lib/parrotSchemas";

interface InlineDraftCardProps {
    draft: ParrotDraft;
    introMessage: string;
}

const DRAFT_TYPE_LABELS: Record<string, string> = {
    email: "Email",
    message: "Message",
    slack: "Slack",
    letter: "Letter",
    text: "Text",
    apology: "Apology",
    request: "Request",
    feedback: "Feedback",
    announcement: "Announcement",
    other: "Draft",
};

// ── Copy button ─────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const el = document.createElement("textarea");
            el.value = text;
            el.style.position = "fixed";
            el.style.opacity = "0";
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button
            onClick={handleCopy}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "5px 11px",
                borderRadius: "7px",
                background: copied ? "rgba(52,211,153,0.18)" : "rgba(255,255,255,0.07)",
                border: copied ? "1px solid rgba(52,211,153,0.35)" : "1px solid rgba(255,255,255,0.12)",
                color: copied ? "rgba(52,211,153,0.9)" : "rgba(190,220,210,0.65)",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.18s",
                flexShrink: 0,
                letterSpacing: "0.03em",
            }}
            aria-label="Copy draft"
        >
            {copied ? (
                <>
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="rgba(52,211,153,0.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Copied
                </>
            ) : (
                <>
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                        <path d="M4 4V2.5A1.5 1.5 0 0 1 5.5 1h4A1.5 1.5 0 0 1 11 2.5v4A1.5 1.5 0 0 1 9.5 8H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    Copy
                </>
            )}
        </button>
    );
}

// ── Vertical scroll hint ─────────────────────────────────────────────

function VScrollHint({
    children,
    className,
    contentStyle,
}: {
    children: React.ReactNode;
    className?: string;
    contentStyle?: React.CSSProperties;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollUp, setCanScrollUp] = useState(false);
    const [canScrollDown, setCanScrollDown] = useState(false);

    const check = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollUp(el.scrollTop > 5);
        setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 5);
    }, []);

    useEffect(() => {
        check();
        const t = setTimeout(check, 50);
        return () => clearTimeout(t);
    }, [check]);

    const scrollBy = (delta: number) => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollTop + delta,
            behavior: "smooth",
        });
    };

    return (
        <div style={{ position: "relative", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <style>{`@keyframes scroll-hint-down{0%,100%{transform:translateY(0)}50%{transform:translateY(3px)}}@keyframes scroll-hint-up{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}@keyframes scroll-hint-right{0%,100%{transform:translateX(0)}50%{transform:translateX(3px)}}@keyframes scroll-hint-left{0%,100%{transform:translateX(0)}50%{transform:translateX(-3px)}}.scroll-hint-btn:hover{opacity:1!important}`}</style>
            <div
                ref={scrollRef}
                className={className}
                style={contentStyle}
                onScroll={check}
            >
                {children}
            </div>
            {/* Top fade + up arrow */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "28px",
                    background: "linear-gradient(to bottom, rgba(5,22,10,0.95), transparent)",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    pointerEvents: "none",
                    opacity: canScrollUp ? 1 : 0,
                    transition: "opacity 0.25s",
                }}
            >
                <button
                    className="scroll-hint-btn"
                    onClick={() => scrollBy(-80)}
                    style={{
                        pointerEvents: canScrollUp ? "auto" : "none",
                        background: "none",
                        border: "none",
                        padding: "6px",
                        cursor: "pointer",
                        marginTop: "2px",
                        opacity: 0.7,
                        transition: "opacity 0.18s",
                        animation: canScrollUp ? "scroll-hint-up 2s ease-in-out infinite" : "none",
                    }}
                    aria-label="Scroll up"
                    tabIndex={-1}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 10l4-4 4 4" stroke="rgba(52,211,153,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>
            {/* Bottom fade + down arrow */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "28px",
                    background: "linear-gradient(to top, rgba(5,22,10,0.95), transparent)",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    pointerEvents: "none",
                    opacity: canScrollDown ? 1 : 0,
                    transition: "opacity 0.25s",
                }}
            >
                <button
                    className="scroll-hint-btn"
                    onClick={() => scrollBy(80)}
                    style={{
                        pointerEvents: canScrollDown ? "auto" : "none",
                        background: "none",
                        border: "none",
                        padding: "6px",
                        cursor: "pointer",
                        marginBottom: "2px",
                        opacity: 0.7,
                        transition: "opacity 0.18s",
                        animation: canScrollDown ? "scroll-hint-down 2s ease-in-out infinite" : "none",
                    }}
                    aria-label="Scroll down"
                    tabIndex={-1}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6l4 4 4-4" stroke="rgba(52,211,153,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    );
}

// ── Horizontal scroll hint ───────────────────────────────────────────

function HScrollHint({
    children,
    className,
    contentStyle,
}: {
    children: React.ReactNode;
    className?: string;
    contentStyle?: React.CSSProperties;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const check = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 5);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
    }, []);

    useEffect(() => {
        check();
        const t = setTimeout(check, 50);
        return () => clearTimeout(t);
    }, [check]);

    const scrollBy = (delta: number) => {
        scrollRef.current?.scrollTo({
            left: scrollRef.current.scrollLeft + delta,
            behavior: "smooth",
        });
    };

    return (
        <div style={{ position: "relative" }}>
            <div
                ref={scrollRef}
                className={className}
                style={contentStyle}
                onScroll={check}
            >
                {children}
            </div>
            {/* Left fade + arrow */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: "20px",
                    background: "linear-gradient(to right, rgba(5,22,10,0.95), transparent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    pointerEvents: "none",
                    opacity: canScrollLeft ? 1 : 0,
                    transition: "opacity 0.25s",
                }}
            >
                <button
                    className="scroll-hint-btn"
                    onClick={() => scrollBy(-100)}
                    style={{
                        pointerEvents: canScrollLeft ? "auto" : "none",
                        background: "none",
                        border: "none",
                        padding: "6px",
                        cursor: "pointer",
                        opacity: 0.7,
                        transition: "opacity 0.18s",
                        animation: canScrollLeft ? "scroll-hint-left 2s ease-in-out infinite" : "none",
                    }}
                    aria-label="Scroll left"
                    tabIndex={-1}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 4l-4 4 4 4" stroke="rgba(52,211,153,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>
            {/* Right fade + arrow */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    right: 0,
                    width: "20px",
                    background: "linear-gradient(to left, rgba(5,22,10,0.95), transparent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    pointerEvents: "none",
                    opacity: canScrollRight ? 1 : 0,
                    transition: "opacity 0.25s",
                }}
            >
                <button
                    className="scroll-hint-btn"
                    onClick={() => scrollBy(100)}
                    style={{
                        pointerEvents: canScrollRight ? "auto" : "none",
                        background: "none",
                        border: "none",
                        padding: "6px",
                        cursor: "pointer",
                        opacity: 0.7,
                        transition: "opacity 0.18s",
                        animation: canScrollRight ? "scroll-hint-right 2s ease-in-out infinite" : "none",
                    }}
                    aria-label="Scroll right"
                    tabIndex={-1}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 4l4 4-4 4" stroke="rgba(52,211,153,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    );
}

// ── Version content ─────────────────────────────────────────────────

function VersionContent({ version, subject }: { version: ParrotDraftVersion; subject?: string }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Subject line — email only */}
            {subject && (
                <div
                    style={{
                        marginBottom: "12px",
                        paddingBottom: "10px",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                >
                    <span
                        style={{
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "rgba(52,211,153,0.55)",
                            display: "block",
                            marginBottom: "3px",
                        }}
                    >
                        Subject
                    </span>
                    <span
                        style={{
                            fontSize: "0.875rem",
                            color: "rgba(215,245,230,0.85)",
                            fontWeight: 500,
                        }}
                    >
                        {subject}
                    </span>
                </div>
            )}

            {/* Draft body — scrollable with hint arrows */}
            <VScrollHint
                className="no-scrollbar"
                contentStyle={{
                    flex: 1,
                    overflowY: "auto",
                    fontSize: "0.9rem",
                    lineHeight: "1.7",
                    color: "rgba(210,240,225,0.9)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    animation: "tab-slide-in 0.22s ease-out both",
                }}
            >
                {version.body}
            </VScrollHint>
        </div>
    );
}

// ── Main component ──────────────────────────────────────────────────

export default function InlineDraftCard({ draft, introMessage }: InlineDraftCardProps) {
    const [activeTab, setActiveTab] = useState(0);

    const typeLabel = DRAFT_TYPE_LABELS[draft.draft_type] ?? "Draft";
    const activeVersion = draft.versions[activeTab];

    return (
        <div style={{ animation: "draft-appear 0.5s cubic-bezier(0.22,1,0.36,1) both" }}>
            {/* Parrot intro message */}
            <div
                style={{
                    color: "rgba(210,240,225,0.85)",
                    fontSize: "0.9375rem",
                    lineHeight: "1.6",
                    marginBottom: "14px",
                    paddingLeft: "2px",
                }}
            >
                {introMessage}
            </div>

            {/* Card stack container */}
            <div style={{ position: "relative", maxWidth: "480px" }}>
                {/* Stack layer 2 (furthest back) */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(4,18,8,0.5)",
                        borderRadius: "16px",
                        border: "1px solid rgba(52,211,153,0.07)",
                        transform: "translateY(8px) translateX(6px) rotate(1.5deg)",
                    }}
                />
                {/* Stack layer 1 */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(4,18,8,0.65)",
                        borderRadius: "16px",
                        border: "1px solid rgba(52,211,153,0.11)",
                        transform: "translateY(4px) translateX(3px) rotate(0.7deg)",
                    }}
                />

                {/* Main card */}
                <div
                    style={{
                        position: "relative",
                        background: "rgba(5,22,10,0.94)",
                        borderRadius: "16px",
                        border: "1px solid rgba(52,211,153,0.22)",
                        boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(52,211,153,0.06)",
                        backdropFilter: "blur(16px)",
                        overflow: "hidden",
                    }}
                >
                    {/* ── Card header ── */}
                    <div
                        style={{
                            padding: "16px 20px 0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "12px",
                        }}
                    >
                        {/* Draft type badge */}
                        <span
                            style={{
                                padding: "3px 10px",
                                borderRadius: "99px",
                                background: "rgba(52,211,153,0.13)",
                                border: "1px solid rgba(52,211,153,0.28)",
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                color: "rgba(52,211,153,0.85)",
                            }}
                        >
                            {typeLabel}
                        </span>

                        {/* Version count */}
                        <span
                            style={{
                                fontSize: "0.72rem",
                                color: "rgba(130,175,155,0.5)",
                                fontVariantNumeric: "tabular-nums",
                            }}
                        >
                            {draft.versions.length} versions
                        </span>
                    </div>

                    {/* ── Tab bar ── */}
                    <HScrollHint
                        className="no-scrollbar"
                        contentStyle={{
                            display: "flex",
                            gap: "4px",
                            padding: "0 20px 0",
                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                            overflowX: "auto",
                        }}
                    >
                        {draft.versions.map((version, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveTab(i)}
                                style={{
                                    padding: "8px 14px",
                                    borderRadius: "8px 8px 0 0",
                                    border: "none",
                                    borderBottom: activeTab === i
                                        ? "2px solid rgba(52,211,153,0.85)"
                                        : "2px solid transparent",
                                    background: "none",
                                    color: activeTab === i
                                        ? "rgba(52,211,153,0.92)"
                                        : "rgba(160,200,180,0.5)",
                                    fontSize: "0.8125rem",
                                    fontWeight: activeTab === i ? 700 : 500,
                                    cursor: "pointer",
                                    transition: "all 0.18s",
                                    whiteSpace: "nowrap",
                                    letterSpacing: "0.02em",
                                    flexShrink: 0,
                                }}
                            >
                                {version.label}
                            </button>
                        ))}
                    </HScrollHint>

                    {/* ── Draft body — fixed height ── */}
                    <div
                        style={{
                            height: "220px",
                            padding: "16px 20px 0",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <VersionContent
                            key={activeTab}
                            version={activeVersion}
                            subject={draft.draft_type === "email" ? draft.subject : undefined}
                        />
                    </div>

                    {/* ── Tone note ── */}
                    <div
                        style={{
                            margin: "10px 20px 0",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            background: "rgba(52,211,153,0.06)",
                            border: "1px solid rgba(52,211,153,0.12)",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "0.65rem",
                                fontWeight: 700,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                color: "rgba(52,211,153,0.55)",
                                display: "block",
                                marginBottom: "3px",
                            }}
                        >
                            Why this works
                        </span>
                        <p
                            style={{
                                margin: 0,
                                fontSize: "0.82rem",
                                color: "rgba(180,220,200,0.7)",
                                lineHeight: "1.5",
                                fontStyle: "italic",
                            }}
                        >
                            {activeVersion.tone_note}
                        </p>
                    </div>

                    {/* ── Footer: Copy button + delivery tips ── */}
                    <div
                        style={{
                            padding: "12px 20px 16px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                        }}
                    >
                        {/* Copy button row */}
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <CopyButton text={
                                draft.draft_type === "email" && draft.subject
                                    ? `Subject: ${draft.subject}\n\n${activeVersion.body}`
                                    : activeVersion.body
                            } />
                        </div>

                        {/* Delivery tips */}
                        {draft.delivery_tips && draft.delivery_tips.length > 0 && (
                            <div
                                style={{
                                    paddingTop: "10px",
                                    borderTop: "1px solid rgba(255,255,255,0.05)",
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "0.65rem",
                                        fontWeight: 700,
                                        letterSpacing: "0.1em",
                                        textTransform: "uppercase",
                                        color: "rgba(52,211,153,0.45)",
                                        display: "block",
                                        marginBottom: "6px",
                                    }}
                                >
                                    Delivery tips
                                </span>
                                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "5px" }}>
                                    {draft.delivery_tips.map((tip, i) => (
                                        <li
                                            key={i}
                                            style={{
                                                display: "flex",
                                                gap: "8px",
                                                alignItems: "flex-start",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color: "rgba(52,211,153,0.5)",
                                                    fontWeight: 700,
                                                    flexShrink: 0,
                                                    marginTop: "1px",
                                                    fontSize: "0.8rem",
                                                }}
                                            >
                                                →
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: "0.82rem",
                                                    color: "rgba(165,210,185,0.65)",
                                                    lineHeight: "1.5",
                                                }}
                                            >
                                                {tip}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
