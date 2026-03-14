"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, ReactNode, CSSProperties } from "react";

interface Props {
    children: ReactNode;
    style?: CSSProperties;
}

export default function PageTransition({ children, style }: Props) {
    const pathname = usePathname();
    // Incrementing key forces the overlay div to remount → animation restarts
    const [overlayKey, setOverlayKey] = useState(0);

    useEffect(() => {
        setOverlayKey((k) => k + 1);
    }, [pathname]);

    return (
        <div style={style}>
            {/* Content always renders at full opacity — never invisible */}
            {children}

            {/* Dark overlay fades OUT on every navigation */}
            <div
                key={overlayKey}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "#020a04",
                    pointerEvents: "none",
                    zIndex: 9998,
                    animation: "page-overlay-out 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                }}
            />
        </div>
    );
}
