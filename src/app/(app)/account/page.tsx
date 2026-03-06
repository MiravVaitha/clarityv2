"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function AccountPage() {
    const router = useRouter();
    const supabase = createClient();
    const [user, setUser] = useState<User | null>(null);
    const [displayName, setDisplayName] = useState("");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

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
        setMessage(null);
        const { error } = await supabase.auth.updateUser({
            data: { display_name: displayName },
        });
        if (!error) {
            await supabase.from("profiles").update({ display_name: displayName }).eq("id", user!.id);
            setMessage("Name updated.");
        }
        setSaving(false);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const handleDeleteAccount = async () => {
        // Placeholder — full delete requires a server action in a later phase
        alert("Account deletion will be available soon.");
    };

    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md glass-light p-10 border-white/40 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.3)]">
                <h1 className="text-xl font-bold text-slate-800 mb-1">Account</h1>
                <p className="text-xs text-slate-500 mb-8">{user.email}</p>

                <form onSubmit={handleUpdateName} className="space-y-4 mb-8">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                            Display Name
                        </label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/40 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition"
                        />
                    </div>
                    {message && <p className="text-green-600 text-xs font-medium">{message}</p>}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all duration-300"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </form>

                <div className="space-y-3 border-t border-white/30 pt-6">
                    <button
                        onClick={handleSignOut}
                        className="w-full py-3 bg-white/40 hover:bg-white/60 border border-white/40 text-slate-700 font-semibold rounded-xl text-sm transition-all duration-300"
                    >
                        Sign Out
                    </button>
                    <button
                        onClick={handleDeleteAccount}
                        className="w-full py-3 text-red-400 hover:text-red-600 text-xs font-medium transition-colors"
                    >
                        Delete account and all data
                    </button>
                </div>
            </div>
        </div>
    );
}
