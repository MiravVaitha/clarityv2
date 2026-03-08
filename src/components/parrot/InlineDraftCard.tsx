"use client";

import { useState } from "react";
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

            {/* Draft body — scrollable */}
            <div
                className="no-scrollbar"
                style={{
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
            </div>
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
                    <div
                        style={{
                            display: "flex",
                            gap: "4px",
                            padding: "0 20px 0",
                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                            overflowX: "auto",
                        }}
                        className="no-scrollbar"
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
                    </div>

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
