"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ConfirmationModal from "@/components/ConfirmationModal";
import type { User } from "@supabase/supabase-js";

export default function AccountPage() {
    const router = useRouter();
    const supabase = createClient();
    const [user, setUser] = useState<User | null>(null);
    const [displayName, setDisplayName] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ text: string; ok: boolean } | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) { router.push("/login"); return; }
            setUser(user);
            setDisplayName(user.user_metadata?.display_name || "");
        });
    }, []);

    const handleUpdateName = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaveMessage(null);
        const { error } = await supabase.auth.updateUser({ data: { display_name: displayName } });
        if (!error) {
            await supabase.from("profiles").update({ display_name: displayName }).eq("id", user!.id);
            setSaveMessage({ text: "Name saved.", ok: true });
        } else {
            setSaveMessage({ text: "Something went wrong.", ok: false });
        }
        setSaving(false);
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        setDeleteError(null);
        try {
            const res = await fetch("/api/delete-account", { method: "POST" });
            const data = await res.json();
            if (!res.ok) {
                setDeleteError(data.error || "Deletion failed.");
                setIsDeleting(false);
                setIsDeleteModalOpen(false);
                return;
            }
            // Success — push to login
            router.push("/login");
        } catch {
            setDeleteError("Network error. Please try again.");
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    if (!user) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center"
            style={{
                background: "linear-gradient(135deg, #020a04 0%, #031206 40%, #020905 70%, #010703 100%)",
                zIndex: 0,
            }}
        >
            {/* Ambient glow */}
            <div style={{
                position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
                width: "600px", height: "400px",
                background: "radial-gradient(ellipse at 50% 40%, rgba(52,211,153,0.07) 0%, rgba(251,191,36,0.04) 50%, transparent 70%)",
                pointerEvents: "none",
            }} />

            {/* Back to Home */}
            <Link
                href="/home"
                style={{
                    position: "absolute",
                    top: "28px",
                    left: "28px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.78rem",
                    color: "rgba(175,215,198,0.45)",
                    textDecoration: "none",
                    letterSpacing: "0.04em",
                    transition: "color 0.18s",
                    zIndex: 10,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(175,215,198,0.9)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(175,215,198,0.45)")}
            >
                ← Home
            </Link>

            {/* Card */}
            <div style={{
                width: "360px",
                maxWidth: "calc(100vw - 48px)",
                background: "rgba(3,12,6,0.88)",
                backdropFilter: "blur(28px)",
                WebkitBackdropFilter: "blur(28px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "22px",
                padding: "32px 30px 28px",
                boxShadow: "0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
                position: "relative",
            }}>
                {/* Header */}
                <h1 style={{
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    color: "rgba(225,240,232,0.92)",
                    marginBottom: "4px",
                    letterSpacing: "-0.01em",
                }}>
                    Account
                </h1>
                <p style={{
                    fontSize: "0.78rem",
                    color: "rgba(160,205,180,0.4)",
                    marginBottom: "28px",
                    letterSpacing: "0.01em",
                }}>
                    {user.email}
                </p>

                {/* Display Name Form */}
                <form onSubmit={handleUpdateName} style={{ marginBottom: "24px" }}>
                    <label style={{
                        display: "block",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "rgba(160,205,180,0.45)",
                        marginBottom: "8px",
                    }}>
                        Display Name
                    </label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        style={{
                            display: "block",
                            width: "100%",
                            padding: "11px 14px",
                            borderRadius: "12px",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.09)",
                            color: "rgba(225,240,232,0.88)",
                            fontSize: "0.875rem",
                            outline: "none",
                            transition: "border-color 0.18s",
                            marginBottom: "10px",
                            boxSizing: "border-box",
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(52,211,153,0.35)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
                    />
                    {saveMessage && (
                        <p style={{
                            fontSize: "0.75rem",
                            color: saveMessage.ok ? "rgba(52,211,153,0.75)" : "rgba(248,113,113,0.75)",
                            marginBottom: "8px",
                        }}>
                            {saveMessage.text}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={saving}
                        style={{
                            width: "100%",
                            padding: "11px 18px",
                            borderRadius: "12px",
                            background: saving ? "rgba(52,211,153,0.4)" : "rgba(52,211,153,0.82)",
                            border: "none",
                            color: "rgba(2,20,10,0.95)",
                            fontWeight: 700,
                            fontSize: "0.875rem",
                            letterSpacing: "0.02em",
                            cursor: saving ? "not-allowed" : "pointer",
                            transition: "background 0.18s",
                        }}
                        onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "rgba(52,211,153,1)"; }}
                        onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = "rgba(52,211,153,0.82)"; }}
                    >
                        {saving ? "Saving…" : "Save Changes"}
                    </button>
                </form>

                {/* Divider */}
                <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", marginBottom: "20px" }} />

                {/* Sign out */}
                <button
                    onClick={async () => {
                        await supabase.auth.signOut();
                        router.push("/login");
                    }}
                    style={{
                        display: "block",
                        width: "100%",
                        padding: "11px 18px",
                        borderRadius: "12px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.09)",
                        color: "rgba(175,215,198,0.6)",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        letterSpacing: "0.02em",
                        cursor: "pointer",
                        marginBottom: "10px",
                        transition: "all 0.18s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.color = "rgba(175,215,198,0.9)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                        e.currentTarget.style.color = "rgba(175,215,198,0.6)";
                    }}
                >
                    Sign Out
                </button>

                {/* Delete error */}
                {deleteError && (
                    <p style={{
                        fontSize: "0.72rem",
                        color: "rgba(248,113,113,0.75)",
                        marginBottom: "6px",
                        textAlign: "center",
                    }}>
                        {deleteError}
                    </p>
                )}

                {/* Delete account */}
                <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    style={{
                        display: "block",
                        width: "100%",
                        padding: "9px 18px",
                        background: "none",
                        border: "none",
                        color: "rgba(248,113,113,0.35)",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        letterSpacing: "0.02em",
                        cursor: "pointer",
                        transition: "color 0.18s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(248,113,113,0.75)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(248,113,113,0.35)")}
                >
                    Delete account and all data
                </button>
            </div>

            {/* Delete confirmation modal */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                title="Delete your account?"
                message={isDeleting
                    ? "Deleting your account…"
                    : "This will permanently erase your account and all data. Zulu and Tango won't remember you. This cannot be undone."}
                confirmLabel={isDeleting ? "Deleting…" : "Delete forever"}
                cancelLabel="Keep account"
                onConfirm={handleDeleteAccount}
                onCancel={() => { if (!isDeleting) setIsDeleteModalOpen(false); }}
                variant="destructive"
            />
        </div>
    );
}
