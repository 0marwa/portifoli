"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import type { ArtPage } from "@/types";

/**
 * ─── Art Gallery ──────────────────────────────────────────────────────────────
 *
 * Scrapbook-style page-turn gallery.
 * Navigation is via drag-to-peel (Pointer Events), left/right arrow buttons,
 * and ArrowLeft/ArrowRight keyboard keys.
 * The wheel hijacking approach has been removed entirely.
 *
 * Drag mechanic:
 *   - Dragging left/right rotates the page on the Y axis (--peel-angle).
 *   - Releasing with |deltaX| > 80px completes the page turn.
 *   - Releasing below the threshold springs back to 0.
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

/** Minimum drag distance (px) before a drag commits to a page turn. */
const DRAG_THRESHOLD = 80;

/** Scale factor: maps drag pixels to rotation degrees. */
const DRAG_ANGLE_SCALE = 0.3;

export default function ArtGallery() {
  const [currentPage, setCurrentPage] = useState(0);

  // Ref copy of currentPage — prevents stale closure bugs in pointer handlers
  const currentPageRef = useRef(0);
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // true while a page-turn animation is in progress — blocks stacking turns
  const turningRef = useRef(false);

  // Drag state
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  // The scrapbook page element — we write --peel-angle directly on its style
  const pageRef = useRef<HTMLDivElement>(null);

  /**
   * Triggers a page-turn animation to `next`, then commits the state change.
   * Animation: rotate to ±90deg → swap page → rotate back from ∓90deg to 0.
   */
  const goToPage = useCallback((next: number) => {
    if (turningRef.current) return;
    if (next < 0 || next >= ART_PAGES.length) return;

    const current = currentPageRef.current;
    const goingForward = next > current;
    const targetAngle = goingForward ? -90 : 90;
    const fromAngle = goingForward ? 90 : -90;

    turningRef.current = true;

    const el = pageRef.current;
    if (el) {
      // Animate to ±90deg (page folds away)
      el.style.transition = "transform 0.15s ease-in";
      el.style.transform = `rotateY(${targetAngle}deg)`;
    }

    setTimeout(() => {
      // Swap the page content
      setCurrentPage(next);

      if (el) {
        // Snap to the mirror angle (no transition) then animate back to 0
        el.style.transition = "none";
        el.style.transform = `rotateY(${fromAngle}deg)`;

        // Force reflow so the snap takes effect before the next transition
        void el.offsetHeight;

        el.style.transition = "transform 0.15s ease-out";
        el.style.transform = "rotateY(0deg)";
      }

      setTimeout(() => {
        turningRef.current = false;
        if (el) {
          // Clean up inline styles — let CSS class handle the resting state
          el.style.transition = "";
          el.style.transform = "";
        }
      }, 150);
    }, 150);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goToPage(currentPageRef.current + 1);
      if (e.key === "ArrowLeft")  goToPage(currentPageRef.current - 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goToPage]);

  // ── Pointer event handlers ─────────────────────────────────────────────────

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (turningRef.current) return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartXRef.current;
    const angle = deltaX * DRAG_ANGLE_SCALE;
    const el = pageRef.current;
    if (el) {
      el.style.transition = "none";
      el.style.transform = `rotateY(${angle}deg)`;
    }
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    const deltaX = e.clientX - dragStartXRef.current;
    const el = pageRef.current;

    if (Math.abs(deltaX) > DRAG_THRESHOLD) {
      // Commit the page turn — goToPage takes over the animation from here
      // Reset the inline transform first so goToPage's animation starts clean
      if (el) {
        el.style.transition = "";
        el.style.transform = "";
      }
      goToPage(deltaX < 0 ? currentPageRef.current + 1 : currentPageRef.current - 1);
    } else {
      // Spring back to neutral
      if (el) {
        el.style.transition = "transform 0.3s ease-out";
        el.style.transform = "rotateY(0deg)";
        setTimeout(() => {
          el.style.transition = "";
          el.style.transform = "";
        }, 300);
      }
    }
  }, [goToPage]);

  const onPointerCancel = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    const el = pageRef.current;
    if (el) {
      el.style.transition = "transform 0.3s ease-out";
      el.style.transform = "rotateY(0deg)";
      setTimeout(() => {
        el.style.transition = "";
        el.style.transform = "";
      }, 300);
    }
  }, []);

  const page = ART_PAGES[currentPage];

  return (
    <SectionWrapper id="art">
      <div
        className="relative flex h-screen w-full items-center justify-center overflow-hidden"
        style={
          {
            perspective: "1200px",
            "--turn-duration": "0.15s",
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

        {/* ── The scrapbook page — drag to peel ── */}
        <div
          ref={pageRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          className={`
            relative h-[80vh] w-[70vw] max-w-3xl
            rounded-sm border border-current/20
            bg-[#faf6ee]
            shadow-[4px_4px_0_rgba(0,0,0,0.12)]
            select-none
            ${isDragging ? "cursor-grabbing" : "cursor-grab"}
          `}
          style={{
            // Resting state: no inline transform — animation writes directly when active
            touchAction: "none",
          }}
        >
          {/* Drawings scattered on the page */}
          {page.drawings.map((piece) => (
            <div
              key={piece.id}
              className="absolute cursor-pointer transition-transform hover:scale-105 hover:z-10"
              style={{
                transform: `rotate(${piece.rotation ?? 0}deg)`,
                // TODO: set absolute top/left per piece once real assets are placed
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
