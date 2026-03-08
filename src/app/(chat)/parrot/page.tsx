"use client";

// ── Parrot placeholder page ────────────────────────────────────────
// Phase 5 will replace this with the full Parrot Chat UI & Jungle Environment.
// The layout mirrors the Bear page structure so routing, auth protection,
// and the (chat) layout group are all confirmed working before Phase 5.

export default function ParrotPage() {
    return (
        <div
            style={{
                position: "relative",
                height: "100vh",
                overflow: "hidden",
                display: "flex",
                background: "linear-gradient(to bottom, #020705 0%, #040e08 30%, #061410 60%, #050c07 100%)",
            }}
        >
            {/* ── LEFT PANEL — Parrot placeholder ── */}
            <div
                className="bear-left-panel"
                style={{
                    // reuse bear-left-panel CSS class for consistent responsive behaviour
                }}
            >
                {/* Parrot silhouette placeholder */}
                <div
                    style={{
                        width: "200px",
                        height: "200px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.04)",
                        border: "2px dashed rgba(255,255,255,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" opacity="0.3">
                        {/* Simple parrot silhouette */}
                        <ellipse cx="40" cy="45" rx="22" ry="28" fill="#c8f0c8"/>
                        <ellipse cx="40" cy="22" rx="16" ry="16" fill="#c8f0c8"/>
                        <path d="M48 18 Q62 12 58 26 Q52 22 48 22 Z" fill="#c8f0c8"/>
                        <ellipse cx="35" cy="20" rx="3" ry="3.5" fill="#0a1a0a"/>
                        <ellipse cx="36" cy="19" rx="1" ry="1" fill="rgba(255,255,255,0.6)"/>
                        <path d="M34 28 Q40 32 46 28" stroke="#0a1a0a" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                        <path d="M28 58 Q22 68 18 72" stroke="#c8f0c8" strokeWidth="8" strokeLinecap="round"/>
                        <path d="M52 58 Q58 68 62 72" stroke="#c8f0c8" strokeWidth="8" strokeLinecap="round"/>
                    </svg>
                </div>

                <span
                    style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "rgba(200,230,200,0.3)",
                        marginTop: "8px",
                    }}
                >
                    Parrot
                </span>
            </div>

            {/* ── RIGHT PANEL — Coming soon ── */}
            <div
                style={{
                    flex: 1,
                    minWidth: 0,
                    position: "relative",
                    zIndex: 10,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(2,9,4,0.68)",
                    backdropFilter: "blur(18px)",
                    borderLeft: "1px solid rgba(255,255,255,0.05)",
                    gap: "12px",
                    padding: "32px",
                }}
            >
                <div
                    style={{
                        display: "inline-flex",
                        padding: "4px 12px",
                        borderRadius: "99px",
                        background: "rgba(134,239,172,0.1)",
                        border: "1px solid rgba(134,239,172,0.2)",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "rgba(134,239,172,0.7)",
                        marginBottom: "4px",
                    }}
                >
                    Coming in Phase 5
                </div>

                <h2
                    style={{
                        margin: 0,
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        color: "rgba(210,240,215,0.7)",
                        textAlign: "center",
                    }}
                >
                    Parrot is almost ready.
                </h2>

                <p
                    style={{
                        margin: 0,
                        fontSize: "0.9375rem",
                        color: "rgba(170,210,180,0.4)",
                        textAlign: "center",
                        maxWidth: "280px",
                        lineHeight: "1.65",
                        fontStyle: "italic",
                    }}
                >
                    Paste the message. Answer two questions.
                    <br />
                    Get three drafts — direct, warm, and whatever else it needs to be.
                </p>

                <a
                    href="/bear"
                    style={{
                        marginTop: "16px",
                        padding: "10px 20px",
                        borderRadius: "10px",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "rgba(200,225,210,0.6)",
                        fontSize: "0.875rem",
                        textDecoration: "none",
                        cursor: "pointer",
                    }}
                >
                    ← Back to Bear
                </a>
            </div>
        </div>
    );
}
