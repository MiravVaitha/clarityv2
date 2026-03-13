"use client";

import { useRef, useState, useEffect, useCallback, ReactNode } from "react";

interface Props {
    children: ReactNode;
    /** Styles applied to the outer positioning wrapper (e.g. flex:1) */
    outerStyle?: React.CSSProperties;
    /** Styles applied to the inner scrollable div (e.g. padding, display flex) */
    innerStyle?: React.CSSProperties;
    className?: string;
    thumbColor?: string;
    thumbHoverColor?: string;
}

export default function CustomScrollbar({
    children,
    outerStyle,
    innerStyle,
    className,
    thumbColor = "rgba(160,190,120,0.22)",
    thumbHoverColor = "rgba(160,190,120,0.55)",
}: Props) {
    const contentRef = useRef<HTMLDivElement>(null);
    const [thumbHeight, setThumbHeight] = useState(0);
    const [thumbTop, setThumbTop] = useState(0);
    const [visible, setVisible] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [dragging, setDragging] = useState(false);

    const isDragging = useRef(false);
    const dragStartY = useRef(0);
    const dragStartScrollTop = useRef(0);
    const thumbHeightRef = useRef(0);

    const updateThumb = useCallback(() => {
        const el = contentRef.current;
        if (!el) return;
        const { scrollTop, scrollHeight, clientHeight } = el;
        if (scrollHeight <= clientHeight + 1) {
            setVisible(false);
            return;
        }
        setVisible(true);
        const ratio = clientHeight / scrollHeight;
        const tHeight = Math.max(ratio * clientHeight, 28);
        const tTop =
            (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - tHeight);
        thumbHeightRef.current = tHeight;
        setThumbHeight(tHeight);
        setThumbTop(tTop);
    }, []);

    useEffect(() => {
        const el = contentRef.current;
        if (!el) return;
        updateThumb();
        el.addEventListener("scroll", updateThumb, { passive: true });
        const ro = new ResizeObserver(updateThumb);
        ro.observe(el);
        // Also observe children height changes
        const mo = new MutationObserver(updateThumb);
        mo.observe(el, { childList: true, subtree: true });
        return () => {
            el.removeEventListener("scroll", updateThumb);
            ro.disconnect();
            mo.disconnect();
        };
    }, [updateThumb]);

    const onMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            isDragging.current = true;
            setDragging(true);
            dragStartY.current = e.clientY;
            dragStartScrollTop.current = contentRef.current?.scrollTop ?? 0;

            const onMove = (ev: MouseEvent) => {
                if (!isDragging.current || !contentRef.current) return;
                const el = contentRef.current;
                const { scrollHeight, clientHeight } = el;
                const scrollRange = scrollHeight - clientHeight;
                const thumbRange = clientHeight - thumbHeightRef.current;
                if (thumbRange <= 0) return;
                const delta = ev.clientY - dragStartY.current;
                el.scrollTop =
                    dragStartScrollTop.current + (delta / thumbRange) * scrollRange;
            };

            const onUp = () => {
                isDragging.current = false;
                setDragging(false);
                document.removeEventListener("mousemove", onMove);
                document.removeEventListener("mouseup", onUp);
            };

            document.addEventListener("mousemove", onMove);
            document.addEventListener("mouseup", onUp);
        },
        []
    );

    const thumbBg =
        hovered || dragging ? thumbHoverColor : thumbColor;

    return (
        <div
            className={className}
            style={{ position: "relative", ...outerStyle }}
        >
            {/* Scrollable content — native scrollbar hidden */}
            <div
                ref={contentRef}
                className="no-scrollbar"
                style={{
                    position: "absolute",
                    inset: 0,
                    overflowY: "auto",
                    ...innerStyle,
                }}
            >
                {children}
            </div>

            {/* Custom scrollbar track */}
            {visible && (
                <div
                    style={{
                        position: "absolute",
                        right: 3,
                        top: 6,
                        bottom: 6,
                        width: 4,
                        pointerEvents: "none",
                        zIndex: 10,
                    }}
                >
                    <div
                        onMouseDown={onMouseDown}
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                        style={{
                            position: "absolute",
                            top: thumbTop,
                            left: 0,
                            width: 4,
                            height: thumbHeight,
                            borderRadius: 99,
                            background: thumbBg,
                            transition: dragging ? "none" : "background 0.2s",
                            pointerEvents: "auto",
                            cursor: "none",
                        }}
                    />
                </div>
            )}
        </div>
    );
}
