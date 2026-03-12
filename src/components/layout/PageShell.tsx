"use client";

import { useEffect, useRef, useState } from "react";
import BackgroundCanvas from "@/components/layout/BackgroundCanvas";
import Navbar from "@/components/layout/Navbar";
import ScrollToTop from "@/components/layout/ScrollToTop";

type SectionId = "about" | "projects" | "art" | "photos" | "contact";

// IDs must match the `id` attribute on your section elements, e.g. <section id="about">
const SECTION_IDS: SectionId[] = ["about", "projects", "art", "photos", "contact"];

export default function PageShell({ children }: { children: React.ReactNode }) {
  const [activeSection, setActiveSection] = useState<SectionId>("about");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Track which section is most visible using IntersectionObserver
    const visible = new Map<SectionId, number>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visible.set(entry.target.id as SectionId, entry.intersectionRatio);
        });
        // Pick the section with the highest visible ratio
        let best: SectionId = "about";
        let bestRatio = -1;
        visible.forEach((ratio, id) => {
          if (ratio > bestRatio) { bestRatio = ratio; best = id; }
        });
        setActiveSection(best);
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Canvas receives active section — morphs particle behaviour */}
      <BackgroundCanvas activeSection={activeSection} />

      <Navbar />
      <ScrollToTop />

      <main className="relative z-0">
        {children}
      </main>
    </div>
  );
}