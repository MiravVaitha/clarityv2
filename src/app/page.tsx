"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import BearCharacter from "@/components/bear/BearCharacter";
import ParrotCharacter from "@/components/parrot/ParrotCharacter";
import { BearForest, ParrotForest } from "@/components/RiveForest";

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener("scroll", onScroll, { passive: true });
        const mq = window.matchMedia("(max-width: 767px)");
        const updateMobile = () => setIsMobile(mq.matches);
        updateMobile();
        mq.addEventListener("change", updateMobile);
        return () => {
            window.removeEventListener("scroll", onScroll);
            mq.removeEventListener("change", updateMobile);
        };
    }, []);

    const scrollToContent = () => {
        document.getElementById("learn-more")?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div style={{ position: "relative", minHeight: "100vh", background: "#020905", color: "rgba(230,245,235,0.9)" }}>
            {/* ═══════════════════════════════════════
                HERO — full viewport, split rive bgs
            ═══════════════════════════════════════ */}
            <section style={{
                position: "relative",
                height: isMobile ? "100dvh" : "100vh",
                width: "100%",
                overflow: "hidden",
                display: "flex",
            }}>
                {/* Bear half */}
                <div className="flex-1 relative overflow-hidden"
                    style={{ background: "linear-gradient(to bottom, #020905 0%, #041a08 45%, #06220c 100%)" }}>
                    <BearForest side="bear" />

                    {/* Zulu — same placement as home page */}
                    <div style={{
                        position: "absolute",
                        bottom: isMobile ? "20%" : "18%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 2,
                        pointerEvents: "none",
                    }}>
                        <BearCharacter size={200} trackMouseGlobally dropShadow={false} />
                    </div>
                </div>

                {/* Parrot half */}
                <div className="flex-1 relative overflow-hidden"
                    style={{ background: "linear-gradient(to bottom, #010c03 0%, #031206 45%, #041808 100%)" }}>
                    <ParrotForest side="parrot" />

                    {/* Tango — same placement as home page */}
                    <div style={{
                        position: "absolute",
                        bottom: isMobile ? "20%" : "15%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 2,
                        pointerEvents: "none",
                    }}>
                        <ParrotCharacter size={200} />
                    </div>
                </div>

                {/* Divider */}
                <div style={{
                    position: "absolute", top: 0, bottom: 0, left: "50%", width: "1px",
                    background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.07) 15%, rgba(255,255,255,0.13) 50%, rgba(255,255,255,0.07) 85%, transparent 100%)",
                    zIndex: 5, pointerEvents: "none",
                }} />

                {/* Centered hero content — no card, free-floating */}
                <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", flexDirection: "column",
                    alignItems: "center",
                    justifyContent: isMobile ? "flex-start" : "center",
                    zIndex: 10, pointerEvents: "none",
                    padding: isMobile ? "9vh 24px 0" : "0 24px",
                }}>
                    <div style={{
                        animation: "landing-fade-up 0.6s ease-out both",
                        textAlign: "center",
                        transform: isMobile ? "scale(1.7)" : "scale(2.1)",
                        transformOrigin: "center",
                    }}>
                        <BrandLogo size="hero" variant="light" centered={true} clickable={false} />
                    </div>

                    <Link
                        href="/login"
                        style={{
                            pointerEvents: "auto",
                            marginTop: isMobile ? "36px" : "70px",
                            display: "inline-block",
                            padding: "15px 38px",
                            borderRadius: "14px",
                            background: "linear-gradient(135deg, rgba(251,191,36,0.95) 0%, rgba(52,211,153,0.92) 100%)",
                            color: "#0a1a0c",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            textDecoration: "none",
                            boxShadow: "0 12px 40px rgba(0,0,0,0.5), 0 0 24px rgba(251,191,36,0.18)",
                            transition: "transform 0.2s ease, box-shadow 0.2s ease",
                            animation: "landing-fade-up 0.6s ease-out 0.2s both",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.55), 0 0 32px rgba(251,191,36,0.28)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.5), 0 0 24px rgba(251,191,36,0.18)";
                        }}
                    >
                        Get Started
                    </Link>
                </div>

                {/* Scroll cue — bigger, centered on the divider */}
                <button
                    onClick={scrollToContent}
                    aria-label="Scroll to learn more"
                    style={{
                        position: "absolute",
                        bottom: isMobile ? "72px" : "36px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 12,
                        background: "rgba(3,12,6,0.55)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "999px",
                        cursor: "pointer",
                        color: "rgba(225,240,230,0.85)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                        padding: isMobile ? "9px 18px 7px" : "14px 26px 12px",
                        opacity: scrolled ? 0 : 1,
                        pointerEvents: scrolled ? "none" : "auto",
                        transition: "opacity 0.3s ease, transform 0.2s ease, border-color 0.2s ease, color 0.2s ease",
                        animation: "scroll-cue-fade-up 0.6s ease-out 0.4s both, scroll-cue-glow 3s ease-in-out infinite",
                        fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = "rgba(245,250,247,1)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)";
                        e.currentTarget.style.transform = "translateX(-50%) translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = "rgba(225,240,230,0.85)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                        e.currentTarget.style.transform = "translateX(-50%) translateY(0)";
                    }}
                >
                    <span style={{
                        fontSize: isMobile ? "0.78rem" : "0.95rem",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        fontWeight: 700,
                    }}>
                        Scroll to learn more
                    </span>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        marginTop: "2px",
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                            style={{ animation: "scroll-cue-bounce 1.6s ease-in-out infinite" }}>
                            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.4"
                                strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </button>
            </section>

            {/* ═══════════════════════════════════════
                LEARN MORE — explanation section
            ═══════════════════════════════════════ */}
            <section
                id="learn-more"
                style={{
                    position: "relative",
                    padding: "120px 24px 100px",
                    background: "linear-gradient(to bottom, #020c05 0%, #03110a 50%, #051508 100%)",
                    borderTop: "1px solid rgba(255,255,255,0.04)",
                    overflow: "hidden",
                    isolation: "isolate",
                }}
            >
                {/* Ambient drifting blobs — slow background motion */}
                <div className="landing-blob landing-blob--amber" aria-hidden="true" />
                <div className="landing-blob landing-blob--emerald" aria-hidden="true" />

                {/* Floating fireflies */}
                <div className="landing-fireflies" aria-hidden="true">
                    {Array.from({ length: 14 }).map((_, i) => (
                        <span
                            key={i}
                            className="landing-firefly"
                            style={{
                                left: `${(i * 7.3 + 4) % 100}%`,
                                animationDelay: `${(i % 5) * 1.4}s`,
                                animationDuration: `${10 + (i % 4) * 3}s`,
                                background: i % 2 === 0
                                    ? "rgba(251,191,36,0.7)"
                                    : "rgba(52,211,153,0.7)",
                            }}
                        />
                    ))}
                </div>

                {/* Section heading */}
                <div style={{ position: "relative", zIndex: 1, maxWidth: "780px", margin: "0 auto 60px", textAlign: "center" }}>
                    <div style={{
                        fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.24em",
                        textTransform: "uppercase", color: "rgba(180,210,195,0.55)",
                        marginBottom: "18px",
                    }}>
                        <span className="landing-eyebrow">What is ClarityCast?</span>
                    </div>
                    <h2 style={{
                        fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
                        fontWeight: 700,
                        color: "rgba(235,248,240,0.95)",
                        lineHeight: 1.2,
                        letterSpacing: "-0.02em",
                        marginBottom: "20px",
                    }}>
                        A space for thoughts you haven&apos;t finished thinking yet.
                    </h2>
                    <p style={{
                        fontSize: "1rem",
                        color: "rgba(190,215,200,0.6)",
                        lineHeight: 1.7,
                        maxWidth: "620px",
                        margin: "0 auto",
                    }}>
                        Most communication tools assume you already know what to say.
                        ClarityCast is built for the moment before that — when your head is full,
                        the message is hard, or the decision feels stuck. Two characters,
                        two jobs.
                    </p>
                </div>

                {/* Character intro grid */}
                <div style={{
                    position: "relative",
                    zIndex: 1,
                    maxWidth: "1040px",
                    margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: "24px",
                }}>
                    {/* Zulu */}
                    <div className="landing-character-card landing-character-card--bear">
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            marginBottom: "18px",
                        }}>
                            <BearCharacter size={140} trackMouseGlobally dropShadow={false} />
                        </div>
                        <div style={{
                            fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.22em",
                            textTransform: "uppercase", color: "rgba(251,191,36,0.78)",
                            textAlign: "center", marginBottom: "8px",
                        }}>
                            Zulu — The Bear
                        </div>
                        <div style={{
                            fontSize: "1.1rem", fontWeight: 600,
                            color: "rgba(245,232,205,0.92)", textAlign: "center",
                            marginBottom: "14px",
                        }}>
                            Your thinking partner
                        </div>
                        <p style={{
                            fontSize: "0.92rem", lineHeight: 1.65,
                            color: "rgba(225,215,190,0.62)", textAlign: "center",
                            margin: 0,
                        }}>
                            For decisions you keep circling, plans you can&apos;t pin down,
                            and overwhelm that needs unpacking. Zulu asks the right
                            questions until the shape of the thing becomes clear.
                        </p>
                    </div>

                    {/* Tango */}
                    <div className="landing-character-card landing-character-card--parrot">
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            marginBottom: "18px",
                        }}>
                            <ParrotCharacter size={140} />
                        </div>
                        <div style={{
                            fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.22em",
                            textTransform: "uppercase", color: "rgba(52,211,153,0.78)",
                            textAlign: "center", marginBottom: "8px",
                        }}>
                            Tango — The Parrot
                        </div>
                        <div style={{
                            fontSize: "1.1rem", fontWeight: 600,
                            color: "rgba(210,240,225,0.92)", textAlign: "center",
                            marginBottom: "14px",
                        }}>
                            Your writing partner
                        </div>
                        <p style={{
                            fontSize: "0.92rem", lineHeight: 1.65,
                            color: "rgba(195,225,210,0.62)", textAlign: "center",
                            margin: 0,
                        }}>
                            For the messages you keep rewriting, the emails you keep
                            postponing, the conversations you can&apos;t quite frame.
                            Tango learns the situation, then drafts it for you.
                        </p>
                    </div>
                </div>

                {/* How it works — three steps */}
                <div style={{ position: "relative", zIndex: 1, maxWidth: "1040px", margin: "100px auto 0", textAlign: "center" }}>
                    <div style={{
                        fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.24em",
                        textTransform: "uppercase", color: "rgba(180,210,195,0.55)",
                        marginBottom: "32px",
                    }}>
                        <span className="landing-eyebrow">How it works</span>
                    </div>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                        gap: "20px",
                    }}>
                        {[
                            { n: "01", title: "Open up", body: "Pick a character and start talking — about a decision, a draft, anything tangled." },
                            { n: "02", title: "Get unstuck", body: "Zulu asks; Tango drafts. They meet you where you are, instead of demanding a perfect prompt." },
                            { n: "03", title: "Walk away clearer", body: "Decision frameworks, plans, or message drafts you can actually use — saved to your account." },
                        ].map((step, idx) => (
                            <div
                                key={step.n}
                                className="landing-step-card"
                                style={{ animationDelay: `${idx * 0.08}s` }}
                            >
                                <div className="landing-step-card__num">{step.n}</div>
                                <div style={{
                                    fontSize: "1.05rem",
                                    fontWeight: 600,
                                    color: "rgba(235,248,240,0.95)",
                                    marginBottom: "8px",
                                }}>
                                    {step.title}
                                </div>
                                <p style={{
                                    fontSize: "0.88rem",
                                    lineHeight: 1.6,
                                    color: "rgba(190,215,200,0.62)",
                                    margin: 0,
                                }}>
                                    {step.body}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final CTA */}
                <div style={{ position: "relative", zIndex: 1, textAlign: "center", marginTop: "100px" }}>
                    <Link
                        href="/login"
                        style={{
                            display: "inline-block",
                            padding: "16px 44px",
                            borderRadius: "14px",
                            background: "linear-gradient(135deg, rgba(251,191,36,0.95) 0%, rgba(52,211,153,0.92) 100%)",
                            color: "#0a1a0c",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            textDecoration: "none",
                            boxShadow: "0 12px 40px rgba(0,0,0,0.5), 0 0 24px rgba(52,211,153,0.18)",
                            transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.55), 0 0 32px rgba(52,211,153,0.3)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.5), 0 0 24px rgba(52,211,153,0.18)";
                        }}
                    >
                        Get Started
                    </Link>
                </div>
            </section>

        </div>
    );
}
