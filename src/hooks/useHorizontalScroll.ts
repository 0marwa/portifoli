"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Intercepts vertical wheel/touch events and converts them to horizontal
 * progress through a set of slides.
 *
 * Returns:
 *   - containerRef  → attach to the horizontal scroll container div
 *   - isActive      → whether scroll hijacking is currently active
 *
 * Hijacking is active only while the section is in the viewport AND there are
 * still slides left to reveal. Once the last slide is visible it releases
 * vertical scroll back to the page.
 */
export function useHorizontalScroll(slideCount: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);
  const currentSlide = useRef(0);

  const scrollToSlide = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const slideWidth = container.offsetWidth;
    container.scrollTo({ left: index * slideWidth, behavior: "smooth" });
    currentSlide.current = index;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // IntersectionObserver: activate hijacking when section is ≥50% visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        activeRef.current = entry.isIntersecting;
      },
      { threshold: 0.5 }
    );
    observer.observe(container);

    const onWheel = (e: WheelEvent) => {
      if (!activeRef.current) return;

      const isAtStart = currentSlide.current === 0 && e.deltaY < 0;
      const isAtEnd = currentSlide.current === slideCount - 1 && e.deltaY > 0;

      // Release control at the edges so the page can scroll normally
      if (isAtStart || isAtEnd) return;

      e.preventDefault();
      const next = e.deltaY > 0
        ? Math.min(currentSlide.current + 1, slideCount - 1)
        : Math.max(currentSlide.current - 1, 0);

      scrollToSlide(next);
    };

    // passive:false so we can call preventDefault
    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      observer.disconnect();
      window.removeEventListener("wheel", onWheel);
    };
  }, [slideCount, scrollToSlide]);

  return { containerRef };
}
