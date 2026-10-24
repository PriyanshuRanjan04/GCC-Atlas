import type { Metadata } from "next";
import { Syne, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GCC Atlas — India's GCC Intelligence Platform",
    template: "%s | GCC Atlas",
  },
  description:
    "The single source of truth for India's Global Capability Centre ecosystem. Research cities, compare incentives, and find the right GCC hub.",
  keywords: ["GCC", "India", "Global Capability Centre", "captive centre", "GIFT City", "Bengaluru", "Hyderabad"],
  openGraph: {
    title: "GCC Atlas — India's GCC Intelligence Platform",
    description:
      "Research, compare, and decide where to set up a GCC in India. 68+ captive GCC profiles, city intelligence, and incentive data.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${syne.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col" style={{ backgroundColor: "#0A0F1E", color: "#E5E7EB" }}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
