import type { Metadata } from "next";
import { Geist } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
    title: "ClarityCast",
    description: "Talk to Bear",
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={`${geistSans.variable} h-screen overflow-hidden`}>
            {children}
        </div>
    );
}
