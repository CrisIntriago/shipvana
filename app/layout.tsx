import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Header } from "@/components/header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "SHIPVANA · Cruise ship valuation",
  description:
    "Transparent valuation and tracking for cruise ships that call at PortMiami. Every number labelled: sourced, estimate or proxy.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="bg-abyss text-white/60">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p>
              <span className="font-display text-base tracking-wide text-white">SHIPVANA</span>
              <span className="mx-2 text-white/30">·</span>
              Decision support, not financial advice. Market inputs are user-entered or from dated scrap prices.
            </p>
            <Link href="/credits" className="text-white/60 underline-offset-4 hover:text-white hover:underline">
              Photo credits (Wikimedia Commons)
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
