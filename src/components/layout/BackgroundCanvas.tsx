"use client";

import { useEffect, useRef } from "react";

// ─── Tuning ────────────────────────────────────────────────────────────────────
const STAR_COUNT   = 22;
const MOUSE_RADIUS = 110;     // px — proximity to trigger vanish
const FADE_OUT_SPD = 0.045;   // opacity drop per frame (~60fps → ~15 frames)
const FADE_IN_SPD  = 0.014;   // opacity rise per frame (slower = ghostly re-entry)
const IDLE_ALPHA   = 0.72;    // max opacity at rest
const BG           = "#0d0d0d";
const INK          = "210,205,195"; // off-white / warm parchment RGB

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Dot {
  px: number;
  py: number;
  dr: number; // dot radius
}

interface Star {
  x: number;
  y: number;
  size: number;        // body radius in px (inner ballpark)
  outerScale: number;  // spike arm length = size * outerScale
  innerRatio: number;  // inner valley radius = size * innerRatio (keeps spikes sharp)
  numSpikes: number;   // 4 or 6
  rotation: number;    // current rotation in radians
  rotSpeed: number;    // radians per frame (very slow idle spin)
  jitter: number[];    // per-spike length multiplier — slight irregularity, hand-drawn feel
  dots: Dot[];         // precomputed stipple dots in local star space
  opacity: number;     // current rendered opacity
  phase: "idle" | "out" | "in";
}

// ─── Star factory ──────────────────────────────────────────────────────────────
/**
 * Creates one star with randomised shape, size, and position.
 *
 * Shape inspired by the reference images:
 *   - 4 elongated needle-like spikes (or 6 for variety), very concave between them
 *   - Stipple/grain texture: dozens of tiny dots scattered inside the star path
 *   - Slight per-spike length jitter for an inked, hand-drawn quality
 */
function makeStar(w: number, h: number): Star {
  const numSpikes  = Math.random() < 0.65 ? 4 : 6;
  const size       = 7 + Math.random() * 13;          // 7 – 20 px body
  const outerScale = 3.0 + Math.random() * 3.2;        // 3.0 – 6.2 (needle length)
  const innerRatio = 0.04 + Math.random() * 0.09;      // 0.04 – 0.13 → deeply concave
  const outer      = size * outerScale;

  // Per-spike length multiplier so no two spikes are identical
  const jitter = Array.from(
    { length: numSpikes },
    () => 0.80 + Math.random() * 0.40,
  );

  // Precompute stipple dot positions in local space (polar → cartesian)
  // Bias toward the interior with `r * r` so density falls off toward spike tips
  const dotCount = 30 + Math.floor(Math.random() * 20);
  const dots: Dot[] = Array.from({ length: dotCount }, () => {
    const r = Math.sqrt(Math.random()) * outer * 0.68; // sqrt for even radial distribution
    const a = Math.random() * Math.PI * 2;
    return {
      px: Math.cos(a) * r,
      py: Math.sin(a) * r,
      dr: 0.3 + Math.random() * 0.85,
    };
  });

  return {
    x         : Math.random() * w,
    y         : Math.random() * h,
    size,
    outerScale,
    innerRatio,
    numSpikes,
    rotation  : Math.random() * Math.PI * 2,
    rotSpeed  : (Math.random() - 0.5) * 0.00035, // ±0.00035 rad/frame ≈ ±1.2°/s
    jitter,
    dots,
    opacity   : IDLE_ALPHA * (0.45 + Math.random() * 0.55),
    phase     : "idle",
  };
}

// ─── Canvas drawing ────────────────────────────────────────────────────────────

/** Builds the star polygon path WITHOUT stroking or filling. */
function buildStarPath(ctx: CanvasRenderingContext2D, star: Star) {
  const { size, outerScale, innerRatio, numSpikes, jitter } = star;
  const outer = size * outerScale;
  const inner = size * innerRatio;
  const PI2   = Math.PI * 2;

  ctx.beginPath();
  for (let i = 0; i < numSpikes * 2; i++) {
    // Alternate between outer tip and inner valley
    const angle    = (i / (numSpikes * 2)) * PI2 - Math.PI / 2;
    const isOuter  = i % 2 === 0;
    const spikeIdx = Math.floor(i / 2);
    const r        = isOuter ? outer * (jitter[spikeIdx] ?? 1) : inner;
    const px       = Math.cos(angle) * r;
    const py       = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

/**
 * Draws one star:
 *   1. Clip to star path → fill semi-transparent base + scatter stipple dots
 *   2. Stroke the outline for the sharp inked silhouette
 */
function drawStar(ctx: CanvasRenderingContext2D, star: Star) {
  if (star.opacity <= 0.01) return;

  const { x, y, rotation, opacity, dots, size, outerScale } = star;
  const outer = size * outerScale;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = opacity;

  // ── Clipped interior: base fill + stipple dots ──────────────────────────────
  buildStarPath(ctx, star);
  ctx.save();
  ctx.clip(); // clip all subsequent draws to the star shape

  // Faint base fill so the star body reads against the dark background
  ctx.fillStyle = `rgba(${INK},0.07)`;
  ctx.fillRect(-outer * 1.7, -outer * 1.7, outer * 3.4, outer * 3.4);

  // Stipple: tiny dots scattered inside the clipped star region
  const PI2 = Math.PI * 2;
  for (const d of dots) {
    ctx.beginPath();
    ctx.arc(d.px, d.py, d.dr, 0, PI2);
    ctx.fillStyle = `rgba(${INK},0.52)`;
    ctx.fill();
  }

  ctx.restore(); // removes clip

  // ── Stroke outline ───────────────────────────────────────────────────────────
  buildStarPath(ctx, star);
  ctx.strokeStyle = `rgba(${INK},0.62)`;
  ctx.lineWidth   = 0.9;
  ctx.stroke();

  ctx.restore(); // removes translate/rotate/globalAlpha
}

// ─── Component ─────────────────────────────────────────────────────────────────
/**
 * A fullscreen fixed canvas rendered behind all content (z-index: -10).
 *
 * On the dark #0d0d0d background, off-white sigil-stars are scattered randomly.
 * Each star slowly rotates.  When the mouse comes within MOUSE_RADIUS pixels:
 *   1. The star fades out over ~15 frames
 *   2. It teleports to a new random position (away from the cursor)
 *   3. It fades back in over ~50 frames — ghostly reappearance
 *
 * The canvas is purely decorative (pointer-events: none) and resizes with the
 * viewport via ResizeObserver.
 */
export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D | null;
    if (!ctx) return;
    // After the null guard, reassign to a non-null const so closures see the narrowed type
    const context: CanvasRenderingContext2D = ctx;

    // Track viewport size
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width  = w;
    canvas.height = h;

    // Initialise star field
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => makeStar(w, h));

    // Track mouse position; start off-screen so nothing triggers at load
    let mx = -9999;
    let my = -9999;
    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    window.addEventListener("mousemove", onMouseMove);

    // Resize: update canvas dimensions, keep stars in bounds
    const ro = new ResizeObserver(() => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width  = w;
      canvas.height = h;
    });
    ro.observe(document.documentElement);

    // ── Animation loop ─────────────────────────────────────────────────────────
    let rafId: number;

    function tick() {
      // Clear to the dark base colour
      context.fillStyle = BG;
      context.fillRect(0, 0, w, h);

      for (const star of stars) {
        // Slow idle spin
        star.rotation += star.rotSpeed;

        const dist = Math.hypot(star.x - mx, star.y - my);

        if (star.phase === "idle") {
          // Trigger fade-out when mouse enters proximity
          if (dist < MOUSE_RADIUS) {
            star.phase = "out";
          }
        } else if (star.phase === "out") {
          star.opacity -= FADE_OUT_SPD;

          if (star.opacity <= 0) {
            star.opacity = 0;

            // Teleport to a random position that is safely away from the cursor
            // (try up to 20 times, then place anywhere — prevents rare infinite loop)
            let attempts = 0;
            do {
              star.x = 40 + Math.random() * (w - 80);
              star.y = 40 + Math.random() * (h - 80);
              attempts++;
            } while (
              Math.hypot(star.x - mx, star.y - my) < MOUSE_RADIUS * 1.6 &&
              attempts < 20
            );

            star.phase = "in";
          }
        } else if (star.phase === "in") {
          star.opacity += FADE_IN_SPD;

          if (star.opacity >= IDLE_ALPHA) {
            star.opacity = IDLE_ALPHA;
            star.phase   = "idle";
          }
        }

        drawStar(context, star);
      }

      rafId = requestAnimationFrame(tick);
    }

    tick();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position    : "fixed",
        inset       : 0,
        width       : "100%",
        height      : "100%",
        zIndex      : -10,
        pointerEvents: "none",
        display     : "block",
      }}
    />
  );
}
