"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BearCharacter from "@/components/bear/BearCharacter";
import ParrotCharacter from "@/components/parrot/ParrotCharacter";
import { BearForest, ParrotForest } from "@/components/RiveForest";
import BrandLogo from "@/components/BrandLogo";
import ConfirmationModal from "@/components/ConfirmationModal";
import { createClient } from "@/lib/supabase/client";

type HoverSide = "bear" | "parrot" | null;

export default function Home() {
    const router = useRouter();
    const [parrotState, setParrotState] = useState<"idle" | "talking">("idle");
    const [hovered, setHovered] = useState<HoverSide>(null);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    // Per-interaction input detection: device-level media queries like
    // (hover: none) misreport on touchscreen laptops, so track the pointer
    // type of the most recent pointerdown instead.
    const lastPointerType = useRef<string>("mouse");

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 767px)");
        const updateMobile = () => setIsMobile(mq.matches);
        updateMobile();
        mq.addEventListener("change", updateMobile);
        return () => mq.removeEventListener("change", updateMobile);
    }, []);

    const confirmLogout = async () => {
        setIsLogoutModalOpen(false);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    };

    const activateSide = (side: HoverSide) => {
        setParrotState(side === "parrot" ? "talking" : "idle");
        setHovered(side);
    };

    const clearSides = () => {
        setParrotState("idle");
        setHovered(null);
    };

    const handlePointerEnter = (side: "bear" | "parrot") => (e: React.PointerEvent) => {
        if (e.pointerType !== "touch") activateSide(side);
    };

    const handleSideClick = (side: "bear" | "parrot") => {
        if (lastPointerType.current === "touch") {
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
            onPointerDown={(e) => { lastPointerType.current = e.pointerType; }}
            onPointerLeave={(e) => { if (e.pointerType !== "touch") clearSides(); }}
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
                    isolation: "isolate",
                }}
                onPointerEnter={handlePointerEnter("bear")}
                onClick={() => handleSideClick("bear")}
            >
                {/* Rive mouse-tracking forest background */}
                <BearForest side="bear" />

                {/* Bear character — uses shared BearCharacter so the same SVG filter
                    that strips the artboard's opaque background is applied everywhere. */}
                <div style={{
                    position: "absolute",
                    bottom: "18%",
                    left: "50%",
                    transform: hovered === "bear"
                        ? "translateX(-50%) translateY(-8px)"
                        : "translateX(-50%)",
                    transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                    zIndex: 2,
                }}>
                    <BearCharacter size={200} trackMouseGlobally dropShadow={false} />
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
                onPointerEnter={handlePointerEnter("parrot")}
                onClick={() => handleSideClick("parrot")}
            >
                {/* Rive parallax forest background */}
                <ParrotForest side="parrot" />

                {/* Parrot character */}
                <div style={{
                    position: "absolute",
                    bottom: "15%",
                    left: "50%",
                    transform: hovered === "parrot"
                        ? "translateX(-50%) translateY(-8px)"
                        : "translateX(-50%)",
                    transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                    zIndex: 2,
                }}>
                    <ParrotCharacter state={parrotState} size={200} />
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
                    className="absolute md:left-1/4 left-1/2 -translate-x-1/2 md:top-[26%] top-[5%]"
                    style={{
                        zIndex: 25,
                        width: isMobile ? "236px" : "260px",
                        maxWidth: "calc(100vw - 40px)",
                        padding: isMobile ? "13px 16px" : "18px 20px",
                        borderRadius: "16px",
                        background: "rgba(8, 20, 10, 0.92)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: "1px solid rgba(251,191,36,0.25)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(251,191,36,0.08)",
                        animation: "speech-bubble-in 0.3s ease-out",
                        pointerEvents: "none",
                    }}
                >
                    <div style={{
                        fontSize: isMobile ? "0.62rem" : "0.7rem", fontWeight: 700, letterSpacing: "0.14em",
                        textTransform: "uppercase", color: "rgba(251,191,36,0.8)",
                        marginBottom: isMobile ? "6px" : "8px",
                    }}>
                        Zulu — Your thinking partner
                    </div>
                    <div style={{
                        fontSize: isMobile ? "0.72rem" : "0.8rem",
                        lineHeight: 1.45, color: "rgba(245,232,205,0.82)",
                        marginBottom: isMobile ? "9px" : "12px",
                    }}>
                        When your head is full and you need to think something through. Zulu asks the right questions to help you untangle it.
                    </div>
                    <div style={{
                        display: "flex", flexWrap: "wrap", gap: "5px",
                    }}>
                        {["Decisions", "Plans", "Overwhelm", "Message prep"].map((tag) => (
                            <span key={tag} style={{
                                fontSize: isMobile ? "0.6rem" : "0.65rem", fontWeight: 600, letterSpacing: "0.04em",
                                padding: isMobile ? "2px 7px" : "3px 9px", borderRadius: "8px",
                                background: "rgba(251,191,36,0.1)",
                                border: "1px solid rgba(251,191,36,0.18)",
                                color: "rgba(251,191,36,0.7)",
                            }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                    <div style={{
                        position: "absolute", bottom: "-8px", left: "50%", transform: "translateX(-50%)",
                        width: 0, height: 0,
                        borderLeft: "8px solid transparent", borderRight: "8px solid transparent",
                        borderTop: "8px solid rgba(8, 20, 10, 0.92)",
                    }} />
                </div>
            )}
            {hovered === "parrot" && (
                <div
                    className="absolute md:left-3/4 left-1/2 -translate-x-1/2 md:top-[26%] top-[70%]"
                    style={{
                        zIndex: 25,
                        width: isMobile ? "236px" : "260px",
                        maxWidth: "calc(100vw - 40px)",
                        padding: isMobile ? "13px 16px" : "18px 20px",
                        borderRadius: "16px",
                        background: "rgba(6, 18, 10, 0.92)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: "1px solid rgba(52,211,153,0.25)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(52,211,153,0.08)",
                        animation: "speech-bubble-in 0.3s ease-out",
                        pointerEvents: "none",
                    }}
                >
                    <div style={{
                        fontSize: isMobile ? "0.62rem" : "0.7rem", fontWeight: 700, letterSpacing: "0.14em",
                        textTransform: "uppercase", color: "rgba(52,211,153,0.8)",
                        marginBottom: isMobile ? "6px" : "8px",
                    }}>
                        Tango — Your writing partner
                    </div>
                    <div style={{
                        fontSize: isMobile ? "0.72rem" : "0.8rem",
                        lineHeight: 1.45, color: "rgba(210,240,225,0.82)",
                        marginBottom: isMobile ? "9px" : "12px",
                    }}>
                        When you know what you need to say but not how to say it. Tango learns the situation, then drafts it for you.
                    </div>
                    <div style={{
                        display: "flex", flexWrap: "wrap", gap: "5px",
                    }}>
                        {["Messages", "Emails", "Tough conversations"].map((tag) => (
                            <span key={tag} style={{
                                fontSize: isMobile ? "0.6rem" : "0.65rem", fontWeight: 600, letterSpacing: "0.04em",
                                padding: isMobile ? "2px 7px" : "3px 9px", borderRadius: "8px",
                                background: "rgba(52,211,153,0.1)",
                                border: "1px solid rgba(52,211,153,0.18)",
                                color: "rgba(52,211,153,0.7)",
                            }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                    {/* Mobile: arrow at top pointing up; Desktop: arrow at bottom */}
                    <div className="md:hidden" style={{
                        position: "absolute", top: "-8px", left: "50%", transform: "translateX(-50%)",
                        width: 0, height: 0,
                        borderLeft: "8px solid transparent", borderRight: "8px solid transparent",
                        borderBottom: "8px solid rgba(6, 18, 10, 0.92)",
                    }} />
                    <div className="hidden md:block" style={{
                        position: "absolute", bottom: "-8px", left: "50%", transform: "translateX(-50%)",
                        width: 0, height: 0,
                        borderLeft: "8px solid transparent", borderRight: "8px solid transparent",
                        borderTop: "8px solid rgba(6, 18, 10, 0.92)",
                    }} />
                </div>
            )}

            {/* ════════════════════════════════════════
                TAP-ME PILLS — mobile only, outside halves to escape stacking contexts.
                The pill for the currently-selected side hides; the other stays so
                the user knows they can tap it next.
            ════════════════════════════════════════ */}
            {hovered !== "bear" && (
                <div
                    className="md:hidden"
                    style={{
                        position: "absolute",
                        top: "calc(41% - 230px)",
                        left: "50%",
                        zIndex: 25,
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
                        pointerEvents: "none",
                    }}
                >
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
            {hovered !== "parrot" && (
                <div
                    className="md:hidden"
                    style={{
                        position: "absolute",
                        top: "78%",
                        left: "50%",
                        zIndex: 25,
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
                        pointerEvents: "none",
                    }}
                >
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
                    <div style={{ marginBottom: "22px" }}>
                        <BrandLogo size="auth" variant="light" centered={true} clickable={false} />
                    </div>

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
