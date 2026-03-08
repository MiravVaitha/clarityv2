"use client";

import { useState } from "react";
import Link from "next/link";
import BearCharacter from "@/components/bear/BearCharacter";
import ParrotCharacter from "@/components/parrot/ParrotCharacter";
import BrandLogo from "@/components/BrandLogo";

type HoverSide = "bear" | "parrot" | null;

export default function Home() {
    const [bearState, setBearState] = useState<"idle" | "talking">("idle");
    const [parrotState, setParrotState] = useState<"idle" | "talking">("idle");
    const [hovered, setHovered] = useState<HoverSide>(null);

    return (
        // Fixed full-screen — the (app) Navbar (z-50, sticky) floats transparently on top
        <div
            className="fixed inset-0 flex flex-col md:flex-row overflow-hidden"
            style={{ zIndex: 0 }}
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
                    filter: hovered === "parrot" ? "brightness(0.5)" : "brightness(1)",
                }}
                onMouseEnter={() => { setBearState("talking"); setHovered("bear"); }}
                onMouseLeave={() => { setBearState("idle"); setHovered(null); }}
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

                {/* Bear */}
                <div style={{
                    position: "absolute",
                    bottom: "18%",
                    left: "50%",
                    transform: hovered === "bear"
                        ? "translateX(-50%) translateY(-8px)"
                        : "translateX(-50%)",
                    transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                }}>
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
                        Bear
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

            {/* Divider */}
            <div className="hidden md:block" style={{ width: "1px", background: "rgba(255,255,255,0.05)", flexShrink: 0, zIndex: 5 }} />
            <div className="md:hidden" style={{ height: "1px", background: "rgba(255,255,255,0.05)", flexShrink: 0, zIndex: 5 }} />

            {/* ════════════════════════════════════════
                PARROT HALF — right on desktop, bottom on mobile
            ════════════════════════════════════════ */}
            <div
                className="flex-1 relative overflow-hidden cursor-pointer"
                style={{
                    minHeight: "50%",
                    background: "linear-gradient(to bottom, #010c03 0%, #031206 40%, #041808 70%, #020c04 100%)",
                    transition: "filter 0.5s ease",
                    filter: hovered === "bear" ? "brightness(0.5)" : "brightness(1)",
                }}
                onMouseEnter={() => { setParrotState("talking"); setHovered("parrot"); }}
                onMouseLeave={() => { setParrotState("idle"); setHovered(null); }}
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

                {/* Parrot */}
                <div style={{
                    position: "absolute",
                    bottom: "15%",
                    left: "50%",
                    transform: hovered === "parrot"
                        ? "translateX(-50%) translateY(-8px)"
                        : "translateX(-50%)",
                    transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                }}>
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
                        Parrot
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
                    border: "1px solid rgba(255,255,255,0.1)",
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
                                background: "rgba(251,191,36,0.88)",
                                color: "#160c04",
                                fontWeight: 700,
                                fontSize: "0.875rem",
                                textDecoration: "none",
                                letterSpacing: "0.02em",
                                transition: "background 0.18s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(251,191,36,1)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(251,191,36,0.88)")}
                        >
                            Talk to Bear →
                        </Link>
                        <Link
                            href="/parrot"
                            style={{
                                display: "block",
                                padding: "11px 18px",
                                borderRadius: "11px",
                                background: "rgba(52,211,153,0.88)",
                                color: "#021a0a",
                                fontWeight: 700,
                                fontSize: "0.875rem",
                                textDecoration: "none",
                                letterSpacing: "0.02em",
                                transition: "background 0.18s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(52,211,153,1)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(52,211,153,0.88)")}
                        >
                            Talk to Parrot →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
