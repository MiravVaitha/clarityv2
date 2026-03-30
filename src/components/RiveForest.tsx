"use client";

import { useEffect } from "react";
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from "@rive-app/react-canvas";

export function BearForest() {
    const { RiveComponent } = useRive({
        src: "/rive/mouse-tracking-forest.riv",
        stateMachines: "State Machine 1",
        layout: new Layout({ fit: Fit.Cover, alignment: Alignment.Center }),
        autoplay: true,
    });
    return <div style={{ position: "absolute", inset: 0 }}><RiveComponent /></div>;
}

export function ParrotForest() {
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
            if (xAxis) xAxis.value = (e.clientX / window.innerWidth) * 100;
            if (yAxis) yAxis.value = (e.clientY / window.innerHeight) * 100;
        };
        window.addEventListener("mousemove", onMouseMove);
        return () => window.removeEventListener("mousemove", onMouseMove);
    }, [xAxis, yAxis]);

    return <div style={{ position: "absolute", inset: 0 }}><RiveComponent /></div>;
}
