"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BearCharacter from "@/components/bear/BearCharacter";
import ParrotCharacter from "@/components/parrot/ParrotCharacter";
import BrandLogo from "@/components/BrandLogo";
import ConfirmationModal from "@/components/ConfirmationModal";
import { createClient } from "@/lib/supabase/client";

type HoverSide = "bear" | "parrot" | null;

export default function Home() {
    const router = useRouter();
    const [bearState, setBearState] = useState<"idle" | "talking">("idle");
    const [parrotState, setParrotState] = useState<"idle" | "talking">("idle");
    const [hovered, setHovered] = useState<HoverSide>(null);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
        setIsTouchDevice(window.matchMedia("(hover: none)").matches);
    }, []);

    const confirmLogout = async () => {
        setIsLogoutModalOpen(false);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    };

    const activateSide = (side: HoverSide) => {
        setBearState(side === "bear" ? "talking" : "idle");
        setParrotState(side === "parrot" ? "talking" : "idle");
        setHovered(side);
    };

    const clearSides = () => {
        setBearState("idle");
        setParrotState("idle");
        setHovered(null);
    };

    const handleSideClick = (side: "bear" | "parrot") => {
        if (isTouchDevice) {
            if (hovered === side) {
                clearSides();
            } else {
                activateSide(side);
            }
        }
    };

    return (
        // Fixed full-screen — the (app) Navbar (z-50, sticky) floats transparently on top
        <div
            className="fixed inset-0 flex flex-col md:flex-row overflow-hidden"
            style={{ zIndex: 0 }}
            onMouseLeave={() => { if (!isTouchDevice) clearSides(); }}
        >
            {/* ════════════════════════════════════════
                BEAR HALF — left on desktop, top on mobile
            ════════════════════════════════════════ */}
            <div
                className="flex-1 relative overflow-hidden cursor-pointer"
                style={{
                    minHeight: "50%",
                    background: "linear-gradient(to bottom, #020905 0%, #041a08 40%, #06220c 70%, #041408 100%)",
                    transition: "filter 0.5s ease",
                    filter: hovered === "parrot" ? "brightness(0.5)" : "none",
                }}
                onMouseEnter={() => activateSide("bear")}
                onClick={() => handleSideClick("bear")}
            >
                {/* Amber canopy glow */}
                <div style={{
                    position: "absolute", top: "10%", left: "15%", width: "70%", height: "60%",
                    background: "radial-gradient(ellipse at 50% 35%, rgba(160,100,20,0.22) 0%, transparent 65%)",
                    pointerEvents: "none",
                }} />

                {/* Far trees */}
                <svg
                    style={{ position: "absolute", bottom: "28%", left: 0, width: "100%", opacity: 0.28 }}
                    viewBox="0 0 800 200" preserveAspectRatio="xMidYMax meet" fill="none"
                >
                    <path d="M0 200 L0 140 Q40 60 80 120 Q120 60 160 110 Q200 40 240 100 Q280 60 320 120 Q360 50 400 110 Q440 65 480 120 Q520 55 560 115 Q600 50 640 110 Q680 65 720 120 Q760 55 800 115 L800 200 Z" fill="#0d2812"/>
                </svg>

                {/* Mid trees */}
                <svg
                    style={{ position: "absolute", bottom: "18%", left: 0, width: "100%", opacity: 0.5 }}
                    viewBox="0 0 800 280" preserveAspectRatio="xMidYMax meet" fill="none"
                >
                    <path d="M0 280 L0 200 Q30 100 70 160 Q110 80 150 140 Q190 90 230 150 Q270 70 310 140 Q360 100 400 160 Q440 80 480 150 Q520 90 560 155 Q600 75 640 145 Q680 100 720 160 Q760 85 800 150 L800 280 Z" fill="#0a2010"/>
                </svg>

                {/* Ground mist */}
                <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: "28%",
                    background: "linear-gradient(to top, rgba(20,60,25,0.4) 0%, transparent 100%)",
                    animation: "mist-drift 22s ease-in-out infinite",
                    pointerEvents: "none",
                }} />

                {/* Bear + tap-me bubble */}
                <div style={{
                    position: "absolute",
                    bottom: "18%",
                    left: "50%",
                    transform: hovered === "bear"
                        ? "translateX(-50%) translateY(-8px)"
                        : "translateX(-50%)",
                    transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                }}>
                    {/* "Tap me" — mobile only, hidden when any side is active */}
                    {hovered === null && (
                        <div className="md:hidden" style={{
                            position: "absolute",
                            bottom: "100%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            marginBottom: "10px",
                            padding: "4px 12px",
                            borderRadius: "10px",
                            background: "rgba(10, 22, 12, 0.85)",
                            border: "1px solid rgba(251,191,36,0.2)",
                            color: "rgba(251,191,36,0.7)",
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            letterSpacing: "0.05em",
                            whiteSpace: "nowrap",
                            animation: "tap-bounce 2s ease-in-out infinite",
                            zIndex: 21,
                        }}>
                            Tap me
                            <div style={{
                                position: "absolute",
                                bottom: "-6px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: 0, height: 0,
                                borderLeft: "5px solid transparent",
                                borderRight: "5px solid transparent",
                                borderTop: "6px solid rgba(10, 22, 12, 0.85)",
                            }} />
                        </div>
                    )}
                    <BearCharacter state={bearState} size={200} />
                </div>

                {/* Bear label */}
                <div style={{
                    position: "absolute", bottom: "6%", left: "50%", transform: "translateX(-50%)",
                    textAlign: "center", whiteSpace: "nowrap",
                }}>
                    <div style={{
                        fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase",
                        color: "rgba(251,191,36,0.55)", marginBottom: "3px", fontWeight: 700,
                    }}>
                        Zulu
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "rgba(190,220,200,0.35)", fontStyle: "italic" }}>
                        Clarity &amp; decisions
                    </div>
                </div>

                {/* Foreground leaf frame */}
                <div style={{
                    position: "absolute", bottom: 0, left: 0, width: "80px", height: "50%",
                    pointerEvents: "none", animation: "leaf-sway 7s ease-in-out infinite",
                }}>
                    <svg viewBox="0 0 80 280" fill="none" style={{ width: "100%", height: "100%" }}>
                        <path d="M0 280 Q8 180 28 130 Q48 90 18 40 Q58 72 66 130 Q74 190 54 280 Z" fill="#061a09" opacity="0.9"/>
                        <path d="M0 260 Q18 200 8 148 Q2 110 22 72 Q38 104 28 152 Q16 210 12 260 Z" fill="#08200c" opacity="0.55"/>
                    </svg>
                </div>
            </div>


            {/* ════════════════════════════════════════
                PARROT HALF — right on desktop, bottom on mobile
            ════════════════════════════════════════ */}
            <div
                className="flex-1 relative overflow-hidden cursor-pointer"
                style={{
                    minHeight: "50%",
                    background: "linear-gradient(to bottom, #010c03 0%, #031206 40%, #041808 70%, #020c04 100%)",
                    transition: "filter 0.5s ease",
                    filter: hovered === "bear" ? "brightness(0.5)" : "none",
                }}
                onMouseEnter={() => activateSide("parrot")}
                onClick={() => handleSideClick("parrot")}
            >
                {/* Emerald canopy glow */}
                <div style={{
                    position: "absolute", top: "10%", right: "15%", width: "70%", height: "60%",
                    background: "radial-gradient(ellipse at 50% 35%, rgba(50,155,30,0.25) 0%, transparent 65%)",
                    pointerEvents: "none",
                }} />

                {/* Far canopy */}
                <svg
                    style={{ position: "absolute", bottom: "30%", left: 0, width: "100%", opacity: 0.28 }}
                    viewBox="0 0 800 180" preserveAspectRatio="xMidYMax meet" fill="none"
                >
                    <path d="M0 180 L0 110 Q50 40 100 95 Q160 25 220 85 Q280 35 340 90 Q400 25 460 88 Q520 40 580 95 Q640 28 700 90 Q750 45 800 95 L800 180 Z" fill="#031508"/>
                </svg>

                {/* Mid trees */}
                <svg
                    style={{ position: "absolute", bottom: "18%", left: 0, width: "100%", opacity: 0.55 }}
                    viewBox="0 0 800 260" preserveAspectRatio="xMidYMax meet" fill="none"
                >
                    <path d="M0 260 L0 175 Q40 85 90 145 Q140 65 190 135 Q240 80 290 142 Q340 68 390 142 Q450 82 510 148 Q570 76 630 148 Q680 88 730 152 Q770 78 800 145 L800 260 Z" fill="#031c0a"/>
                </svg>

                {/* Ground mist */}
                <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: "26%",
                    background: "linear-gradient(to top, rgba(20,80,25,0.35) 0%, transparent 100%)",
                    animation: "jungle-mist 20s ease-in-out infinite",
                    pointerEvents: "none",
                }} />

                {/* Parrot + tap-me bubble */}
                <div style={{
                    position: "absolute",
                    bottom: "15%",
                    left: "50%",
                    transform: hovered === "parrot"
                        ? "translateX(-50%) translateY(-8px)"
                        : "translateX(-50%)",
                    transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                }}>
                    {/* "Tap me" — mobile only, hidden when any side is active */}
                    {hovered === null && (
                        <div className="md:hidden" style={{
                            position: "absolute",
                            bottom: "100%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            marginBottom: "10px",
                            padding: "4px 12px",
                            borderRadius: "10px",
                            background: "rgba(8, 20, 12, 0.85)",
                            border: "1px solid rgba(52,211,153,0.2)",
                            color: "rgba(52,211,153,0.7)",
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            letterSpacing: "0.05em",
                            whiteSpace: "nowrap",
                            animation: "tap-bounce 2s ease-in-out infinite",
                            animationDelay: "1s",
                            zIndex: 21,
                        }}>
                            Tap me
                            <div style={{
                                position: "absolute",
                                bottom: "-6px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: 0, height: 0,
                                borderLeft: "5px solid transparent",
                                borderRight: "5px solid transparent",
                                borderTop: "6px solid rgba(8, 20, 12, 0.85)",
                            }} />
                        </div>
                    )}
                    <ParrotCharacter state={parrotState} size={200} />
                </div>

                {/* Parrot label */}
                <div style={{
                    position: "absolute", bottom: "6%", left: "50%", transform: "translateX(-50%)",
                    textAlign: "center", whiteSpace: "nowrap",
                }}>
                    <div style={{
                        fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase",
                        color: "rgba(52,211,153,0.55)", marginBottom: "3px", fontWeight: 700,
                    }}>
                        Tango
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "rgba(190,220,200,0.35)", fontStyle: "italic" }}>
                        Drafts &amp; messages
                    </div>
                </div>

                {/* Foreground vine frame */}
                <div style={{
                    position: "absolute", bottom: 0, right: 0, width: "80px", height: "50%",
                    pointerEvents: "none", animation: "vine-sway-alt 10s ease-in-out infinite",
                }}>
                    <svg viewBox="0 0 80 280" fill="none" style={{ width: "100%", height: "100%" }}>
                        <path d="M80 280 Q72 180 52 130 Q32 90 62 40 Q22 72 14 130 Q6 190 26 280 Z" fill="#051a08" opacity="0.9"/>
                        <path d="M80 260 Q62 200 72 148 Q78 110 58 72 Q42 104 52 152 Q64 210 68 260 Z" fill="#07200b" opacity="0.55"/>
                    </svg>
                </div>
            </div>

            {/* ── World divider — vertical on desktop, horizontal on mobile ── */}
            {/* Desktop: single vertical line through center */}
            <div
                className="hidden md:block"
                style={{
                    position: "absolute", top: 0, bottom: 0, left: "50%",
                    width: "1px",
                    background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.07) 15%, rgba(255,255,255,0.13) 50%, rgba(255,255,255,0.07) 85%, transparent 100%)",
                    zIndex: 10, pointerEvents: "none",
                }}
            />
            {/* Mobile: single horizontal line through center */}
            <div
                className="md:hidden"
                style={{
                    position: "absolute", left: 0, right: 0, top: "50%",
                    height: "1px",
                    background: "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.07) 15%, rgba(255,255,255,0.13) 50%, rgba(255,255,255,0.07) 85%, transparent 100%)",
                    zIndex: 10, pointerEvents: "none",
                }}
            />

            {/* ════════════════════════════════════════
                SPEECH BUBBLES — outside half-divs to avoid overflow clip
            ════════════════════════════════════════ */}
            {hovered === "bear" && (
                <div
                    className="absolute md:left-1/4 left-1/2 -translate-x-1/2 md:top-[30%] top-[6%]"
                    style={{
                        zIndex: 25,
                        width: "250px",
                        maxWidth: "calc(100vw - 48px)",
                        padding: "16px 18px",
                        borderRadius: "16px",
                        background: "rgba(8, 20, 10, 0.92)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: "1px solid rgba(251,191,36,0.25)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(251,191,36,0.08)",
                        color: "rgba(245, 232, 205, 0.88)",
                        fontSize: "0.8rem",
                        lineHeight: 1.55,
                        textAlign: "center",
                        animation: "speech-bubble-in 0.3s ease-out",
                        pointerEvents: "none",
                    }}
                >
                    {"Hey \u2014 I\u2019m Zulu. Tell me what\u2019s on your mind. A decision you\u2019re weighing, something you\u2019re trying to plan, or just something that feels tangled. I\u2019ll help you see it clearly."}
                    <div style={{
                        position: "absolute",
                        bottom: "-8px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 0, height: 0,
                        borderLeft: "8px solid transparent",
                        borderRight: "8px solid transparent",
                        borderTop: "8px solid rgba(8, 20, 10, 0.92)",
                    }} />
                </div>
            )}
            {hovered === "parrot" && (
                <div
                    className="absolute md:left-3/4 left-1/2 -translate-x-1/2 md:top-[30%] top-[76%]"
                    style={{
                        zIndex: 25,
                        width: "250px",
                        maxWidth: "calc(100vw - 48px)",
                        padding: "16px 18px",
                        borderRadius: "16px",
                        background: "rgba(6, 18, 10, 0.92)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: "1px solid rgba(52,211,153,0.25)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(52,211,153,0.08)",
                        color: "rgba(210, 240, 225, 0.88)",
                        fontSize: "0.8rem",
                        lineHeight: 1.55,
                        textAlign: "center",
                        animation: "speech-bubble-in 0.3s ease-out",
                        pointerEvents: "none",
                    }}
                >
                    {"Hey \u2014 I\u2019m Tango. What do you need to say, and who\u2019s it going to? Give me the situation and I\u2019ll ask a couple of quick questions. Then I\u2019ll put together a few options for you."}
                    <div style={{
                        position: "absolute",
                        bottom: "-8px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 0, height: 0,
                        borderLeft: "8px solid transparent",
                        borderRight: "8px solid transparent",
                        borderTop: "8px solid rgba(6, 18, 10, 0.92)",
                    }} />
                </div>
            )}

            {/* ════════════════════════════════════════
                CENTER OVERLAY — floats above both halves
            ════════════════════════════════════════ */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ zIndex: 20, width: "290px", maxWidth: "calc(100vw - 48px)" }}
            >
                <div style={{
                    background: "rgba(3,12,6,0.84)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: "1px solid rgba(255,255,255,0.13)",
                    borderRadius: "20px",
                    padding: "26px 26px 22px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04)",
                    textAlign: "center",
                }}>
                    {/* Logo */}
                    <div style={{ marginBottom: "6px" }}>
                        <BrandLogo size="nav" variant="light" centered={true} clickable={false} />
                    </div>

                    {/* Tagline */}
                    <p style={{
                        fontSize: "0.75rem",
                        color: "rgba(175,215,198,0.48)",
                        marginBottom: "22px",
                        fontStyle: "italic",
                        letterSpacing: "0.01em",
                        lineHeight: 1.5,
                    }}>
                        Unblock your thinking. Craft your words.
                    </p>

                    {/* CTAs */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                        <Link
                            href="/bear"
                            style={{
                                display: "block",
                                padding: "11px 18px",
                                borderRadius: "11px",
                                background: hovered === "bear"
                                    ? "rgba(251,191,36,1)"
                                    : "rgba(251,191,36,0.88)",
                                color: "#160c04",
                                fontWeight: 700,
                                fontSize: "0.875rem",
                                textDecoration: "none",
                                letterSpacing: "0.02em",
                                transition: "all 0.3s ease",
                                boxShadow: hovered === "bear"
                                    ? "0 0 18px rgba(251,191,36,0.45), 0 0 36px rgba(251,191,36,0.18)"
                                    : "none",
                                transform: hovered === "bear" ? "scale(1.04)" : "scale(1)",
                            }}
                            onMouseEnter={(e) => {
                                if (hovered !== "bear") e.currentTarget.style.background = "rgba(251,191,36,1)";
                            }}
                            onMouseLeave={(e) => {
                                if (hovered !== "bear") e.currentTarget.style.background = "rgba(251,191,36,0.88)";
                            }}
                        >
                            {/* Desktop: Bear is left → ←   Mobile: Bear is top → ↑ */}
                            <span className="hidden md:inline">{"\u2190"} </span>
                            <span className="md:hidden">{"\u2191"} </span>
                            Talk to Zulu
                        </Link>
                        <Link
                            href="/parrot"
                            style={{
                                display: "block",
                                padding: "11px 18px",
                                borderRadius: "11px",
                                background: hovered === "parrot"
                                    ? "rgba(52,211,153,1)"
                                    : "rgba(52,211,153,0.88)",
                                color: "#021a0a",
                                fontWeight: 700,
                                fontSize: "0.875rem",
                                textDecoration: "none",
                                letterSpacing: "0.02em",
                                transition: "all 0.3s ease",
                                boxShadow: hovered === "parrot"
                                    ? "0 0 18px rgba(52,211,153,0.45), 0 0 36px rgba(52,211,153,0.18)"
                                    : "none",
                                transform: hovered === "parrot" ? "scale(1.04)" : "scale(1)",
                            }}
                            onMouseEnter={(e) => {
                                if (hovered !== "parrot") e.currentTarget.style.background = "rgba(52,211,153,1)";
                            }}
                            onMouseLeave={(e) => {
                                if (hovered !== "parrot") e.currentTarget.style.background = "rgba(52,211,153,0.88)";
                            }}
                        >
                            {/* Desktop: Parrot is right → →   Mobile: Parrot is bottom → ↓ */}
                            Talk to Tango
                            <span className="hidden md:inline"> {"\u2192"}</span>
                            <span className="md:hidden"> {"\u2193"}</span>
                        </Link>
                    </div>

                    {/* Divider */}
                    <div style={{
                        height: "1px",
                        background: "rgba(255,255,255,0.07)",
                        margin: "18px 0 14px",
                    }} />

                    {/* Account & Logout */}
                    <div style={{ display: "flex", justifyContent: "center", gap: "24px" }}>
                        <Link
                            href="/account"
                            style={{
                                fontSize: "0.75rem",
                                color: "rgba(175,215,198,0.45)",
                                textDecoration: "none",
                                letterSpacing: "0.03em",
                                transition: "color 0.18s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(175,215,198,0.85)")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(175,215,198,0.45)")}
                        >
                            Account
                        </Link>
                        <button
                            onClick={() => setIsLogoutModalOpen(true)}
                            style={{
                                fontSize: "0.75rem",
                                color: "rgba(175,215,198,0.45)",
                                background: "none",
                                border: "none",
                                padding: 0,
                                letterSpacing: "0.03em",
                                transition: "color 0.18s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(248,113,113,0.85)")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(175,215,198,0.45)")}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                title="Heading out?"
                message="Zulu and Tango will be waiting when you're back."
                confirmLabel="Log out"
                cancelLabel="Stay"
                onConfirm={confirmLogout}
                onCancel={() => setIsLogoutModalOpen(false)}
                variant="destructive"
            />
        </div>
    );
}
