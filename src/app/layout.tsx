import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
    display: "swap",
});

export const metadata: Metadata = {
    title: "AI Ads — AI-Powered Short Video Ads Generator",
    description:
        "Create cinematic short-form video ads in seconds with AI. Upload your product, and let AI generate stunning ads automatically. Built for creators, brands, and agencies.",
    keywords: [
        "AI ads",
        "video ads generator",
        "AI video",
        "short form ads",
        "product advertising",
        "AI marketing",
    ],
    openGraph: {
        title: "AI Ads — AI-Powered Short Video Ads Generator",
        description:
            "Create cinematic short-form video ads in seconds with AI.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
            <body className="font-sans bg-background text-text-primary antialiased">
                <Providers>
                    <Navbar />
                    <main>{children}</main>
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}
