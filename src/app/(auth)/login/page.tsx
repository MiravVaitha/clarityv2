"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { BearForest, ParrotForest } from "@/components/RiveForest";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup" | "forgot";

function EyeIcon({ open }: { open: boolean }) {
    return open ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
    );
}


const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: "11px",
    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(215,240,225,0.9)", fontSize: "1rem", outline: "none",
    fontFamily: "inherit",
} as const;

export default function Login() {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setLoading(true);

        if (mode === "forgot") {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
            });
            if (error) {
                setError(error.message);
            } else {
                setMessage("Check your email for a password reset link.");
            }
            setLoading(false);
            return;
        }

        if (mode === "signin") {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                setError(error.message);
            } else {
                router.push("/home");
                router.refresh();
            }
        } else {
            if (password !== confirmPassword) {
                setError("Passwords don't match.");
                setLoading(false);
                return;
            }
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { display_name: displayName || email.split("@")[0] },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) {
                setError(error.message);
            } else if (data.session) {
                router.push("/home");
                router.refresh();
            } else {
                setMessage("Check your email to confirm your account, then sign in.");
                setMode("signin");
            }
        }

        setLoading(false);
    };

    const switchMode = (next: Mode) => {
        setMode(next);
        setError(null);
        setMessage(null);
        setPassword("");
        setConfirmPassword("");
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    const submitLabel = loading ? "Please wait…"
        : mode === "signin" ? "Sign In"
        : mode === "signup" ? "Create Account"
        : "Send Reset Link";

    return (
        <div className="fixed inset-0 flex overflow-hidden" style={{ zIndex: 0 }}>

            {/* ── BEAR HALF ── */}
            <div className="flex-1 relative overflow-hidden"
                style={{ background: "linear-gradient(to bottom, #020905 0%, #041a08 45%, #06220c 100%)" }}>
                <BearForest side="bear" />
            </div>

            {/* ── PARROT HALF ── */}
            <div className="flex-1 relative overflow-hidden"
                style={{ background: "linear-gradient(to bottom, #010c03 0%, #031206 45%, #041808 100%)" }}>
                <ParrotForest side="parrot" />
            </div>

            {/* ── Divider line ── */}
            <div style={{
                position: "absolute", top: 0, bottom: 0, left: "50%", width: "1px",
                background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.07) 15%, rgba(255,255,255,0.13) 50%, rgba(255,255,255,0.07) 85%, transparent 100%)",
                zIndex: 10, pointerEvents: "none",
            }} />

            {/* ── AUTH FORM ── */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ zIndex: 20, width: "360px", maxWidth: "calc(100vw - 32px)" }}>
                <div style={{
                    background: "rgba(3,12,6,0.92)",
                    backdropFilter: "blur(28px)",
                    WebkitBackdropFilter: "blur(28px)",
                    border: "1px solid rgba(255,255,255,0.13)",
                    borderRadius: "20px",
                    padding: "36px 32px",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
                }}>
                    <div style={{ textAlign: "center", marginBottom: "28px" }}>
                        <BrandLogo size="auth" variant="light" centered={true} clickable={false} />
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

                        {/* Display name — signup only */}
                        {mode === "signup" && (
                            <input type="text" placeholder="Display name" value={displayName}
                                onChange={e => setDisplayName(e.target.value)} style={inputStyle} />
                        )}

                        {/* Email */}
                        <input type="email" placeholder="Email address" value={email}
                            onChange={e => setEmail(e.target.value)} required style={inputStyle} />

                        {/* Password */}
                        {mode !== "forgot" && (
                            <div style={{ position: "relative" }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password" value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required minLength={6}
                                    style={{ ...inputStyle, paddingRight: "44px" }}
                                />
                                <button type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    style={{
                                        position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                                        background: "none", border: "none", cursor: "pointer", padding: "2px",
                                        color: "rgba(165,210,190,0.45)", display: "flex", alignItems: "center",
                                    }}>
                                    <EyeIcon open={showPassword} />
                                </button>
                            </div>
                        )}

                        {/* Confirm password — signup only */}
                        {mode === "signup" && (
                            <div style={{ position: "relative" }}>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm password" value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required minLength={6}
                                    style={{ ...inputStyle, paddingRight: "44px" }}
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(v => !v)} tabIndex={-1}
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                    style={{
                                        position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                                        background: "none", border: "none", cursor: "pointer", padding: "2px",
                                        color: "rgba(165,210,190,0.45)", display: "flex", alignItems: "center",
                                    }}>
                                    <EyeIcon open={showConfirmPassword} />
                                </button>
                            </div>
                        )}

                        {/* Forgot password link */}
                        {mode === "signin" && (
                            <div style={{ textAlign: "right", marginTop: "-4px" }}>
                                <button type="button" onClick={() => switchMode("forgot")} style={{
                                    background: "none", border: "none", cursor: "pointer",
                                    fontSize: "0.72rem", color: "rgba(165,210,190,0.4)",
                                    textDecoration: "underline", textUnderlineOffset: "3px", fontFamily: "inherit",
                                }}>
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        {error && <p style={{ color: "rgba(248,113,113,0.9)", fontSize: "0.8rem", textAlign: "center" }}>{error}</p>}
                        {message && <p style={{ color: "rgba(52,211,153,0.9)", fontSize: "0.8rem", textAlign: "center" }}>{message}</p>}

                        <button type="submit" disabled={loading} style={{
                            width: "100%", padding: "13px", borderRadius: "12px", border: "none",
                            background: loading ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, rgba(251,191,36,0.92) 0%, rgba(52,211,153,0.88) 100%)",
                            color: loading ? "rgba(255,255,255,0.35)" : "#0a1a0c",
                            fontWeight: 700, fontSize: "0.9rem",
                            cursor: loading ? "not-allowed" : "pointer",
                            letterSpacing: "0.02em", fontFamily: "inherit",
                            marginTop: "4px", transition: "opacity 0.2s",
                        }}>
                            {submitLabel}
                        </button>
                    </form>

                    {/* Mode switcher */}
                    <div style={{ marginTop: "16px", textAlign: "center", display: "flex", flexDirection: "column", gap: "6px" }}>
                        {mode !== "signup" && (
                            <button onClick={() => switchMode("signup")} style={{
                                background: "none", border: "none", cursor: "pointer",
                                fontSize: "0.78rem", color: "rgba(165,210,190,0.48)",
                                textDecoration: "underline", textUnderlineOffset: "3px", fontFamily: "inherit",
                            }}>
                                Don&apos;t have an account? Sign up
                            </button>
                        )}
                        {mode !== "signin" && (
                            <button onClick={() => switchMode("signin")} style={{
                                background: "none", border: "none", cursor: "pointer",
                                fontSize: "0.78rem", color: "rgba(165,210,190,0.48)",
                                textDecoration: "underline", textUnderlineOffset: "3px", fontFamily: "inherit",
                            }}>
                                Back to sign in
                            </button>
                        )}
                    </div>

                    {/* Divider */}
                    <div style={{
                        height: "1px",
                        background: "rgba(255,255,255,0.07)",
                        margin: "14px 0 12px",
                    }} />

                    {/* Back to landing */}
                    <div style={{ textAlign: "center" }}>
                        <Link href="/" style={{
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            color: "rgba(215,240,225,0.85)",
                            textDecoration: "none",
                            letterSpacing: "0.02em",
                            transition: "color 0.18s",
                        }}>
                            {"\u2190"} What is ClarityCast?
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
