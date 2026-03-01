"use client";

import Link from "next/link";

interface BrandLogoProps {
    size?: "nav" | "auth" | "hero";
    showText?: boolean;
    variant?: "light" | "dark";
    centered?: boolean;
    clickable?: boolean;
}

export default function BrandLogo({
    size = "nav",
    showText = true,
    variant = "dark",
    centered = false,
    clickable = true
}: BrandLogoProps) {
    // Sizing mapping
    const sizes = {
        nav: {
            text: "text-xl",
        },
        auth: {
            text: "text-4xl",
        },
        hero: {
            text: "text-5xl md:text-6xl",
        }
    };

    const current = sizes[size];
    const isLight = variant === "light";

    const content = (
        <span
            className={`font-bold ${current.text} ${isLight ? 'text-white' : 'text-[hsl(var(--brand-blue))]'
                } tracking-tight leading-none h-fit ${size === 'hero'
                    ? 'drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]'
                    : ''
                }`}
        >
            ClarityCast
        </span>
    );

    const containerClasses = `flex items-center ${centered ? 'justify-center' : ''} group transition-transform ${clickable ? 'active:scale-95 cursor-pointer' : 'cursor-default'} leading-none bg-transparent focus:outline-none rounded-lg`;

    if (!clickable) {
        return (
            <div className={containerClasses}>
                {content}
            </div>
        );
    }

    return (
        <Link
            href="/home"
            className={containerClasses}
        >
            {content}
        </Link>
    );
}
