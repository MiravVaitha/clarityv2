"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ClarifyOutput } from "@/lib/schemas";

interface InlineClarityCardProps {
    cardType: "decision" | "plan" | "overwhelm" | "message_prep";
    card: ClarifyOutput;
    introMessage: string;
}

const CARD_TYPE_LABELS: Record<string, string> = {
    decision: "Decision",
    plan: "Plan",
    overwhelm: "Overwhelm",
    message_prep: "Message Prep",
};

// ── Section types ───────────────────────────────────────────────────

type Section =
    | { kind: "text"; title: string; body: string }
    | { kind: "list"; title: string; items: string[] }
    | { kind: "options"; title: string; options: NonNullable<ClarifyOutput["options"]> }
    | { kind: "outline"; title: string; outline: NonNullable<ClarifyOutput["structure_outline"]> };

function buildSections(cardType: string, card: ClarifyOutput): Section[] {
    const sections: Section[] = [];

    // Core issue — always first
    sections.push({ kind: "text", title: "What's going on", body: card.core_issue });

    // Sharp question — always second
    if (card.one_sharp_question) {
        sections.push({ kind: "text", title: "The question to sit with", body: card.one_sharp_question });
    }

    if (cardType === "decision") {
        if (card.options?.length) {
            sections.push({ kind: "options", title: "Your options", options: card.options });
        }
        if (card.decision_levers?.length) {
            sections.push({ kind: "list", title: "What matters most", items: card.decision_levers });
        }
        if (card.tradeoffs?.length) {
            sections.push({ kind: "list", title: "Tradeoffs", items: card.tradeoffs });
        }
        if (card.next_steps_14_days?.length) {
            sections.push({ kind: "list", title: "Next 14 days", items: card.next_steps_14_days });
        }
    }

    if (cardType === "plan") {
        if (card.hidden_assumptions?.length) {
            sections.push({ kind: "list", title: "Key milestones", items: card.hidden_assumptions });
        }
        if (card.next_steps_14_days?.length) {
            sections.push({ kind: "list", title: "Next 14 days", items: card.next_steps_14_days });
        }
        if (card.tradeoffs?.length) {
            sections.push({ kind: "list", title: "Risks to watch", items: card.tradeoffs });
        }
        if (card.decision_levers?.length) {
            sections.push({ kind: "list", title: "Success looks like", items: card.decision_levers });
        }
    }

    if (cardType === "overwhelm") {
        if (card.top_3_priorities_today?.length) {
            sections.push({ kind: "list", title: "Focus on today", items: card.top_3_priorities_today });
        }
        if (card.top_3_defer_or_ignore?.length) {
            sections.push({ kind: "list", title: "Defer or drop", items: card.top_3_defer_or_ignore });
        }
        if (card.next_10_minutes) {
            sections.push({ kind: "text", title: "Do this right now", body: card.next_10_minutes });
        }
        if (card.next_24_hours) {
            sections.push({ kind: "text", title: "By tomorrow", body: card.next_24_hours });
        }
        if (card.constraint_or_boundary) {
            sections.push({ kind: "text", title: "Protect this", body: card.constraint_or_boundary });
        }
    }

    if (cardType === "message_prep") {
        if (card.purpose_outcome) {
            sections.push({ kind: "text", title: "Goal", body: card.purpose_outcome });
        }
        if (card.key_points?.length) {
            sections.push({ kind: "list", title: "Key points", items: card.key_points });
        }
        if (card.structure_outline) {
            sections.push({ kind: "outline", title: "Structure", outline: card.structure_outline });
        }
        if (card.likely_questions_or_objections?.length) {
            sections.push({ kind: "list", title: "Likely questions", items: card.likely_questions_or_objections });
        }
        if (card.rehearsal_checklist?.length) {
            sections.push({ kind: "list", title: "Prepare", items: card.rehearsal_checklist });
        }
    }

    if (card.refining_questions?.length) {
        sections.push({ kind: "list", title: "To go deeper", items: card.refining_questions });
    }

    return sections;
}

// ── Section renderers ───────────────────────────────────────────────

function SectionContent({ section }: { section: Section }) {
    const bodyStyle: React.CSSProperties = {
        color: "rgba(215,238,222,0.92)",
        fontSize: "1rem",
        lineHeight: "1.65",
        margin: 0,
    };

    if (section.kind === "text") {
        return <p style={bodyStyle}>{section.body}</p>;
    }

    if (section.kind === "list") {
        return (
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                {section.items.map((item, i) => (
                    <li key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                        <span style={{ color: "rgba(251,191,36,0.6)", fontWeight: 700, flexShrink: 0, marginTop: "2px" }}>—</span>
                        <span style={{ ...bodyStyle, fontSize: "0.9375rem" }}>{item}</span>
                    </li>
                ))}
            </ul>
        );
    }

    if (section.kind === "options") {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {section.options.map((opt, i) => (
                    <div
                        key={i}
                        style={{
                            background: "rgba(255,255,255,0.04)",
                            borderRadius: "10px",
                            padding: "12px 14px",
                            border: "1px solid rgba(255,255,255,0.07)",
                        }}
                    >
                        <div style={{ fontWeight: 600, color: "rgba(225,245,230,0.95)", marginBottom: "4px", fontSize: "0.9375rem" }}>
                            {opt.option}
                        </div>
                        <div style={{ color: "rgba(180,210,190,0.75)", fontSize: "0.85rem", lineHeight: "1.5" }}>
                            {opt.why}
                        </div>
                        {opt.when_it_wins && (
                            <div style={{ color: "rgba(251,191,36,0.6)", fontSize: "0.8rem", fontStyle: "italic", marginTop: "4px" }}>
                                Best when: {opt.when_it_wins}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    if (section.kind === "outline") {
        const { outline } = section;
        const bodyItems = Array.isArray(outline.body) ? outline.body : [outline.body];
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                    { label: "Open", text: outline.opening },
                    ...bodyItems.map((b) => ({ label: "Body", text: b })),
                    { label: "Close", text: outline.close },
                ].map((row, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                        <span style={{ color: "rgba(251,191,36,0.65)", fontWeight: 700, fontSize: "0.8rem", minWidth: "42px", paddingTop: "2px" }}>
                            {row.label}
                        </span>
                        <span style={{ color: "rgba(210,235,215,0.85)", fontSize: "0.9rem", lineHeight: "1.55" }}>{row.text}</span>
                    </div>
                ))}
            </div>
        );
    }

    return null;
}

// ── Scroll hint overlay ──────────────────────────────────────────────

function ScrollHint({
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
            <style>{`@keyframes scroll-hint-down{0%,100%{transform:translateY(0)}50%{transform:translateY(3px)}}@keyframes scroll-hint-up{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}.scroll-hint-btn:hover{opacity:1!important}`}</style>
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
                    background: "linear-gradient(to bottom, rgba(10,26,12,0.95), transparent)",
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
                        <path d="M4 10l4-4 4 4" stroke="rgba(251,191,36,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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
                    background: "linear-gradient(to top, rgba(10,26,12,0.95), transparent)",
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
                        <path d="M4 6l4 4 4-4" stroke="rgba(251,191,36,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    );
}

// ── Main component ──────────────────────────────────────────────────

export default function InlineClarityCard({ cardType, card, introMessage }: InlineClarityCardProps) {
    const sections = buildSections(cardType, card);
    const [current, setCurrent] = useState(0);
    const [slideKey, setSlideKey] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 767px)");
        setIsMobile(mq.matches);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    const goTo = (index: number) => {
        setCurrent(index);
        setSlideKey((k) => k + 1);
    };

    const section = sections[current];
    const label = CARD_TYPE_LABELS[cardType] ?? cardType;

    return (
        <div style={{ animation: "card-appear 0.5s cubic-bezier(0.22,1,0.36,1) both" }}>
            {/* Bear intro message */}
            <div
                style={{
                    color: "rgba(215,238,222,0.85)",
                    fontSize: "0.9375rem",
                    lineHeight: "1.6",
                    marginBottom: "14px",
                    paddingLeft: "2px",
                }}
            >
                {introMessage}
            </div>

            {/* Card stack container */}
            <div style={{ position: "relative", maxWidth: "460px" }}>
                {/* Stack layer 2 (furthest back) */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(8,22,10,0.55)",
                        borderRadius: "16px",
                        border: "1px solid rgba(251,191,36,0.08)",
                        transform: "translateY(8px) translateX(6px) rotate(1.5deg)",
                    }}
                />
                {/* Stack layer 1 */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(8,22,10,0.7)",
                        borderRadius: "16px",
                        border: "1px solid rgba(251,191,36,0.12)",
                        transform: "translateY(4px) translateX(3px) rotate(0.7deg)",
                    }}
                />

                {/* Main card */}
                <div
                    style={{
                        position: "relative",
                        background: "rgba(10,26,12,0.92)",
                        borderRadius: "16px",
                        border: "1px solid rgba(251,191,36,0.22)",
                        boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(251,191,36,0.07)",
                        backdropFilter: "blur(16px)",
                        padding: "20px 22px 18px",
                        minHeight: isMobile ? "150px" : "180px",
                        maxHeight: isMobile ? "320px" : "420px",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* Top row: badge + progress */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                        <span
                            style={{
                                padding: "3px 10px",
                                borderRadius: "99px",
                                background: "rgba(251,191,36,0.13)",
                                border: "1px solid rgba(251,191,36,0.28)",
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                color: "rgba(251,191,36,0.85)",
                            }}
                        >
                            {label}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "rgba(150,180,160,0.55)", fontVariantNumeric: "tabular-nums" }}>
                            {current + 1} / {sections.length}
                        </span>
                    </div>

                    {/* Section title */}
                    <div
                        style={{
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "rgba(251,191,36,0.6)",
                            marginBottom: "10px",
                        }}
                    >
                        {section.title}
                    </div>

                    {/* Section content — scrolls internally with hint arrows */}
                    <ScrollHint
                        key={slideKey}
                        className="no-scrollbar"
                        contentStyle={{
                            flex: 1,
                            overflowY: "auto",
                            animation: "card-slide-in 0.28s ease-out both",
                        }}
                    >
                        <SectionContent section={section} />
                    </ScrollHint>

                    {/* Navigation */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: "20px",
                            paddingTop: "14px",
                            borderTop: "1px solid rgba(255,255,255,0.06)",
                        }}
                    >
                        <button
                            onClick={() => goTo(current - 1)}
                            disabled={current === 0}
                            style={{
                                background: "none",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "8px",
                                padding: "6px 14px",
                                color: current === 0 ? "rgba(255,255,255,0.18)" : "rgba(200,225,210,0.75)",
                                cursor: current === 0 ? "not-allowed" : "pointer",
                                fontSize: "0.875rem",
                                transition: "all 0.15s",
                            }}
                        >
                            ← Back
                        </button>

                        {/* Progress dots */}
                        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                            {sections.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goTo(i)}
                                    style={{
                                        width: i === current ? "16px" : "6px",
                                        height: "6px",
                                        borderRadius: "3px",
                                        background: i === current
                                            ? "rgba(251,191,36,0.85)"
                                            : "rgba(255,255,255,0.2)",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: 0,
                                        transition: "all 0.2s",
                                    }}
                                    aria-label={`Go to section ${i + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={() => goTo(current + 1)}
                            disabled={current === sections.length - 1}
                            style={{
                                background: current === sections.length - 1
                                    ? "rgba(251,191,36,0.1)"
                                    : "rgba(251,191,36,0.85)",
                                border: "none",
                                borderRadius: "8px",
                                padding: "6px 14px",
                                color: current === sections.length - 1
                                    ? "rgba(251,191,36,0.35)"
                                    : "#1a0f06",
                                cursor: current === sections.length - 1 ? "not-allowed" : "pointer",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                transition: "all 0.15s",
                            }}
                        >
                            Next →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
