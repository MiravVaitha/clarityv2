"use client";

import { useEffect } from "react";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";

export default function WoodsBackground() {
    const { canvas, RiveComponent } = useRive({
        src: "/rive/mouse-tracking-forest.riv",
        stateMachines: "State Machine 1",
        layout: new Layout({ fit: Fit.Cover, alignment: Alignment.Center }),
        autoplay: true,
    });

    useEffect(() => {
        if (!canvas) return;
        // Background sits behind the chat UI, so its canvas never receives natural
        // mouse events. Forward them from the window so the forest still reacts.
        const onMouseMove = (e: MouseEvent) => {
            canvas.dispatchEvent(new MouseEvent("mousemove", {
                clientX: e.clientX,
                clientY: e.clientY,
                bubbles: false,
            }));
        };
        window.addEventListener("mousemove", onMouseMove);
        return () => window.removeEventListener("mousemove", onMouseMove);
    }, [canvas]);

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden" style={{
            background: "linear-gradient(to bottom, #020905 0%, #040f07 20%, #061510 45%, #081a0c 70%, #050e07 100%)",
        }}>
            <RiveComponent style={{ pointerEvents: "none" }} />
        </div>
    );
}
