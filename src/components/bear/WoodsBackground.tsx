"use client";

const FIREFLIES = [
    { left: "18%", bottom: "28%", delay: "0s",    duration: "4.2s" },
    { left: "32%", bottom: "22%", delay: "1.1s",  duration: "5.5s" },
    { left: "45%", bottom: "35%", delay: "0.5s",  duration: "3.8s" },
    { left: "58%", bottom: "18%", delay: "2.0s",  duration: "5.0s" },
    { left: "70%", bottom: "30%", delay: "0.8s",  duration: "4.6s" },
    { left: "80%", bottom: "24%", delay: "1.6s",  duration: "3.5s" },
    { left: "12%", bottom: "40%", delay: "2.4s",  duration: "6.0s" },
    { left: "88%", bottom: "38%", delay: "0.3s",  duration: "4.8s" },
];

export default function WoodsBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">

            {/* Base deep-forest gradient */}
            <div className="absolute inset-0" style={{
                background: "linear-gradient(to bottom, #020905 0%, #040f07 20%, #061510 45%, #081a0c 70%, #050e07 100%)"
            }} />

            {/* Warm amber canopy light from above */}
            <div className="absolute top-0 left-0 right-0 h-[55%]" style={{
                background: "radial-gradient(ellipse at 50% -10%, rgba(160,105,20,0.28) 0%, rgba(80,60,10,0.12) 40%, transparent 70%)"
            }} />

            {/* ── FAR BACKGROUND TREES ── */}
            <svg
                className="absolute bottom-0 left-0 w-full"
                viewBox="0 0 1440 420"
                preserveAspectRatio="xMidYMax meet"
                style={{ opacity: 0.28 }}
            >
                {/* Pine silhouettes — far distance */}
                <path d="M0 420 L0 260 L30 300 L20 200 L60 240 L50 140 L90 200 L80 310 L110 280 L90 420 Z" fill="#030c05"/>
                <path d="M100 420 L115 320 L105 230 L140 270 L130 180 L165 220 L155 330 L180 300 L160 420 Z" fill="#040e06"/>
                <path d="M220 420 L235 310 L220 220 L260 260 L248 160 L285 205 L275 315 L300 285 L280 420 Z" fill="#030b04"/>
                <path d="M350 420 L368 330 L352 240 L390 278 L378 190 L412 228 L400 338 L425 310 L405 420 Z" fill="#040d06"/>
                <path d="M490 420 L502 315 L488 225 L525 268 L512 175 L548 215 L535 325 L558 295 L540 420 Z" fill="#030c05"/>
                <path d="M650 420 L664 330 L648 238 L685 278 L672 185 L708 225 L695 336 L720 305 L700 420 Z" fill="#040e07"/>
                <path d="M820 420 L832 318 L818 228 L855 268 L842 172 L878 215 L865 325 L892 295 L872 420 Z" fill="#030c05"/>
                <path d="M980 420 L992 322 L978 232 L1015 272 L1002 180 L1038 220 L1025 330 L1050 300 L1030 420 Z" fill="#040d06"/>
                <path d="M1140 420 L1155 328 L1140 238 L1178 275 L1165 182 L1200 222 L1188 332 L1212 302 L1192 420 Z" fill="#030b04"/>
                <path d="M1300 420 L1315 320 L1300 230 L1338 268 L1325 175 L1360 215 L1348 325 L1375 295 L1355 420 Z" fill="#040e06"/>
                <path d="M1400 420 L1415 310 L1400 220 L1440 265 L1440 420 Z" fill="#030c05"/>
            </svg>

            {/* ── MID-GROUND TREES ── */}
            <svg
                className="absolute bottom-0 left-0 w-full"
                viewBox="0 0 1440 560"
                preserveAspectRatio="xMidYMax meet"
                style={{ opacity: 0.55 }}
            >
                {/* Deciduous & mixed trees — mid distance */}
                <path d="M-10 560 L-10 340 Q10 280 40 320 Q70 260 100 300 Q130 240 160 290 Q140 400 120 560 Z" fill="#050f07"/>
                <path d="M180 560 L195 360 Q215 295 245 335 Q275 272 305 312 Q285 420 265 560 Z" fill="#061208"/>
                <path d="M360 560 L378 358 Q400 288 432 330 Q462 268 492 310 Q470 422 448 560 Z" fill="#050f07"/>
                <path d="M560 560 L572 348 Q598 282 628 325 Q658 260 688 305 Q665 418 642 560 Z" fill="#071409"/>
                <path d="M730 560 L748 362 Q772 295 802 338 Q832 272 862 315 Q840 428 818 560 Z" fill="#060e07"/>
                <path d="M920 560 L935 350 Q958 284 988 328 Q1018 262 1048 308 Q1025 420 1002 560 Z" fill="#050f07"/>
                <path d="M1100 560 L1118 356 Q1142 290 1172 333 Q1202 268 1232 312 Q1210 424 1188 560 Z" fill="#071409"/>
                <path d="M1290 560 L1305 345 Q1330 278 1360 322 Q1390 258 1420 302 Q1440 400 1440 560 Z" fill="#060e07"/>
                {/* Ground / undergrowth line */}
                <path d="M0 560 Q180 510 360 525 Q540 540 720 515 Q900 500 1080 520 Q1260 535 1440 510 L1440 560 Z" fill="#030c05"/>
            </svg>

            {/* ── MIST LAYER 1 (slow drift) ── */}
            <div
                className="absolute bottom-0 left-[-20%] right-[-20%] h-[38%]"
                style={{
                    background: "radial-gradient(ellipse at 50% 100%, rgba(140,190,210,0.18) 0%, transparent 68%)",
                    animation: "mist-drift 20s ease-in-out infinite",
                }}
            />

            {/* ── MIST LAYER 2 (different speed & position) ── */}
            <div
                className="absolute bottom-[15%] left-[-30%] right-[-30%] h-[30%]"
                style={{
                    background: "radial-gradient(ellipse at 35% 80%, rgba(160,200,220,0.12) 0%, transparent 58%)",
                    animation: "mist-drift-alt 28s ease-in-out infinite",
                }}
            />

            {/* ── FOREGROUND LEFT FRAME (tree trunk + leaves) ── */}
            <div
                className="absolute top-0 left-0 bottom-0 w-28 pointer-events-none"
                style={{ animation: "leaf-sway 7s ease-in-out infinite" }}
            >
                <svg viewBox="0 0 112 900" className="h-full w-full" preserveAspectRatio="xMaxYMid meet">
                    <rect x="0" y="0" width="18" height="900" fill="#030c05"/>
                    <path d="M18 60  Q65 35  95 72  Q62 108 18 90  Z" fill="#040f06" opacity="0.92"/>
                    <path d="M18 180 Q78 148 108 188 Q72 230 18 212 Z" fill="#050f07" opacity="0.88"/>
                    <path d="M18 310 Q82 275 112 318 Q76 360 18 342 Z" fill="#040d06" opacity="0.94"/>
                    <path d="M0  440 Q58 405 90  448 Q55 490 0  472 Z" fill="#030b05" opacity="0.90"/>
                    <path d="M0  580 Q65 545 98  588 Q62 630 0  612 Z" fill="#040e06" opacity="0.93"/>
                    <path d="M18 720 Q75 688 105 732 Q70 772 18 754 Z" fill="#050f07" opacity="0.88"/>
                </svg>
            </div>

            {/* ── FOREGROUND RIGHT FRAME ── */}
            <div
                className="absolute top-0 right-0 bottom-0 w-28 pointer-events-none"
                style={{ animation: "leaf-sway-alt 9s ease-in-out infinite" }}
            >
                <svg viewBox="0 0 112 900" className="h-full w-full" preserveAspectRatio="xMinYMid meet">
                    <rect x="94" y="0" width="18" height="900" fill="#030c05"/>
                    <path d="M94 80  Q48 52  18 88  Q50 126 94 108 Z" fill="#040f06" opacity="0.92"/>
                    <path d="M94 210 Q38 175 8  215  Q42 255 94 238 Z" fill="#050f07" opacity="0.88"/>
                    <path d="M94 345 Q30 312 2  352  Q36 392 94 375 Z" fill="#040d06" opacity="0.94"/>
                    <path d="M112 478 Q55 445 22 485 Q58 524 112 506 Z" fill="#030b05" opacity="0.90"/>
                    <path d="M112 615 Q48 580 16 622 Q52 660 112 642 Z" fill="#040e06" opacity="0.93"/>
                    <path d="M94 750 Q38 718 8  758  Q44 796 94 778 Z" fill="#050f07" opacity="0.88"/>
                </svg>
            </div>

            {/* ── FIREFLIES ── */}
            {FIREFLIES.map((f, i) => (
                <div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full"
                    style={{
                        left: f.left,
                        bottom: f.bottom,
                        background: "rgba(251,191,36,0.9)",
                        boxShadow: "0 0 6px 3px rgba(251,191,36,0.5), 0 0 12px 4px rgba(251,191,36,0.2)",
                        animation: `firefly-float ${f.duration} ease-in-out infinite`,
                        animationDelay: f.delay,
                    }}
                />
            ))}

            {/* ── EDGE VIGNETTE ── */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,0.55) 100%)"
                }}
            />
        </div>
    );
}
