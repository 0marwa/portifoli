"use client";

import { useSectionBackground } from "@/hooks/useSectionBackground";
import { SECTION_BACKGROUNDS } from "@/lib/sectionThemes";
import Navbar from "@/components/layout/Navbar";
import ScrollToTop from "@/components/layout/ScrollToTop";

/**
 * Client shell that wraps all sections.
 * Reads the active section from IntersectionObserver and applies
 * the matching background colour to the page root.
 */
export default function PageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const activeSection = useSectionBackground();

  const theme =
    activeSection && SECTION_BACKGROUNDS[activeSection]
      ? SECTION_BACKGROUNDS[activeSection]
      : { bg: "bg-[#f5f0e8]" }; // fallback to "about" colours

  return (
    <div
      className={`relative min-h-screen transition-colors duration-700 ${theme.bg}`}
      style={
        theme.texture
          ? {
              backgroundImage: `url(${theme.texture})`,
              backgroundRepeat: "repeat",
              backgroundSize: "auto",
            }
          : undefined
      }
    >
      <Navbar />
      <ScrollToTop />
      {children}
    </div>
  );
}
