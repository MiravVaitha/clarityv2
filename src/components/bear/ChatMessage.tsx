"use client";

interface ChatMessageProps {
    role: "user" | "bear";
    content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
    const isUser = role === "user";

    return (
        <div
            className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
            style={{ animation: "message-appear 0.35s ease-out both" }}
        >
            <div
                style={{
                    maxWidth: "72%",
                    padding: "12px 16px",
                    borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: isUser
                        ? "rgba(251,191,36,0.18)"
                        : "rgba(10,28,12,0.72)",
                    border: isUser
                        ? "1px solid rgba(251,191,36,0.3)"
                        : "1px solid rgba(255,255,255,0.07)",
                    backdropFilter: "blur(8px)",
                    color: isUser ? "rgba(255,245,210,0.95)" : "rgba(220,240,225,0.92)",
                    fontSize: "0.9375rem",
                    lineHeight: "1.6",
                    letterSpacing: "0.01em",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                }}
            >
                {content}
            </div>
        </div>
    );
}
