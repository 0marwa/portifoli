import type { Metadata } from "next";
import { Geist } from "next/font/google";
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
        <PageShell>{children}</PageShell>
      </body>
    </html>
  );
}