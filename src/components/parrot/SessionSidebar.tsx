"use client";

interface Session {
    id: string;
    title: string | null;
    created_at: string;
}

interface SessionSidebarProps {
    sessions: Session[];
    activeSessionId: string | null;
    onSelectSession: (id: string) => void;
    onNewSession: () => void;
    isOpen: boolean;
    onClose: () => void;
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function SessionSidebar({
    sessions,
    activeSessionId,
    onSelectSession,
    onNewSession,
    isOpen,
    onClose,
}: SessionSidebarProps) {
    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-20"
                    onClick={onClose}
                    style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)" }}
                />
            )}

            {/* Sidebar panel */}
            <div
                className="fixed top-0 left-0 h-full z-30 flex flex-col"
                style={{
                    width: "280px",
                    background: "rgba(3,12,6,0.97)",
                    borderRight: "1px solid rgba(255,255,255,0.07)",
                    transform: isOpen ? "translateX(0)" : "translateX(-100%)",
                    transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
                    boxShadow: isOpen ? "4px 0 32px rgba(0,0,0,0.6)" : "none",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: "20px 20px 14px",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <span
                        style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "rgba(52,211,153,0.7)",
                        }}
                    >
                        Sessions
                    </span>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "rgba(200,230,215,0.5)",
                            fontSize: "1.1rem",
                            lineHeight: 1,
                            padding: "2px",
                        }}
                        aria-label="Close sidebar"
                    >
                        ✕
                    </button>
                </div>

                {/* New session button */}
                <div style={{ padding: "12px 16px" }}>
                    <button
                        onClick={() => { onNewSession(); onClose(); }}
                        style={{
                            width: "100%",
                            padding: "9px 14px",
                            borderRadius: "10px",
                            background: "rgba(52,211,153,0.11)",
                            border: "1px solid rgba(52,211,153,0.25)",
                            color: "rgba(52,211,153,0.9)",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            textAlign: "left",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <span style={{ fontSize: "1rem" }}>+</span>
                        New conversation
                    </button>
                </div>

                {/* Session list */}
                <div className="custom-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "0 8px 16px" }}>
                    {sessions.length === 0 ? (
                        <p
                            style={{
                                padding: "16px",
                                color: "rgba(170,210,190,0.4)",
                                fontSize: "0.8125rem",
                                textAlign: "center",
                            }}
                        >
                            No past sessions yet
                        </p>
                    ) : (
                        sessions.map((s) => {
                            const isActive = s.id === activeSessionId;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => { onSelectSession(s.id); onClose(); }}
                                    style={{
                                        width: "100%",
                                        padding: "10px 12px",
                                        borderRadius: "8px",
                                        background: isActive ? "rgba(52,211,153,0.09)" : "transparent",
                                        border: isActive
                                            ? "1px solid rgba(52,211,153,0.2)"
                                            : "1px solid transparent",
                                        color: isActive ? "rgba(220,248,238,0.95)" : "rgba(190,225,210,0.72)",
                                        fontSize: "0.8125rem",
                                        cursor: "pointer",
                                        textAlign: "left",
                                        marginBottom: "2px",
                                        lineHeight: "1.4",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight: isActive ? 600 : 400,
                                            marginBottom: "2px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {s.title ?? "Untitled session"}
                                    </div>
                                    <div style={{ color: "rgba(130,180,160,0.5)", fontSize: "0.75rem" }}>
                                        {formatDate(s.created_at)}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
}
