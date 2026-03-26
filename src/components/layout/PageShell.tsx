"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import { useEffect } from "react";

const BackgroundCanvas = dynamic(
  () => import("@/components/layout/BackgroundCanvas"),
  { ssr: false }
);
import ScrollToTop from "@/components/layout/ScrollToTop";
import { useSectionBackground } from "@/hooks/useSectionBackground";
import { SECTION_BG_IMAGE } from "@/lib/sectionThemes";

const GLITCH_CHARSET = "!@#$%/\\|<>?▓░▒█▌";

function randomGlitchChar(): string {
  return GLITCH_CHARSET[Math.floor(Math.random() * GLITCH_CHARSET.length)];
}

export default function PageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const activeSection = useSectionBackground();
  const bgImage = activeSection ? SECTION_BG_IMAGE[activeSection] : "";
  const hasImage = bgImage.length > 0;

  // ── Global scroll glitch: 20% of [data-glitchable] elements flicker on scroll ─
  useEffect(() => {
    // Throttle flag — max one glitch pass per 80ms
    let throttled = false;
    // Track elements currently mid-glitch so we don't double-replace
    const glitching = new Set<Element>();

    function onScroll() {
      if (throttled) return;
      throttled = true;
      setTimeout(() => { throttled = false; }, 80);

      const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-glitchable]"));
      for (const el of targets) {
        if (glitching.has(el)) continue;
        if (Math.random() >= 0.20) continue;

        const original = el.textContent ?? "";
        if (!original.trim()) continue;

        glitching.add(el);

        // Replace with same-length random chars
        const scrambled = original
          .split("")
          .map((ch) => (ch === " " ? " " : randomGlitchChar()))
          .join("");
        el.textContent = scrambled;

        // Restore after 120ms
        setTimeout(() => {
          el.textContent = original;
          glitching.delete(el);
        }, 120);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

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
