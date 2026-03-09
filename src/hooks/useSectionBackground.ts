"use client";

import { useEffect, useRef, useState } from "react";
import type { SectionId } from "@/types";

/**
 * Watches all section elements and returns the id of the one currently
 * most visible in the viewport. Used to switch the page background.
 */
export function useSectionBackground(): SectionId | null {
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("section[data-section-id]")
    );

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Pick the entry with the highest intersection ratio
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (best) {
          setActiveSection(
            best.target.getAttribute("data-section-id") as SectionId
          );
        }
      },
      { threshold: [0.25, 0.5, 0.75] }
    );

    sections.forEach((s) => observerRef.current!.observe(s));

    return () => observerRef.current?.disconnect();
  }, []);

  return activeSection;
}
