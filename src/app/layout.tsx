import type { Metadata } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import PageShell from "@/components/layout/PageShell";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const acidic = localFont({
  src: "../../public/fonts/Acidic.ttf",
  variable: "--font-acidic",
});

export const metadata: Metadata = {
  title: "Marwa | Portfolio",
  description: "Personal portfolio of Marwa — developer & creative.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geist.variable} ${acidic.variable} font-sans antialiased text-[#f0ebe0] bg-[#0d0d0d]`}
        style={{ color: "#f0ebe0", backgroundColor: "#0d0d0d" }}
      >
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"
          strategy="beforeInteractive"
        />
        <PageShell>{children}</PageShell>
      </body>
    </html>
  );
}