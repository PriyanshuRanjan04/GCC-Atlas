import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

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
      "Research, compare, and decide where to set up a GCC in India. Data-driven city intelligence, incentive mapping, and 68+ captive GCC profiles.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col bg-canvas">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
