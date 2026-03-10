"use client";

import BackgroundCanvas from "@/components/layout/BackgroundCanvas";
import Navbar from "@/components/layout/Navbar";
import ScrollToTop from "@/components/layout/ScrollToTop";

export default function PageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      {/* Fixed canvas background — always visible */}
      <BackgroundCanvas />

      <Navbar />
      <ScrollToTop />

      <main className="relative z-0">
        {children}
      </main>
    </div>
  );
}
