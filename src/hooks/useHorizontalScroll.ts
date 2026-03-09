"use client";

import { useEffect, useRef, useCallback } from "react";

// ─── Tuning constants ──────────────────────────────────────────────────────────

/**
 * Minimum accumulated vertical scroll (px) required to advance one slide.
 * Trackpad events fire at ~3-10 px each, so this filters out accidental nudges.
 * Raise → harder to swipe.  Lower → easier to swipe.
 */
const DELTA_THRESHOLD = 80;

/**
 * Time (ms) to ignore new wheel events after a slide change fires.
 * Must be >= the CSS smooth-scroll duration so animations don't stack.
 */
const COOLDOWN_MS = 750;

/**
 * Time (ms) to ignore wheel events after the section first enters the viewport.
 * Prevents leftover scroll momentum from the previous section from immediately
 * consuming slide 0 before the user has even seen it.
 */
const ENTER_DELAY_MS = 400;

/**
 * Minimum accumulated vertical scroll (px) past a boundary slide before the
 * Y-axis is released back to the page.
 * Without this, reaching the last slide would instantly resume page scroll on
 * the very same wheel tick that got you there — you'd never actually see it.
 */
const EXIT_DELTA = 120;

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * useHorizontalScroll
 *
 * Intercepts vertical wheel events while a section is in view and translates
 * them into horizontal slide advances.  The full scroll lifecycle is:
 *
 *  1. Section scrolls into viewport (IntersectionObserver fires).
 *  2. ENTER_DELAY_MS grace period — wheel events are ignored so inbound
 *     page-scroll momentum doesn't accidentally consume slide 0.
 *  3. Active phase — wheel events are captured:
 *       a. deltaY is accumulated in deltaAccRef.
 *       b. When deltaAccRef crosses DELTA_THRESHOLD, one slide change fires
 *          and a COOLDOWN_MS lock prevents stacking another change immediately.
 *  4. At the first or last slide, wheel events are still captured (to block Y),
 *     but delta is counted in exitDeltaRef instead.  Once EXIT_DELTA is crossed
 *     the Y-axis is released and the page scrolls normally again.
 *  5. Section leaves viewport — all state is reset for the next visit.
 */
export function useHorizontalScroll(slideCount: number) {
  const containerRef  = useRef<HTMLDivElement>(null);

  // true while the section is ≥50% visible in the viewport
  const activeRef     = useRef(false);

  // true once the ENTER_DELAY_MS grace period has elapsed;
  // wheel hijacking is only active when both activeRef AND readyRef are true
  const readyRef      = useRef(false);

  // which slide index is currently visible (0-based)
  const currentSlide  = useRef(0);

  // true for COOLDOWN_MS after a slide change — blocks further advances
  const cooldownRef   = useRef(false);

  // running sum of wheel deltaY; advances a slide once it crosses ±DELTA_THRESHOLD
  const deltaAccRef   = useRef(0);

  // running sum of wheel deltaY while at a boundary slide;
  // Y-axis is released once this crosses ±EXIT_DELTA
  const exitDeltaRef  = useRef(0);

  // handle for the ENTER_DELAY_MS setTimeout so we can cancel it on unmount
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Smoothly scrolls the container to the target slide index and starts
   * the cooldown lock.  Only touches refs so the empty dep array is intentional.
   */
  const scrollToSlide = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({ left: index * container.offsetWidth, behavior: "smooth" });
    currentSlide.current = index;

    // Lock out further slide changes until the animation has finished
    cooldownRef.current = true;
    setTimeout(() => {
      cooldownRef.current = false;
      deltaAccRef.current = 0; // discard any delta that built up during animation
    }, COOLDOWN_MS);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Visibility tracking ─────────────────────────────────────────────────
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          activeRef.current    = true;
          deltaAccRef.current  = 0;  // discard any stale delta
          exitDeltaRef.current = 0;

          // Start the entry-delay timer — hijacking won't begin until it fires
          if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
          enterTimerRef.current = setTimeout(() => {
            readyRef.current = true;
          }, ENTER_DELAY_MS);
        } else {
          // Section left the viewport — reset everything
          activeRef.current    = false;
          readyRef.current     = false;
          deltaAccRef.current  = 0;
          exitDeltaRef.current = 0;
          cooldownRef.current  = false;
          if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
        }
      },
      { threshold: 0.5 } // fire when ≥50% of the container is visible
    );
    observer.observe(container);

    // ── Wheel handler ───────────────────────────────────────────────────────
    const onWheel = (e: WheelEvent) => {
      // Guard 1 — section not visible, or still in the entry-delay window
      if (!activeRef.current || !readyRef.current) return;

      const isAtStart = currentSlide.current === 0              && e.deltaY < 0;
      const isAtEnd   = currentSlide.current === slideCount - 1 && e.deltaY > 0;

      // ── Boundary handling (first / last slide) ──────────────────────────
      if (isAtStart || isAtEnd) {
        // Keep blocking Y scroll while the user is still just "resting" on the
        // edge.  Only release once they've scrolled EXIT_DELTA px past it, which
        // makes the intent to leave the section feel deliberate.
        exitDeltaRef.current += e.deltaY;
        if (Math.abs(exitDeltaRef.current) < EXIT_DELTA) {
          e.preventDefault(); // hold Y scroll
          return;
        }
        // EXIT_DELTA crossed → let Y scroll resume naturally
        exitDeltaRef.current = 0;
        return; // do NOT call preventDefault — page can scroll again
      }

      // ── Mid-gallery: fully own the Y axis ───────────────────────────────
      e.preventDefault();
      exitDeltaRef.current = 0; // not at an edge, so reset exit counter

      // Guard 2 — a slide change is still animating, discard input
      if (cooldownRef.current) return;

      // Accumulate delta until the intentional-scroll threshold is met.
      // This filters out accidental nudges and makes trackpad feel deliberate.
      deltaAccRef.current += e.deltaY;
      if (Math.abs(deltaAccRef.current) < DELTA_THRESHOLD) return;

      const direction = deltaAccRef.current > 0 ? 1 : -1;
      deltaAccRef.current = 0; // reset before scrollToSlide starts its own cooldown

      scrollToSlide(
        Math.min(Math.max(currentSlide.current + direction, 0), slideCount - 1)
      );
    };

    // passive: false is required so we can call e.preventDefault()
    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      observer.disconnect();
      window.removeEventListener("wheel", onWheel);
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
    };
  }, [slideCount, scrollToSlide]);

  return { containerRef };
}
