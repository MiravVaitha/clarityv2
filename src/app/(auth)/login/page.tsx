"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export default function Login() {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setLoading(true);

        if (mode === "signin") {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                setError(error.message);
            } else {
                router.push("/home");
                router.refresh();
            }
        } else {
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
                // Email confirmation is disabled — signed in immediately
                router.push("/home");
                router.refresh();
            } else {
                // Email confirmation is required
                setMessage("Check your email to confirm your account, then sign in.");
                setMode("signin");
            }
        }

        setLoading(false);
    };

    const toggleMode = () => {
        setMode(m => m === "signin" ? "signup" : "signin");
        setError(null);
        setMessage(null);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none animate-float-slow" />

            <div className="w-full max-w-md glass-light p-10 relative z-10 border-white/40 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.3)]">
                <div className="text-center mb-10 flex flex-col items-center">
                    <div className="mb-6 transform hover:scale-105 transition-all duration-500 w-full">
                        <BrandLogo size="auth" variant="dark" centered={true} clickable={false} />
                    </div>
                    <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px] opacity-70">
                        Turn chaos into clear communication.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === "signup" && (
                        <div>
                            <input
                                type="text"
                                placeholder="Display name"
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 text-slate-700 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition"
                            />
                        </div>
                    )}

                    <div>
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 text-slate-700 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition"
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 text-slate-700 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition"
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-xs text-center font-medium">{error}</p>
                    )}
                    {message && (
                        <p className="text-green-600 text-xs text-center font-medium">{message}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all hover:-translate-y-0.5 active:scale-95 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 duration-300 tracking-wide"
                    >
                        {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={toggleMode}
                        className="text-xs text-slate-500 hover:text-slate-700 transition underline underline-offset-2"
                    >
                        {mode === "signin"
                            ? "Don't have an account? Sign up"
                            : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
}
