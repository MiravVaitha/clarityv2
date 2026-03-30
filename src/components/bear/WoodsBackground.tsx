"use client";

import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";

export default function WoodsBackground() {
    const { RiveComponent } = useRive({
        src: "/rive/mouse-tracking-forest.riv",
        stateMachines: "State Machine 1",
        layout: new Layout({ fit: Fit.Cover, alignment: Alignment.Center }),
        autoplay: true,
    });

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden" style={{
            background: "linear-gradient(to bottom, #020905 0%, #040f07 20%, #061510 45%, #081a0c 70%, #050e07 100%)",
        }}>
            <RiveComponent />
        </div>
    );
}
