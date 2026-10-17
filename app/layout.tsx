import type { Metadata } from "next";
import Link from "next/link";
import { Arimo, Geist_Mono, Montserrat } from "next/font/google";
import { Header } from "@/components/header";
import { Logo } from "@/components/logo";
import "./globals.css";

// Pitch-deck typography: Arial everywhere (Arimo is its metric-compatible open clone),
// plus a heavy italic geometric face for the ShipVana wordmark.
const arimo = Arimo({
  variable: "--font-arimo",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: "800",
  style: "italic",
});

export const metadata: Metadata = {
  title: "SHIPVANA · Second lives for aging cruise ships",
  description:
    "A platform that turns aging cruise ships into financed second-life deals, for buyers anywhere in the world.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${arimo.variable} ${geistMono.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="bg-abyss text-white/60">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p className="flex flex-wrap items-center">
              <Logo tone="dark" size="sm" />
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
