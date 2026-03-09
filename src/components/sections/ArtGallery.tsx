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

export default function ArtGallery() {
  const [currentPage, setCurrentPage] = useState(0);
  const [turning, setTurning] = useState<"forward" | "back" | null>(null);
  const activeRef = useRef(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const turningRef = useRef(false); // debounce

  const goToPage = useCallback(
    (next: number) => {
      if (turningRef.current) return;
      if (next < 0 || next >= ART_PAGES.length) return;
      turningRef.current = true;
      setTurning(next > currentPage ? "forward" : "back");

      setTimeout(() => {
        setCurrentPage(next);
        setTurning(null);
        turningRef.current = false;
      }, 600); // matches --turn-duration below
    },
    [currentPage]
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => { activeRef.current = entry.isIntersecting; },
      { threshold: 0.5 }
    );
    observer.observe(section);

    const onWheel = (e: WheelEvent) => {
      if (!activeRef.current) return;
      const atStart = currentPage === 0 && e.deltaY < 0;
      const atEnd   = currentPage === ART_PAGES.length - 1 && e.deltaY > 0;
      if (atStart || atEnd) return; // release to page scroll

      e.preventDefault();
      goToPage(e.deltaY > 0 ? currentPage + 1 : currentPage - 1);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      observer.disconnect();
      window.removeEventListener("wheel", onWheel);
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
