"use client";

import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import BearCharacter from "@/components/bear/BearCharacter";
import ParrotCharacter from "@/components/parrot/ParrotCharacter";
import { BearForest, ParrotForest } from "@/components/RiveForest";

export default function LandingPage() {
    return (
        <div className="fixed inset-0 flex overflow-hidden" style={{ zIndex: 0 }}>

            {/* ── BEAR HALF ── */}
            <div className="flex-1 relative overflow-hidden"
                style={{ background: "linear-gradient(to bottom, #020905 0%, #041a08 45%, #06220c 100%)" }}>
                <BearForest />
                <div style={{
                    position: "absolute", bottom: "12%", left: "50%",
                    transform: "translateX(-50%)", opacity: 0.2, pointerEvents: "none",
                }}>
                    <BearCharacter size={90} />
                </div>
            </div>

            {/* ── PARROT HALF ── */}
            <div className="flex-1 relative overflow-hidden"
                style={{ background: "linear-gradient(to bottom, #010c03 0%, #031206 45%, #041808 100%)" }}>
                <ParrotForest />
                <div style={{
                    position: "absolute", bottom: "12%", left: "50%",
                    transform: "translateX(-50%)", opacity: 0.2, pointerEvents: "none",
                }}>
                    <ParrotCharacter size={80} />
                </div>
            </div>

            {/* ── Divider line ── */}
            <div style={{
                position: "absolute", top: 0, bottom: 0, left: "50%", width: "1px",
                background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.07) 15%, rgba(255,255,255,0.13) 50%, rgba(255,255,255,0.07) 85%, transparent 100%)",
                zIndex: 10, pointerEvents: "none",
            }} />

            {/* ── CENTER CARD ── */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                    zIndex: 20,
                    width: "400px",
                    maxWidth: "calc(100vw - 32px)",
                    maxHeight: "calc(100vh - 48px)",
                }}
            >
                <div
                    className="no-scrollbar"
                    style={{
                        background: "rgba(3,12,6,0.92)",
                        backdropFilter: "blur(28px)",
                        WebkitBackdropFilter: "blur(28px)",
                        border: "1px solid rgba(255,255,255,0.13)",
                        borderRadius: "20px",
                        padding: "36px 30px 28px",
                        boxShadow: "0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
                        overflowY: "auto",
                        maxHeight: "calc(100vh - 48px)",
                    }}
                >
                    {/* Logo */}
                    <div style={{
                        textAlign: "center", marginBottom: "20px",
                        animation: "landing-fade-up 0.5s ease-out both",
                    }}>
                        <BrandLogo size="auth" variant="light" centered={true} clickable={false} />
                    </div>

                    {/* Tagline */}
                    <h1 style={{
                        textAlign: "center",
                        fontSize: "1.2rem",
                        fontWeight: 600,
                        color: "rgba(230,245,235,0.92)",
                        lineHeight: 1.3,
                        marginBottom: "8px",
                        letterSpacing: "-0.01em",
                        animation: "landing-fade-up 0.5s ease-out 0.08s both",
                    }}>
                        Think clearer. Say it better.
                    </h1>

                    {/* Subtitle */}
                    <p style={{
                        textAlign: "center",
                        fontSize: "0.82rem",
                        color: "rgba(180,210,195,0.5)",
                        lineHeight: 1.55,
                        marginBottom: "22px",
                        animation: "landing-fade-up 0.5s ease-out 0.14s both",
                    }}>
                        Two AI companions for the two hardest parts of communication
                        &mdash; figuring out what you think, and putting it into words.
                    </p>

                    {/* Character cards */}
                    <div style={{
                        display: "flex", flexDirection: "column", gap: "10px", marginBottom: "22px",
                        animation: "landing-fade-up 0.5s ease-out 0.22s both",
                    }}>
                        {/* Zulu */}
                        <div style={{
                            padding: "13px 16px",
                            borderRadius: "13px",
                            background: "rgba(251,191,36,0.05)",
                            border: "1px solid rgba(251,191,36,0.14)",
                        }}>
                            <div style={{
                                fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em",
                                textTransform: "uppercase", color: "rgba(251,191,36,0.72)",
                                marginBottom: "5px",
                            }}>
                                Zulu &mdash; Your thinking partner
                            </div>
                            <div style={{
                                fontSize: "0.78rem", color: "rgba(235,225,200,0.55)",
                                lineHeight: 1.5,
                            }}>
                                When your head is full and you need to think something through. Zulu asks the right questions to help you untangle it.
                            </div>
                        </div>

                        {/* Tango */}
                        <div style={{
                            padding: "13px 16px",
                            borderRadius: "13px",
                            background: "rgba(52,211,153,0.05)",
                            border: "1px solid rgba(52,211,153,0.14)",
                        }}>
                            <div style={{
                                fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em",
                                textTransform: "uppercase", color: "rgba(52,211,153,0.72)",
                                marginBottom: "5px",
                            }}>
                                Tango &mdash; Your writing partner
                            </div>
                            <div style={{
                                fontSize: "0.78rem", color: "rgba(200,235,220,0.55)",
                                lineHeight: 1.5,
                            }}>
                                When you know what you need to say but not how to say it. Tango learns the situation, then drafts it for you.
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div style={{ animation: "landing-fade-up 0.5s ease-out 0.32s both" }}>
                        <Link href="/login" style={{
                            display: "block",
                            width: "100%",
                            padding: "13px",
                            borderRadius: "12px",
                            background: "linear-gradient(135deg, rgba(251,191,36,0.92) 0%, rgba(52,211,153,0.88) 100%)",
                            color: "#0a1a0c",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            letterSpacing: "0.02em",
                            textAlign: "center",
                            textDecoration: "none",
                            transition: "opacity 0.2s, transform 0.2s",
                        }}>
                            Get Started
                        </Link>

                        {/* Sign in link */}
                        <div style={{ textAlign: "center", marginTop: "14px" }}>
                            <Link href="/login" style={{
                                fontSize: "0.78rem",
                                color: "rgba(165,210,190,0.45)",
                                textDecoration: "underline",
                                textUnderlineOffset: "3px",
                            }}>
                                Already have an account? Sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
