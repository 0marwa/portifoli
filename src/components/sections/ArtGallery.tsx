"use client";

import { useState, useEffect, useRef } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";

/**
 * ─── Art Gallery ──────────────────────────────────────────────────────────────
 *
 * 3D z-depth traversal: 12 drawings scattered across 4 depth layers.
 * Mouse-wheel moves the camera along the Z axis; drawings approach the viewer
 * as the camera advances. Lerped with rAF for smooth feel.
 *
 * Visual language: same dark canvas / particle-dimming pattern as Projects,
 * but with amber #f0b0c4 accent and Acidic title font instead of cyan/monospace.
 *
 * Navigation: mouse wheel hijacking (same boundary-escape pattern as Projects).
 * Clicking a piece opens ArtLightbox — dark technical detail view.
 *
 * TODO:
 *   1. Replace placeholder dot-grid divs with real art: uncomment <Image> in
 *      each piece and populate /public/images/art/ with actual drawings.
 *   2. Tune x/y/z coordinates per piece once real assets are placed.
 *   3. Add label strings to each piece for captions.
 */

// ─── Local types ──────────────────────────────────────────────────────────────

interface ArtPiece3D {
  id:       string;
  src:      string;
  alt:      string;
  x:        number;   // px offset from viewport center
  y:        number;   // px offset from viewport center
  z:        number;   // depth: 0 = camera plane, negative = further back
  rotation: number;   // degrees
  width:    number;
  height:   number;
  label?:   string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
// 12 drawings across 4 depth layers (z: -50, -500, -1100, -1700)

const DRAWINGS: ArtPiece3D[] = [
  // Layer 1 — z: -50 (nearest)
  { id: "d01", src: "/images/art/drawing01.png",  alt: "Drawing 1",  x: -260, y:  -80, z:  -50, rotation: -4,  width: 260, height: 320 },
  { id: "d02", src: "/images/art/drawing02.png",  alt: "Drawing 2",  x:  180, y:   60, z:  -50, rotation:  6,  width: 220, height: 280 },
  { id: "d03", src: "/images/art/drawing03.png",  alt: "Drawing 3",  x:  -60, y:  160, z:  -50, rotation: -1,  width: 300, height: 200 },

  // Layer 2 — z: -500
  { id: "d04", src: "/images/art/drawing04.png",  alt: "Drawing 4",  x: -200, y:  120, z: -500, rotation:  3,  width: 240, height: 300 },
  { id: "d05", src: "/images/art/drawing05.png",  alt: "Drawing 5",  x:  220, y: -100, z: -500, rotation: -7,  width: 200, height: 260 },
  { id: "d06", src: "/images/art/drawing06.png",  alt: "Drawing 6",  x:   30, y:  -60, z: -500, rotation:  2,  width: 280, height: 220 },

  // Layer 3 — z: -1100
  { id: "d07", src: "/images/art/drawing07.png",  alt: "Drawing 7",  x: -280, y:  -40, z: -1100, rotation: -3, width: 250, height: 310 },
  { id: "d08", src: "/images/art/drawing08.png",  alt: "Drawing 8",  x:  160, y:  140, z: -1100, rotation:  8, width: 210, height: 270 },
  { id: "d09", src: "/images/art/drawing09.png",  alt: "Drawing 9",  x:  -80, y: -150, z: -1100, rotation: -2, width: 290, height: 190 },

  // Layer 4 — z: -1700 (farthest)
  { id: "d10", src: "/images/art/drawing10.png",  alt: "Drawing 10", x: -220, y:  100, z: -1700, rotation:  5, width: 270, height: 340 },
  { id: "d11", src: "/images/art/drawing11.png",  alt: "Drawing 11", x:  200, y:  -80, z: -1700, rotation: -6, width: 230, height: 290 },
  { id: "d12", src: "/images/art/drawing12.png",  alt: "Drawing 12", x:  -20, y:  180, z: -1700, rotation:  1, width: 310, height: 210 },
];

const CAMERA_SPEED = 0.8;
const MAX_CAMERA_Z = 1800;
const LERP_FACTOR  = 0.12;

// ─── CornerBrackets ───────────────────────────────────────────────────────────

function CornerBrackets({
  color = "rgba(255,255,255,0.5)",
  size  = 10,
}: {
  color?: string;
  size?:  number;
}) {
  const shared: React.CSSProperties = {
    position:    "absolute",
    width:       size,
    height:      size,
    borderColor: color,
    borderStyle: "solid",
  };
  return (
    <>
      <span aria-hidden="true" style={{ ...shared, top: 0, left: 0,   borderWidth: "1px 0 0 1px" }} />
      <span aria-hidden="true" style={{ ...shared, top: 0, right: 0,  borderWidth: "1px 1px 0 0" }} />
      <span aria-hidden="true" style={{ ...shared, bottom: 0, left: 0, borderWidth: "0 0 1px 1px" }} />
      <span aria-hidden="true" style={{ ...shared, bottom: 0, right: 0, borderWidth: "0 1px 1px 0" }} />
    </>
  );
}

// ─── ArtLightbox ──────────────────────────────────────────────────────────────

function ArtLightbox({
  piece,
  pieceIndex,
  onClose,
}: {
  piece:      ArtPiece3D;
  pieceIndex: number;
  onClose:    () => void;
}) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const codeLabel = `ART-${String(pieceIndex + 1).padStart(4, "0")}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(8,12,12,0.96)" }}
      onClick={onClose}
    >
      {/* Panel */}
      <div
        className="relative overflow-y-auto"
        style={{
          width:      "min(90vw, 640px)",
          maxHeight:  "88vh",
          background: "#0a0f0f",
          border:     "1px solid rgba(240,176,196,0.35)",
          boxShadow:  "0 0 48px rgba(240,176,196,0.08), 8px 10px 32px rgba(0,0,0,0.8)",
          animation:  "stamp-in 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Corner brackets */}
        <CornerBrackets color="rgba(240,176,196,0.55)" size={14} />

        {/* Scan-line header bar */}
        <div
          aria-hidden="true"
          style={{
            position:   "absolute",
            top:        0,
            left:       0,
            right:      0,
            height:     2,
            background: "linear-gradient(90deg, transparent, rgba(240,176,196,0.6), transparent)",
          }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center text-xs transition-opacity hover:opacity-60"
          style={{
            fontFamily: "monospace",
            color:      "#f0b0c4",
            border:     "1px solid rgba(240,176,196,0.3)",
          }}
        >
          ✕
        </button>

        {/* Content */}
        <div className="flex flex-col items-center gap-4 p-8 pt-10">
          {/* Code label header */}
          <div className="flex w-full items-center gap-3">
            <span
              className="text-[9px] uppercase tracking-widest"
              style={{ fontFamily: "monospace", color: "#f0b0c4", opacity: 0.7 }}
            >
              {codeLabel}
            </span>
            <div
              aria-hidden="true"
              style={{ flex: 1, height: 1, background: "rgba(240,176,196,0.2)" }}
            />
            <span
              className="text-[9px] uppercase tracking-widest"
              style={{ fontFamily: "monospace", color: "#ffffff", opacity: 0.25 }}
            >
              CATALOG // 2025
            </span>
          </div>

          {/* Image area — placeholder until real assets exist */}
          <div
            className="relative flex w-full items-center justify-center overflow-hidden"
            style={{
              border:          "1px solid rgba(240,176,196,0.2)",
              minHeight:       220,
              background:      "#0d0d0d",
              backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize:  "12px 12px",
            }}
          >
            <CornerBrackets color="rgba(240,176,196,0.3)" size={10} />
            {/* TODO: replace with next/image once real assets are in /public/images/art/
            <Image src={piece.src} alt={piece.alt} width={560} height={400}
                   className="object-contain" /> */}
            <span
              className="text-[10px] opacity-30"
              style={{ fontFamily: "monospace", color: "#ffffff" }}
            >
              {piece.src}
            </span>
          </div>

          {/* Alt / label row */}
          <div className="flex w-full items-baseline justify-between">
            <p
              className="text-xs uppercase tracking-widest"
              style={{ fontFamily: "monospace", color: "#f0b0c4", opacity: 0.7 }}
            >
              {piece.label ?? piece.alt}
            </p>
            <p
              className="text-[9px]"
              style={{ fontFamily: "monospace", color: "#ffffff", opacity: 0.2 }}
            >
              ◇ ◇
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ArtGallery ───────────────────────────────────────────────────────────────

export default function ArtGallery() {
  const [cameraZ, setCameraZ] = useState(0);
  const [openPiece, setOpenPiece] = useState<{ piece: ArtPiece3D; index: number } | null>(null);

  const cameraZTargetRef = useRef(0);
  const rafRef           = useRef<number | null>(null);
  const isActiveRef      = useRef(false);
  const sectionRef       = useRef<HTMLElement | null>(null);

  // ── rAF lerp loop ────────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      setCameraZ((prev) => {
        const target = cameraZTargetRef.current;
        const next   = prev + (target - prev) * LERP_FACTOR;
        return Math.abs(next - target) < 0.1 ? target : next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── IntersectionObserver — particle dimming + active flag ────────────────────
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isActiveRef.current = entry.intersectionRatio >= 0.5;
        if (entry.isIntersecting) {
          document.documentElement.dataset.dimParticles = "1";
        } else {
          delete document.documentElement.dataset.dimParticles;
        }
      },
      { threshold: [0.4, 0.5] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Wheel scroll hijacking ────────────────────────────────────────────────────
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!isActiveRef.current) return;

      const target          = cameraZTargetRef.current;
      const scrollingForward = e.deltaY > 0;
      const scrollingBack    = e.deltaY < 0;
      const atStart          = target <= 0;
      const atEnd            = target >= MAX_CAMERA_Z;

      // At boundaries: let page scroll through
      if (atStart && scrollingBack)   return;
      if (atEnd   && scrollingForward) return;

      // Otherwise consume
      e.preventDefault();
      cameraZTargetRef.current = Math.max(
        0,
        Math.min(MAX_CAMERA_Z, target + e.deltaY * CAMERA_SPEED),
      );
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <SectionWrapper id="art">
      {/* Pulse-hint keyframe — injected locally to avoid touching globals.css */}
      <style>{`
        @keyframes pulse-hint {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 0.6; }
        }
      `}</style>

      {/* Invisible ref anchor — walks up to <section> for IntersectionObserver */}
      <div
        ref={(el) => {
          if (el) sectionRef.current = el.closest("section") as HTMLElement | null;
        }}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        aria-hidden="true"
      />

      {/* ── 3D scene container ───────────────────────────────────────────────── */}
      <div
        style={{
          perspective: "800px",
          overflow:    "hidden",
          width:       "100vw",
          height:      "100vh",
          position:    "relative",
        }}
      >
        {/* ── Section-level decorative chrome ─────────────────────────────────── */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 select-none overflow-hidden"
        >
          <CornerBrackets color="rgba(240,176,196,0.25)" size={24} />

          {/* XXX column — bottom-left */}
          <div
            className="absolute bottom-16 left-8 flex flex-col gap-1"
            style={{ fontFamily: "monospace", fontSize: 9, color: "#ffffff", opacity: 0.18, letterSpacing: "0.15em" }}
          >
            <span>X</span>
            <span>X</span>
            <span>X</span>
          </div>

          {/* Diamond pair — top-right area */}
          <div
            className="absolute right-10 top-20"
            style={{ fontFamily: "monospace", fontSize: 10, color: "#f0b0c4", opacity: 0.3, letterSpacing: "0.3em" }}
          >
            ◇ ◇
          </div>

          {/* Coordinate fragments */}
          <span
            className="absolute"
            style={{ bottom: 28, right: 14, fontFamily: "monospace", fontSize: 8, color: "#ffffff", opacity: 0.14, letterSpacing: "0.08em" }}
          >
            {"// 46.5° N"}
          </span>
          <span
            className="absolute"
            style={{ top: 28, left: 80, fontFamily: "monospace", fontSize: 8, color: "#ffffff", opacity: 0.12, letterSpacing: "0.08em" }}
          >
            &gt; 002
          </span>
          <span
            className="absolute"
            style={{ top: "40%", left: 12, fontFamily: "monospace", fontSize: 8, color: "#f0b0c4", opacity: 0.2, letterSpacing: "0.1em" }}
          >
            0.3
          </span>

          {/* Dashed decorative rectangles */}
          <div style={{ position: "absolute", top: "15%", right: "8%", width: 54, height: 36, border: "1px dashed rgba(255,255,255,0.1)" }} />
          <div style={{ position: "absolute", bottom: "22%", left: "6%", width: 40, height: 56, border: "1px dashed rgba(240,176,196,0.12)" }} />
          <div style={{ position: "absolute", top: "60%", right: "14%", width: 28, height: 20, border: "1px dashed rgba(255,255,255,0.08)" }} />
        </div>

        {/* ── Section title ────────────────────────────────────────────────────── */}
        <div
          className="pointer-events-none absolute top-8 left-1/2 z-20 -translate-x-1/2 text-center"
          style={{ animation: "stamp-in 0.5s cubic-bezier(0.16,1,0.3,1) forwards" }}
        >
          <p
            className="mb-1 text-[9px] uppercase tracking-widest"
            style={{ fontFamily: "monospace", color: "#f0b0c4", opacity: 0.6 }}
          >
            CATALOG // 2025
          </p>
          <div className="flex items-center gap-3">
            <div aria-hidden="true" style={{ width: 32, height: 1, background: "rgba(255,255,255,0.2)" }} />
            <p className="text-3xl leading-tight" style={{ fontFamily: "var(--font-acidic), sans-serif" }}>
              art
            </p>
            <div aria-hidden="true" style={{ width: 32, height: 1, background: "rgba(255,255,255,0.2)" }} />
          </div>
          <p
            className="mt-1 text-[9px] uppercase tracking-widest"
            style={{ fontFamily: "monospace", color: "#ffffff", opacity: 0.3 }}
          >
            sketchbook
          </p>
        </div>

        {/* ── Radial halo — keeps particles dimmed behind the 3D scene ─────────── */}
        <div
          aria-hidden="true"
          style={{
            position:      "absolute",
            top:           "50%",
            left:          "50%",
            transform:     "translate(-50%, -50%)",
            width:         "75vw",
            height:        "85vh",
            borderRadius:  "40%",
            background:    "radial-gradient(ellipse, #000000 10%, transparent 68%)",
            zIndex:        0,
            pointerEvents: "none",
          }}
        />

        {/* ── Depth indicator — right side ─────────────────────────────────────── */}
        <div
          className="pointer-events-none absolute right-6 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-2"
        >
          <span
            style={{
              fontFamily:  "monospace",
              fontSize:    8,
              color:       "#f0b0c4",
              opacity:     0.5,
              letterSpacing: "0.15em",
              writingMode: "vertical-rl",
            }}
          >
            DEPTH
          </span>
          <div
            style={{
              position:   "relative",
              width:      2,
              height:     120,
              background: "rgba(255,255,255,0.1)",
            }}
          >
            <div
              style={{
                position:   "absolute",
                top:        0,
                left:       0,
                right:      0,
                height:     `${(cameraZ / MAX_CAMERA_Z) * 100}%`,
                background: "linear-gradient(to bottom, #f0b0c4, transparent)",
                transition: "height 0.1s linear",
              }}
            />
          </div>
        </div>

        {/* ── Scroll hint — visible until camera begins moving ────────────────── */}
        {cameraZ < 50 && (
          <div
            className="pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
            style={{
              animation:     "pulse-hint 2s ease-in-out infinite",
              fontFamily:    "monospace",
              fontSize:      8,
              color:         "#f0b0c4",
              letterSpacing: "0.2em",
              whiteSpace:    "nowrap",
            }}
          >
            SCROLL TO EXPLORE ↓
          </div>
        )}

        {/* ── preserve-3d scene root ───────────────────────────────────────────── */}
        <div
          style={{
            transformStyle: "preserve-3d",
            position:       "absolute",
            inset:          0,
          }}
        >
          {DRAWINGS.map((piece, i) => {
            const effectiveZ = piece.z + cameraZ;
            const isPast     = effectiveZ > 300;
            const codeLabel  = `ART-${String(i + 1).padStart(4, "0")}`;

            return (
              <div
                key={piece.id}
                data-repel
                className="absolute cursor-pointer"
                style={{
                  top:           "50%",
                  left:          "50%",
                  transform:     `translate3d(calc(-50% + ${piece.x}px), calc(-50% + ${piece.y}px), ${effectiveZ}px) rotate(${piece.rotation}deg)`,
                  opacity:       isPast ? 0 : 1,
                  pointerEvents: isPast ? "none" : "auto",
                  // Only transition opacity — transform changes every rAF frame
                  transition:    "opacity 0.2s ease",
                }}
                onClick={() => setOpenPiece({ piece, index: i })}
              >
                {/* Inner wrapper handles hover scale — child of 3D div to avoid stacking context issues */}
                <div className="transition-transform duration-200 hover:scale-105">
                  {/* Tech frame */}
                  <div
                    className="relative"
                    style={{
                      width:  piece.width,
                      height: piece.height,
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <CornerBrackets color="rgba(255,255,255,0.4)" size={10} />

                    {/* Scan-line bar */}
                    <div
                      aria-hidden="true"
                      style={{
                        position:   "absolute",
                        top:        0,
                        left:       0,
                        right:      0,
                        height:     1,
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
                        zIndex:     1,
                      }}
                    />

                    {/* Dot-grid placeholder — replace with <Image> once assets exist */}
                    {/* TODO: replace with next/image once real assets are in /public/images/art/
                    <Image src={piece.src} alt={piece.alt}
                           width={piece.width} height={piece.height}
                           className="object-contain" /> */}
                    <div
                      className="flex h-full w-full items-center justify-center text-[9px]"
                      style={{
                        background:      "#0d0d0d",
                        backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
                        backgroundSize:  "12px 12px",
                        color:           "#ffffff",
                        opacity:         0.35,
                        fontFamily:      "monospace",
                        letterSpacing:   "0.05em",
                      }}
                    >
                      {piece.src}
                    </div>
                  </div>

                  {/* Code label */}
                  <p
                    className="mt-1 text-center text-[9px] uppercase tracking-widest"
                    style={{ fontFamily: "monospace", color: "#f0b0c4", opacity: 0.5 }}
                  >
                    {codeLabel}
                  </p>

                  {/* Optional caption */}
                  {piece.label && (
                    <p
                      className="mt-0.5 text-center text-[8px] uppercase tracking-widest"
                      style={{ fontFamily: "monospace", color: "#ffffff", opacity: 0.3 }}
                    >
                      {piece.label}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {openPiece && (
        <ArtLightbox
          piece={openPiece.piece}
          pieceIndex={openPiece.index}
          onClose={() => setOpenPiece(null)}
        />
      )}
    </SectionWrapper>
  );
}
