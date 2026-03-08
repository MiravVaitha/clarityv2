"use client";

const PARTICLES = [
    { left: "15%", bottom: "32%", delay: "0s",    duration: "4.5s" },
    { left: "28%", bottom: "25%", delay: "1.2s",  duration: "5.2s" },
    { left: "42%", bottom: "38%", delay: "0.6s",  duration: "3.9s" },
    { left: "55%", bottom: "20%", delay: "2.1s",  duration: "5.8s" },
    { left: "68%", bottom: "33%", delay: "0.9s",  duration: "4.3s" },
    { left: "78%", bottom: "28%", delay: "1.7s",  duration: "3.6s" },
    { left: "10%", bottom: "45%", delay: "2.5s",  duration: "6.1s" },
    { left: "86%", bottom: "40%", delay: "0.4s",  duration: "4.9s" },
];

export default function JungleBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">

            {/* Base deep jungle gradient — warmer and more vivid than the woods */}
            <div className="absolute inset-0" style={{
                background: "linear-gradient(to bottom, #010c03 0%, #021005 22%, #031508 50%, #041206 75%, #020d04 100%)"
            }} />

            {/* Golden-green canopy light filtering through the canopy */}
            <div className="absolute top-0 left-0 right-0 h-[60%]" style={{
                background: "radial-gradient(ellipse at 50% -8%, rgba(60,160,30,0.3) 0%, rgba(30,110,15,0.14) 40%, transparent 72%)"
            }} />

            {/* Secondary warm spot — dappled light from left */}
            <div className="absolute top-0 left-0 h-[45%] w-[45%]" style={{
                background: "radial-gradient(ellipse at 20% 0%, rgba(100,180,20,0.12) 0%, transparent 60%)"
            }} />

            {/* ── FAR BACKGROUND — dense jungle canopy ── */}
            <svg
                className="absolute bottom-0 left-0 w-full"
                viewBox="0 0 1440 380"
                preserveAspectRatio="xMidYMax meet"
                style={{ opacity: 0.3 }}
            >
                {/* Broad tropical canopy silhouettes */}
                <path d="M-20 380 L-20 220 Q20 160 60 200 Q100 140 140 185 Q160 230 140 380 Z" fill="#021005"/>
                <path d="M130 380 L145 230 Q175 168 210 205 Q245 158 278 195 Q260 280 245 380 Z" fill="#031208"/>
                <path d="M300 380 L318 225 Q352 162 388 200 Q424 152 458 192 Q438 285 415 380 Z" fill="#021005"/>
                <path d="M468 380 L480 218 Q515 158 550 198 Q585 148 618 188 Q597 278 574 380 Z" fill="#031407"/>
                <path d="M640 380 L655 222 Q690 162 725 202 Q760 152 794 192 Q773 282 750 380 Z" fill="#021005"/>
                <path d="M818 380 L830 218 Q865 158 900 198 Q935 148 968 188 Q947 278 924 380 Z" fill="#031208"/>
                <path d="M990 380 L1005 224 Q1040 164 1076 202 Q1112 154 1146 194 Q1125 284 1102 380 Z" fill="#021005"/>
                <path d="M1168 380 L1182 220 Q1218 160 1254 198 Q1290 150 1322 190 Q1302 280 1278 380 Z" fill="#031407"/>
                <path d="M1340 380 L1358 226 Q1390 168 1422 206 Q1440 240 1440 380 Z" fill="#021005"/>
            </svg>

            {/* ── MID-GROUND — taller trees with root bases ── */}
            <svg
                className="absolute bottom-0 left-0 w-full"
                viewBox="0 0 1440 520"
                preserveAspectRatio="xMidYMax meet"
                style={{ opacity: 0.6 }}
            >
                <path d="M-20 520 L-20 300 Q15 230 55 270 Q95 205 135 250 Q170 290 150 520 Z" fill="#031508"/>
                <path d="M160 520 L178 295 Q215 225 255 268 Q295 202 332 248 Q310 340 290 520 Z" fill="#041808"/>
                <path d="M368 520 L388 300 Q428 228 468 272 Q508 204 545 250 Q522 342 498 520 Z" fill="#031508"/>
                <path d="M580 520 L595 292 Q635 222 675 268 Q715 200 750 248 Q727 338 703 520 Z" fill="#051a09"/>
                <path d="M778 520 L795 296 Q836 226 876 270 Q916 202 952 250 Q929 342 905 520 Z" fill="#031508"/>
                <path d="M978 520 L993 290 Q1034 220 1074 266 Q1114 198 1148 246 Q1125 336 1100 520 Z" fill="#041808"/>
                <path d="M1175 520 L1192 294 Q1233 224 1273 268 Q1313 200 1346 248 Q1323 340 1298 520 Z" fill="#031508"/>
                <path d="M1365 520 L1382 298 Q1410 230 1440 265 L1440 520 Z" fill="#051a09"/>
                {/* Ground undergrowth */}
                <path d="M0 520 Q180 475 360 490 Q540 505 720 478 Q900 462 1080 482 Q1260 498 1440 470 L1440 520 Z" fill="#020c04"/>
            </svg>

            {/* ── JUNGLE MIST — lower and denser than woods ── */}
            <div
                className="absolute bottom-0 left-[-25%] right-[-25%] h-[30%]"
                style={{
                    background: "radial-gradient(ellipse at 50% 100%, rgba(100,200,120,0.12) 0%, transparent 65%)",
                    animation: "jungle-mist 18s ease-in-out infinite",
                }}
            />
            <div
                className="absolute bottom-[8%] left-[-30%] right-[-30%] h-[22%]"
                style={{
                    background: "radial-gradient(ellipse at 40% 85%, rgba(80,180,100,0.08) 0%, transparent 55%)",
                    animation: "jungle-mist 26s ease-in-out infinite reverse",
                }}
            />

            {/* ── FOREGROUND LEFT — tropical leaf frame ── */}
            <div
                className="absolute top-0 left-0 bottom-0 w-36 pointer-events-none"
                style={{ animation: "vine-sway 8s ease-in-out infinite" }}
            >
                <svg viewBox="0 0 144 900" className="h-full w-full" preserveAspectRatio="xMaxYMid meet">
                    {/* Trunk */}
                    <rect x="0" y="0" width="16" height="900" fill="#020c04"/>
                    {/* Broad tropical leaves fanning right */}
                    <path d="M16 55  Q80 20  120 65  Q78 105 16 85  Z" fill="#031508" opacity="0.95"/>
                    <path d="M16 175 Q90 132 132 180 Q88 225 16 205 Z" fill="#041808" opacity="0.90"/>
                    <path d="M16 305 Q95 260 138 310 Q92 356 16 335 Z" fill="#031508" opacity="0.95"/>
                    <path d="M0  440 Q72 395 108 442 Q65 488  0  468 Z" fill="#021206" opacity="0.92"/>
                    <path d="M0  580 Q78 535 115 582 Q70 628  0  608 Z" fill="#031508" opacity="0.94"/>
                    <path d="M16 715 Q88 672 128 720 Q84 764 16 744 Z" fill="#041808" opacity="0.90"/>
                    {/* Vine hanging from top */}
                    <path d="M14 0 Q18 120 12 260 Q16 400 10 520" stroke="#031206" strokeWidth="3" fill="none" opacity="0.6"/>
                </svg>
            </div>

            {/* ── FOREGROUND RIGHT — tropical leaf frame ── */}
            <div
                className="absolute top-0 right-0 bottom-0 w-36 pointer-events-none"
                style={{ animation: "vine-sway-alt 10s ease-in-out infinite" }}
            >
                <svg viewBox="0 0 144 900" className="h-full w-full" preserveAspectRatio="xMinYMid meet">
                    {/* Trunk */}
                    <rect x="128" y="0" width="16" height="900" fill="#020c04"/>
                    {/* Broad tropical leaves fanning left */}
                    <path d="M128 75  Q60 38  20 82  Q62 122 128 102 Z" fill="#031508" opacity="0.95"/>
                    <path d="M128 198 Q52 158 12 202 Q56 245 128 225 Z" fill="#041808" opacity="0.90"/>
                    <path d="M128 332 Q48 295  8 338 Q52 380 128 358 Z" fill="#031508" opacity="0.95"/>
                    <path d="M144 468 Q68 430 28 472 Q72 514 144 492 Z" fill="#021206" opacity="0.92"/>
                    <path d="M144 606 Q62 568 22 610 Q66 652 144 630 Z" fill="#031508" opacity="0.94"/>
                    <path d="M128 742 Q52 706 12 748 Q56 788 128 768 Z" fill="#041808" opacity="0.90"/>
                    {/* Vine hanging from top */}
                    <path d="M130 0 Q126 130 132 270 Q128 410 134 530" stroke="#031206" strokeWidth="3" fill="none" opacity="0.6"/>
                </svg>
            </div>

            {/* ── JUNGLE PARTICLES — softer emerald glow ── */}
            {PARTICLES.map((p, i) => (
                <div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full"
                    style={{
                        left: p.left,
                        bottom: p.bottom,
                        background: "rgba(134,239,172,0.85)",
                        boxShadow: "0 0 5px 2px rgba(134,239,172,0.45), 0 0 10px 3px rgba(134,239,172,0.15)",
                        animation: `jungle-particle ${p.duration} ease-in-out infinite`,
                        animationDelay: p.delay,
                    }}
                />
            ))}

            {/* ── EDGE VIGNETTE ── */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)"
                }}
            />
        </div>
    );
}
