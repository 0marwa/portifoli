"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * How many px of accumulated deltaY are needed to trigger one slide change.
 */
const DELTA_THRESHOLD = 80;

/**
 * How long (ms) to lock out further slide changes after one is triggered.
 * Should be ≥ the smooth-scroll animation duration.
 */
const COOLDOWN_MS = 750;

/**
 * How long (ms) to wait after the section enters the viewport before starting
 * to hijack scroll. This lets any inbound scroll momentum die out so the
 * first slide isn't consumed the moment you arrive.
 */
const ENTER_DELAY_MS = 400;

/**
 * How many px past an edge the user must scroll before Y-axis is released.
 * This prevents the last/first slide from disappearing the instant it's reached.
 */
const EXIT_DELTA = 120;

export function useHorizontalScroll(slideCount: number) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const activeRef     = useRef(false);  // section is in viewport
  const readyRef      = useRef(false);  // entry delay has elapsed → hijacking allowed
  const currentSlide  = useRef(0);
  const cooldownRef   = useRef(false);
  const deltaAccRef   = useRef(0);      // accumulated delta for slide advances
  const exitDeltaRef  = useRef(0);      // accumulated delta past an edge
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToSlide = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({ left: index * container.offsetWidth, behavior: "smooth" });
    currentSlide.current = index;

    cooldownRef.current = true;
    setTimeout(() => {
      cooldownRef.current = false;
      deltaAccRef.current = 0;
    }, COOLDOWN_MS);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          activeRef.current    = true;
          deltaAccRef.current  = 0;
          exitDeltaRef.current = 0;
          // Delay hijacking so inbound momentum doesn't consume the first slide
          if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
          enterTimerRef.current = setTimeout(() => {
            readyRef.current = true;
          }, ENTER_DELAY_MS);
        } else {
          activeRef.current    = false;
          readyRef.current     = false;
          deltaAccRef.current  = 0;
          exitDeltaRef.current = 0;
          cooldownRef.current  = false;
          if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(container);

    const onWheel = (e: WheelEvent) => {
      // Not in viewport or still in entry-delay window → don't hijack
      if (!activeRef.current || !readyRef.current) return;

      const isAtStart = currentSlide.current === 0            && e.deltaY < 0;
      const isAtEnd   = currentSlide.current === slideCount - 1 && e.deltaY > 0;

      if (isAtStart || isAtEnd) {
        // Block Y scroll until the user has scrolled EXIT_DELTA past the edge,
        // so the last/first slide stays visible long enough to be seen.
        exitDeltaRef.current += e.deltaY;
        if (Math.abs(exitDeltaRef.current) < EXIT_DELTA) {
          e.preventDefault(); // hold Y back
          return;
        }
        // Threshold crossed → release Y scroll naturally
        exitDeltaRef.current = 0;
        return;
      }

      // Mid-gallery: fully hijack Y
      e.preventDefault();
      exitDeltaRef.current = 0;

      if (cooldownRef.current) return;

      deltaAccRef.current += e.deltaY;
      if (Math.abs(deltaAccRef.current) < DELTA_THRESHOLD) return;

      const direction = deltaAccRef.current > 0 ? 1 : -1;
      deltaAccRef.current = 0;

      scrollToSlide(
        Math.min(Math.max(currentSlide.current + direction, 0), slideCount - 1)
      );
    };

    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      observer.disconnect();
      window.removeEventListener("wheel", onWheel);
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
    };
  }, [slideCount, scrollToSlide]);

  return { containerRef };
}

  return { containerRef };
}
