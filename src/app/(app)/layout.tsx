import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "ClarityCast",
    description: "Turn chaos into clear communication",
};

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className={`${geistSans.variable} ${geistMono.variable}`} style={{ background: "#020a04", minHeight: "100vh" }}>
            <div className="flex flex-col min-h-screen" style={{ background: "#020a04" }}>
                <Navbar />
                <main className="flex-1">
                    <PageTransition>{children}</PageTransition>
                </main>
            </div>
        </div>
    );
}
