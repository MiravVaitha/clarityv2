"use client";

import { useEffect } from "react";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";

interface BearCharacterProps {
    state?: "idle" | "thinking" | "talking";
    size?: number;
    trackMouseGlobally?: boolean;
    dropShadow?: boolean;
}

export default function BearCharacter({
    state = "idle",
    size = 180,
    trackMouseGlobally = false,
    dropShadow = true,
}: BearCharacterProps) {
    const { canvas, RiveComponent } = useRive({
        src: "/rive/bear.riv",
        stateMachines: "State Machine 1",
        layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
        autoplay: true,
    });

    useEffect(() => {
        if (!trackMouseGlobally || !canvas) return;

        const onMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            // Map full viewport → canvas area so the bear's eyes track the cursor
            // anywhere on the page, not just inside the canvas itself.
            const mappedClientX = rect.left + (e.clientX / window.innerWidth) * rect.width;
            const mappedClientY = rect.top + (e.clientY / window.innerHeight) * rect.height;
            canvas.dispatchEvent(new MouseEvent("mousemove", {
                clientX: mappedClientX,
                clientY: mappedClientY,
                bubbles: false,
            }));
        };

        window.addEventListener("mousemove", onMouseMove);
        return () => window.removeEventListener("mousemove", onMouseMove);
    }, [canvas, trackMouseGlobally]);

    return (
        <div
            className="relative flex flex-col items-center"
            style={{ width: size }}
        >
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

            {/* Rive Bear — canvas uses the same aspect as ParrotCharacter so Zulu's
                layout footprint matches Tango's on every page. The current bear.riv
                is portrait (sleeping bear with bouncing Z's stacked above), so
                Fit.Contain letterboxes the artwork inside this canvas; widths still
                line up with the parrot. */}
            <div style={{
                width: size,
                height: size * 1.25,
                filter: dropShadow ? "drop-shadow(0 8px 24px rgba(0,0,0,0.55))" : undefined,
            }}>
                <RiveComponent style={trackMouseGlobally ? { pointerEvents: "none" } : undefined} />
            </div>
        </div>
    );
}
