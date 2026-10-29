import type { Metadata } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
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
  title: "Marwa Rezziki — Computer Science student",
  description:
    "Portfolio of Marwa Rezziki, Computer Science student at EPFL in Lausanne — web, mobile and AI projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geist.variable} ${acidic.variable} font-sans antialiased text-[#f0ebe0]`}
        style={{ color: "#f0ebe0", background: "transparent" }}
      >
        <PageShell>{children}</PageShell>
      </body>
    </html>
  );
}