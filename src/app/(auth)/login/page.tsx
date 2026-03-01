"use client";

import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";

export default function Login() {
    const router = useRouter();

    const handleLogin = () => {
        router.push("/home");
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none animate-float-slow" />

            <div className="w-full max-w-md glass-light p-10 relative z-10 border-white/40 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.3)]">
                <div className="text-center mb-10 flex flex-col items-center">
                    <div className="mb-6 transform hover:scale-105 transition-all duration-500 w-full">
                        <BrandLogo size="auth" variant="dark" centered={true} clickable={false} />
                    </div>
                    <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px] opacity-70">Turn chaos into clear communication.</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleLogin}
                        className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all hover:bg-white/70 hover:-translate-y-0.5 active:scale-95 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 duration-300 tracking-wide"
                    >
                        Continue as Guest
                    </button>
                </div>

                <p className="mt-10 text-[10px] font-bold uppercase tracking-widest text-center text-slate-400">
                    Demo Environment • No Data Persisted
                </p>
            </div>
        </div>
    );
}
