"use client";

interface BearCharacterProps {
    state?: "idle" | "thinking" | "talking";
    size?: number;
}

export default function BearCharacter({ state = "idle", size = 180 }: BearCharacterProps) {
    return (
        <div className="relative flex flex-col items-center" style={{ width: size }}>
            {/* Thinking dots — shown above bear when thinking */}
            {state === "thinking" && (
                <div className="flex gap-1.5 mb-3">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{
                                background: "rgba(251,191,36,0.85)",
                                boxShadow: "0 0 6px 2px rgba(251,191,36,0.4)",
                                animation: "think-bounce 1.4s ease-in-out infinite",
                                animationDelay: `${i * 0.22}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Bear SVG */}
            <svg
                width={size}
                height={size * 1.05}
                viewBox="0 0 200 210"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                    animation:
                        state === "idle"    ? "bear-breathe 4s ease-in-out infinite" :
                        state === "talking" ? "bear-talk 0.6s ease-in-out 3" :
                        "none",
                    filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.55))",
                }}
            >
                {/* ── BODY ── */}
                <ellipse cx="100" cy="148" rx="54" ry="52" fill="#2a1a0a" />

                {/* Belly patch */}
                <ellipse cx="100" cy="158" rx="30" ry="28" fill="#3d2510" />

                {/* ── ARMS ── */}
                {/* Left arm */}
                <ellipse cx="54" cy="158" rx="16" ry="22" fill="#2a1a0a" transform="rotate(-15 54 158)" />
                {/* Right arm */}
                <ellipse cx="146" cy="158" rx="16" ry="22" fill="#2a1a0a" transform="rotate(15 146 158)" />

                {/* ── HEAD ── */}
                <ellipse cx="100" cy="88" rx="48" ry="46" fill="#2a1a0a" />

                {/* ── EARS ── */}
                {/* Left ear */}
                <ellipse cx="62" cy="48" rx="18" ry="18" fill="#2a1a0a" />
                <ellipse cx="62" cy="48" rx="10" ry="10" fill="#3d2510" />
                {/* Right ear */}
                <ellipse cx="138" cy="48" rx="18" ry="18" fill="#2a1a0a" />
                <ellipse cx="138" cy="48" rx="10" ry="10" fill="#3d2510" />

                {/* ── FACE ── */}
                {/* Muzzle */}
                <ellipse cx="100" cy="101" rx="24" ry="18" fill="#3d2510" />

                {/* Nose */}
                <ellipse cx="100" cy="93" rx="9" ry="6" fill="#1a0f06" />
                {/* Nose shine */}
                <ellipse cx="97" cy="91" rx="3" ry="2" fill="#4a3020" opacity="0.6" />

                {/* Mouth */}
                <path
                    d="M92 103 Q100 110 108 103"
                    stroke="#1a0f06"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                />

                {/* ── EYES ── */}
                {/* Left eye white */}
                <ellipse cx="82" cy="78" rx="10" ry="10" fill="#1a0f06" />
                {/* Left pupil */}
                <ellipse cx="83" cy="78" rx="6" ry="7" fill="#0d0806" />
                {/* Left eye shine */}
                <ellipse cx="85" cy="75" rx="2.5" ry="2.5" fill="rgba(255,255,255,0.75)" />

                {/* Right eye */}
                <ellipse cx="118" cy="78" rx="10" ry="10" fill="#1a0f06" />
                {/* Right pupil */}
                <ellipse cx="119" cy="78" rx="6" ry="7" fill="#0d0806" />
                {/* Right eye shine */}
                <ellipse cx="121" cy="75" rx="2.5" ry="2.5" fill="rgba(255,255,255,0.75)" />

                {/* ── PAWS ── */}
                {/* Left paw */}
                <ellipse cx="46" cy="177" rx="14" ry="9" fill="#261508" />
                {/* Right paw */}
                <ellipse cx="154" cy="177" rx="14" ry="9" fill="#261508" />

                {/* ── SOFT AMBIENT GLOW under bear ── */}
                <ellipse cx="100" cy="202" rx="50" ry="7" fill="rgba(0,0,0,0.35)" />
            </svg>
        </div>
    );
}
