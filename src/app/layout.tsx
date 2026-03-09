import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import PageShell from "@/components/layout/PageShell";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
      <body className={`${geist.variable} font-sans antialiased`}>
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"
          strategy="beforeInteractive"
        />
        <PageShell>{children}</PageShell>
      </body>
    </html>
  );
}