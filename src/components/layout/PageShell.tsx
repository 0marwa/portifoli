"use client";

import dynamic from "next/dynamic";
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

      {/*
        scroll-snap-type was tested here but reverted. Reason:
        - <main> has overflow:visible and clientHeight === scrollHeight, so it is
          not the scroll container — the snap spec has no effect here.
        - The true scroller is <html>. Moving snap to <html> would require making
          <main> the overflow-scroll container (height:100vh, overflow-y:scroll),
          which breaks: ArtGallery's IntersectionObserver (viewport-based),
          BackgroundCanvas fixed positioning, and Contact's natural-height layout.
        - The refactor is too invasive vs. the cosmetic benefit of section snapping.
      */}
      <main className="relative z-0">
        {children}
      </main>
    </div>
  );
}
