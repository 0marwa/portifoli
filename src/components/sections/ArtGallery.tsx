"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Image from "next/image";
import type { ArtPage } from "@/types";

/**
 * ─── Art Gallery ──────────────────────────────────────────────────────────────
 *
 * Scrapbook-style page-turn gallery.
 * Vertical scroll is hijacked while there are pages left; each wheel tick
 * advances one page with a CSS 3-D page-turn animation.
 * When the last page is reached, scroll is released back to the window.
 *
 * TODO:
 *   1. Populate ART_PAGES with real drawings from /public/images/art/.
 *   2. Tune rotation values for each piece to get the scrapbook feel.
 *   3. Add paper/tape texture assets to each page background.
 *   4. Adjust the page-turn animation timing (--turn-duration) to taste.
 */

const ART_PAGES: ArtPage[] = [
  {
    id: "page-1",
    drawings: [
      { id: "d1", src: "/images/art/drawing1.png", alt: "Drawing 1", rotation: -3, width: 280, height: 320 },
      { id: "d2", src: "/images/art/drawing2.png", alt: "Drawing 2", rotation:  5, width: 200, height: 260 },
      { id: "d3", src: "/images/art/drawing3.png", alt: "Drawing 3", rotation: -1, width: 240, height: 200 },
      // TODO: add more pieces per page
    ],
  },
  {
    id: "page-2",
    drawings: [
      { id: "d4", src: "/images/art/drawing4.png", alt: "Drawing 4", rotation:  2, width: 300, height: 350 },
      { id: "d5", src: "/images/art/drawing5.png", alt: "Drawing 5", rotation: -6, width: 220, height: 280 },
    ],
  },
  // TODO: add more pages ↓
];

/** Minimum accumulated vertical scroll (px) before flipping one page. */
const PAGE_DELTA_THRESHOLD = 80;

/**
 * Grace period (ms) after the section enters the viewport before wheel
 * hijacking starts — lets inbound scroll momentum die out so page 0
 * isn't immediately consumed on arrival.
 */
const ART_ENTER_DELAY_MS = 400;

/**
 * Minimum accumulated vertical scroll (px) past the first/last page before
 * Y-axis scroll is released back to the page.  Keeps the boundary pages
 * visible long enough for the user to actually read them.
 */
const ART_EXIT_DELTA = 120;

export default function ArtGallery() {
  const [currentPage, setCurrentPage] = useState(0);
  const [turning, setTurning] = useState<"forward" | "back" | null>(null);

  // true while the section is ≥50% visible
  const activeRef      = useRef(false);
  // true once ART_ENTER_DELAY_MS has elapsed after entering the viewport
  const readyRef       = useRef(false);
  const sectionRef     = useRef<HTMLDivElement>(null);
  // true while a page-turn animation is in progress — blocks stacking turns
  const turningRef     = useRef(false);
  // accumulated wheel deltaY between page flips
  const deltaAccRef    = useRef(0);
  // accumulated wheel deltaY while at the first/last page (exit buffer)
  const exitDeltaRef   = useRef(0);
  // handle for the entry-delay timer so it can be cancelled on unmount
  const enterTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Triggers a page-turn animation to `next`, then commits the state change
   * once the animation duration (600ms) has elapsed.
   * turningRef blocks any new flip until the transition finishes.
   */
  const goToPage = useCallback(
    (next: number) => {
      if (turningRef.current) return;          // animation already running
      if (next < 0 || next >= ART_PAGES.length) return;

      turningRef.current  = true;
      deltaAccRef.current = 0;                 // discard queued delta
      setTurning(next > currentPage ? "forward" : "back");

      setTimeout(() => {
        setCurrentPage(next);  // commit new page index
        setTurning(null);      // remove animation class
        turningRef.current = false;
      }, 600); // must match --turn-duration in globals.css
    },
    [currentPage]
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // ── Visibility tracking ─────────────────────────────────────────────────
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          activeRef.current    = true;
          deltaAccRef.current  = 0;
          exitDeltaRef.current = 0;

          // Start entry-delay timer — wheel hijacking won't begin until it fires
          if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
          enterTimerRef.current = setTimeout(() => {
            readyRef.current = true;
          }, ART_ENTER_DELAY_MS);
        } else {
          // Section left the viewport — reset all scroll state
          activeRef.current    = false;
          readyRef.current     = false;
          deltaAccRef.current  = 0;
          exitDeltaRef.current = 0;
          if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
        }
      },
      { threshold: 0.5 } // fire when ≥50% of the section is visible
    );
    observer.observe(section);

    // ── Wheel handler ───────────────────────────────────────────────────────
    const onWheel = (e: WheelEvent) => {
      // Guard — section not visible, or still in entry-delay window
      if (!activeRef.current || !readyRef.current) return;

      const atStart = currentPage === 0                       && e.deltaY < 0;
      const atEnd   = currentPage === ART_PAGES.length - 1   && e.deltaY > 0;

      // ── Boundary handling (first / last page) ───────────────────────────
      if (atStart || atEnd) {
        // Hold Y scroll while the user is resting on the boundary page.
        // Only release once they've accumulated ART_EXIT_DELTA px of intent.
        exitDeltaRef.current += e.deltaY;
        if (Math.abs(exitDeltaRef.current) < ART_EXIT_DELTA) {
          e.preventDefault(); // still holding Y
          return;
        }
        // Threshold crossed → release Y scroll back to the page
        exitDeltaRef.current = 0;
        return; // no preventDefault — page scrolls normally
      }

      // ── Mid-gallery: own the Y axis entirely ────────────────────────────
      e.preventDefault();
      exitDeltaRef.current = 0; // not at a boundary, reset exit counter

      // Don't stack page-turns while one is already animating
      if (turningRef.current) return;

      // Accumulate delta until the intentional-flip threshold is met
      deltaAccRef.current += e.deltaY;
      if (Math.abs(deltaAccRef.current) < PAGE_DELTA_THRESHOLD) return;

      goToPage(deltaAccRef.current > 0 ? currentPage + 1 : currentPage - 1);
    };

    // passive: false required to allow e.preventDefault() inside the handler
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      observer.disconnect();
      window.removeEventListener("wheel", onWheel);
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
    };
  }, [currentPage, goToPage]);

  const page = ART_PAGES[currentPage];

  return (
    <SectionWrapper id="art">
      <div
        ref={sectionRef}
        className="relative flex h-screen w-full items-center justify-center overflow-hidden"
        style={
          {
            perspective: "1200px",
            "--turn-duration": "0.6s",
          } as React.CSSProperties
        }
      >
        {/* Page counter */}
        <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 text-xs uppercase tracking-widest opacity-50">
          {currentPage + 1} / {ART_PAGES.length}
        </div>

        {/* Navigation arrows */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 0}
          aria-label="Previous page"
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 text-2xl opacity-40 transition-opacity hover:opacity-80 disabled:pointer-events-none disabled:opacity-10"
        >
          ←
        </button>
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === ART_PAGES.length - 1}
          aria-label="Next page"
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 text-2xl opacity-40 transition-opacity hover:opacity-80 disabled:pointer-events-none disabled:opacity-10"
        >
          →
        </button>

        {/* ── The scrapbook page ── */}
        <div
          className={`
            relative h-[80vh] w-[70vw] max-w-3xl
            rounded-sm border border-current/20
            bg-[#faf6ee]           /* TODO: replace with paper texture via bg-image */
            shadow-[4px_4px_0_rgba(0,0,0,0.12)]
            transition-transform
            ${turning === "forward" ? "animate-page-turn-forward" : ""}
            ${turning === "back"    ? "animate-page-turn-back"    : ""}
          `}
        >
          {/* Drawings scattered on the page */}
          {page.drawings.map((piece) => (
            <div
              key={piece.id}
              className="absolute cursor-pointer transition-transform hover:scale-105 hover:z-10"
              style={{
                transform: `rotate(${piece.rotation ?? 0}deg)`,
                /* TODO: position each piece properly once you have real assets.
                   For now they stack in the centre. Replace with absolute
                   top/left values per piece. */
                top: "50%",
                left: "50%",
                marginTop: `-${(piece.height ?? 200) / 2}px`,
                marginLeft: `-${(piece.width ?? 200) / 2}px`,
              }}
            >
              {/* TODO: uncomment once real assets are in /public/images/art/ */}
              {/* <Image
                src={piece.src}
                alt={piece.alt}
                width={piece.width ?? 200}
                height={piece.height ?? 200}
                className="object-contain"
              /> */}
              <div
                className="flex items-center justify-center border border-dashed border-current/30 bg-white/50 text-xs opacity-40"
                style={{ width: piece.width ?? 200, height: piece.height ?? 200 }}
              >
                {piece.src}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
