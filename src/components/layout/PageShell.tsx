"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";

const BackgroundCanvas = dynamic(
  () => import("@/components/layout/BackgroundCanvas"),
  { ssr: false }
);
import ScrollToTop from "@/components/layout/ScrollToTop";
import { useSectionBackground } from "@/hooks/useSectionBackground";
import { SECTION_BG_IMAGE } from "@/lib/sectionThemes";

export default function PageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    let rafId: number;

    import("lenis").then(({ default: Lenis }) => {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });

      // Expose for ArtGallery to pause/resume during wheel hijacking
      (window as Record<string, unknown>).__lenis = lenis;

      function raf(time: number) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(rafId);
      const lenis = (window as Record<string, unknown>).__lenis as { destroy?: () => void } | undefined;
      lenis?.destroy?.();
      delete (window as Record<string, unknown>).__lenis;
    };
  }, []);

  const activeSection = useSectionBackground();
  const bgImage = activeSection ? SECTION_BG_IMAGE[activeSection] : "";
  const hasImage = bgImage.length > 0;

  return (
    <div className="relative min-h-screen">
      {/* Fixed canvas background — always visible */}
      <BackgroundCanvas />

      {/* Section background image overlay — crossfades when section changes */}
      <div
        className="section-bg-image"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          backgroundImage: hasImage ? `url(${bgImage})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: hasImage ? 0.35 : 0,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />

      <Navbar />
      <ScrollToTop />

      <main className="relative z-0">
        {children}
      </main>
    </div>
  );
}
