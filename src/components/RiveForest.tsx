"use client";

import { useEffect } from "react";
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from "@rive-app/react-canvas";

type Side = "bear" | "parrot";

function isOnSide(e: MouseEvent, side: Side | undefined): boolean {
    if (!side) return true;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const isMobileLayout = w < 768;
    if (isMobileLayout) {
        return side === "bear" ? e.clientY < h / 2 : e.clientY >= h / 2;
    }
    return side === "bear" ? e.clientX < w / 2 : e.clientX >= w / 2;
}

export function BearForest({ side }: { side?: Side } = {}) {
    const { canvas, RiveComponent } = useRive({
        src: "/rive/mouse-tracking-forest.riv",
        stateMachines: "State Machine 1",
        layout: new Layout({ fit: Fit.Cover, alignment: Alignment.Center }),
        autoplay: true,
    });

    useEffect(() => {
        if (!canvas || !side) return;

        const onMouseMove = (e: MouseEvent) => {
            if (!isOnSide(e, side)) return;
            canvas.dispatchEvent(new MouseEvent("mousemove", {
                clientX: e.clientX,
                clientY: e.clientY,
                bubbles: false,
            }));
        };

        window.addEventListener("mousemove", onMouseMove);
        return () => window.removeEventListener("mousemove", onMouseMove);
    }, [canvas, side]);

    return (
        <div style={{ position: "absolute", inset: 0 }}>
            <RiveComponent style={side ? { pointerEvents: "none" } : undefined} />
        </div>
    );
}

export function ParrotForest({ side }: { side?: Side } = {}) {
    const { rive, RiveComponent } = useRive({
        src: "/rive/parallax-forest.riv",
        artboard: "forest.svg",
        stateMachines: "main",
        layout: new Layout({ fit: Fit.Cover, alignment: Alignment.Center }),
        autoplay: true,
    });

    const xAxis = useStateMachineInput(rive, "main", "xAxis");
    const yAxis = useStateMachineInput(rive, "main", "yAxis");

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!isOnSide(e, side)) return;
            if (xAxis) xAxis.value = (e.clientX / window.innerWidth) * 100;
            if (yAxis) yAxis.value = (e.clientY / window.innerHeight) * 100;
        };
        window.addEventListener("mousemove", onMouseMove);
        return () => window.removeEventListener("mousemove", onMouseMove);
    }, [xAxis, yAxis, side]);

    return <div style={{ position: "absolute", inset: 0 }}><RiveComponent style={side ? { pointerEvents: "none" } : undefined} /></div>;
}
