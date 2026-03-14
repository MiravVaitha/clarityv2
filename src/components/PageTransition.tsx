"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, ReactNode, CSSProperties } from "react";

interface Props {
    children: ReactNode;
    style?: CSSProperties;
}

export default function PageTransition({ children, style }: Props) {
    const pathname = usePathname();
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        // Reset animation so it replays on every navigation
        el.style.animation = "none";
        void el.offsetHeight; // force reflow
        el.style.animation = "";
    }, [pathname]);

    return (
        <div ref={ref} className="page-transition" style={style}>
            {children}
        </div>
    );
}
