"use client";

import React from "react";

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: "default" | "destructive";
}

export default function ConfirmationModal({
    isOpen,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Stay",
    onConfirm,
    onCancel,
    variant = "default",
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 transition-opacity"
                style={{ background: "rgba(1,8,3,0.72)", backdropFilter: "blur(6px)" }}
                onClick={onCancel}
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-sm animate-in fade-in zoom-in-95 duration-200"
                style={{
                    background: "rgba(3,14,7,0.96)",
                    backdropFilter: "blur(28px)",
                    WebkitBackdropFilter: "blur(28px)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: "20px",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.04)",
                    padding: "28px 28px 24px",
                }}
            >
                <h3 style={{
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "rgba(225,240,232,0.92)",
                    marginBottom: "8px",
                    letterSpacing: "-0.01em",
                }}>
                    {title}
                </h3>
                <p style={{
                    fontSize: "0.82rem",
                    color: "rgba(160,205,180,0.52)",
                    lineHeight: 1.6,
                    marginBottom: "26px",
                }}>
                    {message}
                </p>

                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 1,
                            padding: "11px 16px",
                            borderRadius: "12px",
                            fontWeight: 700,
                            fontSize: "0.83rem",
                            border: "none",
                            letterSpacing: "0.01em",
                            transition: "all 0.18s",
                            background: variant === "destructive"
                                ? "rgba(180,30,30,0.72)"
                                : "rgba(52,211,153,0.72)",
                            color: variant === "destructive"
                                ? "rgba(255,200,200,0.95)"
                                : "rgba(2,20,10,0.95)",
                            boxShadow: variant === "destructive"
                                ? "0 0 18px rgba(180,30,30,0.25)"
                                : "0 0 18px rgba(52,211,153,0.2)",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = variant === "destructive"
                                ? "rgba(200,35,35,0.88)"
                                : "rgba(52,211,153,0.88)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = variant === "destructive"
                                ? "rgba(180,30,30,0.72)"
                                : "rgba(52,211,153,0.72)";
                        }}
                    >
                        {confirmLabel}
                    </button>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: "11px 16px",
                            borderRadius: "12px",
                            fontWeight: 600,
                            fontSize: "0.83rem",
                            border: "1px solid rgba(255,255,255,0.09)",
                            background: "rgba(255,255,255,0.05)",
                            color: "rgba(175,215,198,0.6)",
                            letterSpacing: "0.01em",
                            transition: "all 0.18s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.09)";
                            e.currentTarget.style.color = "rgba(175,215,198,0.9)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                            e.currentTarget.style.color = "rgba(175,215,198,0.6)";
                        }}
                    >
                        {cancelLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
