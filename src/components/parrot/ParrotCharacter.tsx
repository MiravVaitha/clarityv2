"use client";

import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";

interface ParrotCharacterProps {
    state?: "idle" | "thinking" | "talking";
    size?: number;
}

export default function ParrotCharacter({ state = "idle", size = 180 }: ParrotCharacterProps) {
    const { RiveComponent } = useRive({
        src: "/rive/parrot.riv",
        stateMachines: "State Machine 1",
        layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
        autoplay: true,
    });

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

            {/* Rive Parrot */}
            <div style={{
                width: size,
                height: size * 1.25,
                filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.55))",
            }}>
                <RiveComponent />
            </div>
        </div>
    );
}
