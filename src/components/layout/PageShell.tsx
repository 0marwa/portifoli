"use client";

import { useSectionBackground } from "@/hooks/useSectionBackground";
import { SECTION_BG_IMAGE } from "@/lib/sectionThemes";
import BackgroundCanvas from "@/components/layout/BackgroundCanvas";
import Navbar from "@/components/layout/Navbar";
import ScrollToTop from "@/components/layout/ScrollToTop";
import type { SectionId } from "@/types";

/**
 * Sections that swap in a photographic image overlay on top of the canvas.
 * "about" and "contact" show only the interactive canvas — no image overlay.
 * "projects", "art", and "photos" fade a background image in when active.
 */
const IMAGE_SECTIONS: SectionId[] = ["projects", "art", "photos"];

/**
 * One fixed full-screen image layer per image-bearing section.
 * zIndex: -1 sits just above the canvas (zIndex: -2).
 * Active section fades to opacity:1; others stay opacity:0.
 */
function ImageOverlays({ active }: { active: SectionId | null }) {
  return (
    <div aria-hidden="true">
      {IMAGE_SECTIONS.map((id) => (
        <div
          key={id}
          style={{
            position             : "fixed",
            inset                : 0,
            zIndex               : -1,
            backgroundImage      : `url(${SECTION_BG_IMAGE[id]})`,
            backgroundSize       : "cover",
            backgroundPosition   : "center center",
            backgroundAttachment : "fixed",
            backgroundRepeat     : "no-repeat",
            opacity              : active === id ? 1 : 0,
            transition           : "opacity 900ms ease-in-out",
            willChange           : "opacity",
          }}
        />
      ))}
    </div>
  );
}

export default function PageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const activeSection = useSectionBackground();

  return (
    <div className="relative min-h-screen">
      {/* Layer -2: interactive sigil-star canvas — always visible */}
      <BackgroundCanvas />

      {/* Layer -1: section-specific photo overlays (projects / art / photos only) */}
      <ImageOverlays active={activeSection} />

      <Navbar />
      <ScrollToTop />

      {/* Layer 0+: page content */}
      <main className="relative z-0">
        {children}
      </main>
    </div>
  );
}