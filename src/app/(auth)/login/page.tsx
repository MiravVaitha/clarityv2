"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
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
    color: "rgba(215,240,225,0.9)", fontSize: "0.875rem", outline: "none",
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
                <div style={{
                    position: "absolute", top: "10%", left: "10%", width: "80%", height: "70%",
                    background: "radial-gradient(ellipse at 50% 40%, rgba(140,85,15,0.2) 0%, transparent 65%)",
                    pointerEvents: "none",
                }} />
                <svg style={{ position: "absolute", bottom: "15%", left: 0, width: "100%", opacity: 0.3 }}
                    viewBox="0 0 600 280" preserveAspectRatio="xMidYMax meet" fill="none">
                    <path d="M0 280 L0 190 Q35 90 75 155 Q115 75 155 140 Q195 85 235 148 Q275 70 315 145 Q355 90 395 152 Q435 78 475 148 Q515 88 555 150 L600 150 L600 280 Z" fill="#0a2010"/>
                </svg>
                <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: "22%",
                    background: "linear-gradient(to top, rgba(18,55,22,0.4) 0%, transparent 100%)",
                    pointerEvents: "none",
                }} />
                <div style={{ position: "absolute", bottom: "12%", left: "50%", transform: "translateX(-50%)", opacity: 0.2 }}>
                    <svg width="90" height="95" viewBox="0 0 200 210" fill="none">
                        <ellipse cx="100" cy="148" rx="54" ry="52" fill="#2a1a0a"/>
                        <ellipse cx="100" cy="88" rx="48" ry="46" fill="#2a1a0a"/>
                        <ellipse cx="62" cy="48" rx="18" ry="18" fill="#2a1a0a"/>
                        <ellipse cx="138" cy="48" rx="18" ry="18" fill="#2a1a0a"/>
                        <ellipse cx="54" cy="158" rx="16" ry="22" fill="#2a1a0a" transform="rotate(-15 54 158)"/>
                        <ellipse cx="146" cy="158" rx="16" ry="22" fill="#2a1a0a" transform="rotate(15 146 158)"/>
                    </svg>
                </div>
                <div style={{
                    position: "absolute", bottom: "6%", left: "50%", transform: "translateX(-50%)",
                    fontSize: "0.55rem", letterSpacing: "0.18em", textTransform: "uppercase",
                    color: "rgba(251,191,36,0.28)", fontWeight: 700, whiteSpace: "nowrap",
                }}>Zulu · Clarity</div>
            </div>

            {/* ── PARROT HALF ── */}
            <div className="flex-1 relative overflow-hidden"
                style={{ background: "linear-gradient(to bottom, #010c03 0%, #031206 45%, #041808 100%)" }}>
                <div style={{
                    position: "absolute", top: "10%", right: "10%", width: "80%", height: "70%",
                    background: "radial-gradient(ellipse at 50% 40%, rgba(40,130,25,0.22) 0%, transparent 65%)",
                    pointerEvents: "none",
                }} />
                <svg style={{ position: "absolute", bottom: "15%", left: 0, width: "100%", opacity: 0.32 }}
                    viewBox="0 0 600 260" preserveAspectRatio="xMidYMax meet" fill="none">
                    <path d="M0 260 L0 178 Q40 82 85 145 Q132 62 178 135 Q225 78 272 140 Q318 66 365 140 Q415 80 462 148 Q510 74 558 145 L600 145 L600 260 Z" fill="#031c0a"/>
                </svg>
                <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: "20%",
                    background: "linear-gradient(to top, rgba(18,68,22,0.38) 0%, transparent 100%)",
                    pointerEvents: "none",
                }} />
                <div style={{ position: "absolute", bottom: "12%", left: "50%", transform: "translateX(-50%)", opacity: 0.2 }}>
                    <svg width="80" height="100" viewBox="0 0 200 250" fill="none">
                        <ellipse cx="100" cy="140" rx="42" ry="47" fill="#16a34a"/>
                        <ellipse cx="100" cy="82" rx="33" ry="31" fill="#dc2626"/>
                        <ellipse cx="62" cy="143" rx="19" ry="28" fill="#15803d" transform="rotate(-10 62 143)"/>
                        <ellipse cx="138" cy="143" rx="19" ry="28" fill="#15803d" transform="rotate(10 138 143)"/>
                        <path d="M88 175 Q72 202 68 232" stroke="#166534" strokeWidth="11" strokeLinecap="round" fill="none"/>
                        <path d="M112 175 Q128 202 132 230" stroke="#166534" strokeWidth="11" strokeLinecap="round" fill="none"/>
                    </svg>
                </div>
                <div style={{
                    position: "absolute", bottom: "6%", left: "50%", transform: "translateX(-50%)",
                    fontSize: "0.55rem", letterSpacing: "0.18em", textTransform: "uppercase",
                    color: "rgba(52,211,153,0.28)", fontWeight: 700, whiteSpace: "nowrap",
                }}>Tango · Drafts</div>
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
                    <div style={{ textAlign: "center", marginBottom: "6px" }}>
                        <BrandLogo size="nav" variant="light" centered={true} clickable={false} />
                    </div>
                    <p style={{
                        textAlign: "center", fontSize: "0.7rem",
                        color: "rgba(165,210,190,0.42)", fontStyle: "italic",
                        marginBottom: "28px", letterSpacing: "0.04em",
                    }}>
                        Turn chaos into clear communication.
                    </p>

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
                </div>
            </div>
        </div>
    );
}
