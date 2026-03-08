"use client";

interface ParrotCharacterProps {
    state?: "idle" | "thinking" | "talking";
    size?: number;
}

export default function ParrotCharacter({ state = "idle", size = 180 }: ParrotCharacterProps) {
    const scale = size / 200;

    return (
        <div className="relative flex flex-col items-center" style={{ width: size }}>
            {/* Thinking dots — emerald green */}
            {state === "thinking" && (
                <div className="flex gap-1.5 mb-3">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{
                                background: "rgba(52,211,153,0.85)",
                                boxShadow: "0 0 6px 2px rgba(52,211,153,0.4)",
                                animation: "think-bounce 1.4s ease-in-out infinite",
                                animationDelay: `${i * 0.22}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Parrot SVG */}
            <svg
                width={size}
                height={size * 1.25}
                viewBox="0 0 200 250"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                    animation:
                        state === "idle"    ? "parrot-breathe 4.5s ease-in-out infinite" :
                        state === "talking" ? "parrot-talk 0.5s ease-in-out 3" :
                        "none",
                    filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.55))",
                }}
            >
                {/* ── TAIL FEATHERS (behind body) ── */}
                {/* Green feather left */}
                <path d="M88 175 Q72 202 68 232" stroke="#166534" strokeWidth="11" strokeLinecap="round" fill="none"/>
                {/* Blue tip */}
                <path d="M68 232 Q66 242 70 246" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" fill="none"/>

                {/* Green feather center */}
                <path d="M100 178 Q100 208 97 238" stroke="#15803d" strokeWidth="10" strokeLinecap="round" fill="none"/>
                {/* Yellow tip */}
                <path d="M97 238 Q96 246 100 248" stroke="#fbbf24" strokeWidth="7" strokeLinecap="round" fill="none"/>

                {/* Green feather right */}
                <path d="M112 175 Q128 202 132 230" stroke="#166534" strokeWidth="11" strokeLinecap="round" fill="none"/>
                {/* Red tip */}
                <path d="M132 230 Q134 240 130 244" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" fill="none"/>

                {/* ── PERCH ── */}
                <rect x="32" y="183" width="136" height="13" rx="6.5" fill="#1c1008"/>
                <rect x="32" y="185" width="136" height="5" rx="2.5" fill="#2d1a0c" opacity="0.6"/>

                {/* ── BODY ── */}
                <ellipse cx="100" cy="140" rx="42" ry="47" fill="#16a34a"/>

                {/* Belly lighter patch */}
                <ellipse cx="100" cy="152" rx="26" ry="30" fill="#22c55e"/>

                {/* ── WINGS ── */}
                {/* Left wing */}
                <ellipse cx="62" cy="143" rx="19" ry="28" fill="#15803d" transform="rotate(-10 62 143)"/>
                {/* Left wing feather detail */}
                <path d="M50 128 Q60 120 70 132" stroke="#16a34a" strokeWidth="2" fill="none" opacity="0.7"/>
                <path d="M48 140 Q58 134 68 144" stroke="#16a34a" strokeWidth="1.5" fill="none" opacity="0.5"/>

                {/* Right wing */}
                <ellipse cx="138" cy="143" rx="19" ry="28" fill="#15803d" transform="rotate(10 138 143)"/>
                {/* Right wing feather detail */}
                <path d="M128 128 Q138 120 148 132" stroke="#16a34a" strokeWidth="2" fill="none" opacity="0.7"/>
                <path d="M130 140 Q140 134 150 144" stroke="#16a34a" strokeWidth="1.5" fill="none" opacity="0.5"/>

                {/* ── HEAD ── */}
                <ellipse cx="100" cy="82" rx="33" ry="31" fill="#dc2626"/>

                {/* Cheek patches — warm yellow */}
                <ellipse cx="86" cy="91" rx="9" ry="7" fill="#fbbf24" opacity="0.75"/>
                <ellipse cx="114" cy="91" rx="9" ry="7" fill="#fbbf24" opacity="0.75"/>

                {/* ── CREST FEATHERS ── */}
                <path d="M91 55 Q87 36 89 24" stroke="#b91c1c" strokeWidth="6" strokeLinecap="round" fill="none"/>
                <circle cx="89" cy="22" r="4.5" fill="#ef4444"/>
                <path d="M100 51 Q100 30 101 18" stroke="#dc2626" strokeWidth="7" strokeLinecap="round" fill="none"/>
                <circle cx="101" cy="16" r="5.5" fill="#f87171"/>
                <path d="M109 55 Q113 36 111 24" stroke="#b91c1c" strokeWidth="6" strokeLinecap="round" fill="none"/>
                <circle cx="111" cy="22" r="4.5" fill="#ef4444"/>

                {/* ── BEAK ── */}
                {/* Upper beak — hooks down */}
                <path d="M118 78 Q140 80 137 93 Q130 100 120 96 Z" fill="#d97706"/>
                {/* Beak highlight */}
                <path d="M120 80 Q133 83 131 91" stroke="#fbbf24" strokeWidth="1.5" fill="none" opacity="0.65"/>
                {/* Lower beak */}
                <path d="M118 96 Q125 104 120 108 Q113 103 115 96 Z" fill="#b45309"/>

                {/* ── EYE ── */}
                {/* Eye ring */}
                <circle cx="108" cy="73" r="11" fill="#fef3c7" opacity="0.2"/>
                {/* Eye */}
                <circle cx="108" cy="73" r="9" fill="#1a0f06"/>
                {/* Pupil */}
                <circle cx="108" cy="73" r="6" fill="#0d0806"/>
                {/* Eye shine */}
                <circle cx="111" cy="70" r="2.5" fill="rgba(255,255,255,0.85)"/>

                {/* ── FEET ── */}
                {/* Left foot */}
                <path d="M82 185 Q76 192 70 194 M82 185 Q80 194 76 199 M82 185 Q87 193 86 199" stroke="#15803d" strokeWidth="3" strokeLinecap="round" fill="none"/>
                {/* Right foot */}
                <path d="M118 185 Q124 192 130 194 M118 185 Q120 194 124 199 M118 185 Q113 193 114 199" stroke="#15803d" strokeWidth="3" strokeLinecap="round" fill="none"/>

                {/* ── SHADOW ── */}
                <ellipse cx="100" cy="200" rx="46" ry="7" fill="rgba(0,0,0,0.35)"/>
            </svg>
        </div>
    );
}
