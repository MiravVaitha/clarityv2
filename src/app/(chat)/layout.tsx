import type { Metadata } from "next";
import { Geist } from "next/font/google";
import PageTransition from "@/components/PageTransition";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
    title: "ClarityCast",
    description: "Talk to Bear",
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={`${geistSans.variable} h-[100dvh] overflow-hidden`}>
            <PageTransition style={{ height: "100%" }}>{children}</PageTransition>
        </div>
    );
}
