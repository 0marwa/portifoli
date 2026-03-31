"use client";

import { useEffect, useRef } from "react";

/**
 * Custom HUD-style cursor.
 * Hides the OS cursor and renders a targeting reticle that follows the mouse.
 * Position is written directly to DOM refs — zero React re-renders per frame.
 *
 * The reticle has two layers:
 *   - Inner dot (4px, pink #f0b0c4): follows exactly
 *   - Outer ring (18px, white 40%): follows with a slight lerp for a floating feel
 *
 * Scales up when hovering interactive elements (a, button, [role=button]).
 */
export default function CustomCursor() {
  const dotRef   = useRef<HTMLDivElement>(null);
  const ringRef  = useRef<HTMLDivElement>(null);
  const rafRef   = useRef<number | null>(null);
  const mouseRef = useRef({ x: -100, y: -100 });
  const ringPos  = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      // Dot follows immediately
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }

      // Enlarge on interactive elements
      const target = e.target as HTMLElement;
      const isInteractive = target.closest("a, button, [role=button], input, textarea, select, label");
      if (ringRef.current) {
        ringRef.current.style.scale = isInteractive ? "2.2" : "1";
        ringRef.current.style.opacity = isInteractive ? "0.7" : "0.4";
      }
    };

    // Ring lerps toward mouse in rAF loop
    const tick = () => {
      const { x: mx, y: my } = mouseRef.current;
      const { x: rx, y: ry } = ringPos.current;
      const nx = rx + (mx - rx) * 0.18;
      const ny = ry + (my - ry) * 0.18;
      ringPos.current = { x: nx, y: ny };
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${nx}px, ${ny}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    window.addEventListener("mousemove", onMove);

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      {/* Outer ring — lerped, scales on hover */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position:        "fixed",
          top:             0,
          left:            0,
          width:           18,
          height:          18,
          marginLeft:      -9,
          marginTop:       -9,
          borderRadius:    "50%",
          border:          "1px solid rgba(255,255,255,0.4)",
          pointerEvents:   "none",
          zIndex:          9999,
          transform:       "translate(-100px, -100px)",
          transition:      "scale 0.2s ease, opacity 0.2s ease",
          willChange:      "transform",
        }}
      />

      {/* Inner dot — follows exactly */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position:      "fixed",
          top:           0,
          left:          0,
          width:         4,
          height:        4,
          marginLeft:    -2,
          marginTop:     -2,
          borderRadius:  "50%",
          background:    "#f0b0c4",
          pointerEvents: "none",
          zIndex:        9999,
          transform:     "translate(-100px, -100px)",
          willChange:    "transform",
        }}
      />
    </>
  );
}
