"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Image from "next/image";
import { useGlitchReveal } from "@/hooks/useGlitchReveal";

// ─── Blurb config ──────────────────────────────────────────────────────────────
const BLURBS = [
  { id: "name",     label: "ᯓ★",              value: "marwa",                       position: "top-[28%] left-[20%]",    rotation: -4, glitchDelay: 200 },
  { id: "location", label: "based in",         value: "lausanne, CH",                position: "bottom-[30%] left-[18%]", rotation: -2, glitchDelay: 360 },
  { id: "role",     label: "comp sci student", value: "& all pretty things enjoyer", position: "bottom-[28%] right-[18%]", rotation: 2,  glitchDelay: 500 },
];

// ─── InfoBlurb ─────────────────────────────────────────────────────────────────
interface InfoBlurbProps {
  id: string;
  label: string;
  value: string;
  position: string;
  rotation?: number;
  glitchDelay?: number;
}

function InfoBlurb({ id, label, value, position, rotation = 0, glitchDelay = 0 }: InfoBlurbProps) {
  return (
    // Outer div: positioning + glitch reveal animation (owns opacity + transform)
    <div
      data-blurb-id={id}
      data-glitch-reveal=""
      data-glitch-delay={String(glitchDelay)}
      className={`absolute ${position} max-w-[140px] text-center glitch-hidden`}
    >
      {/* Inner div: static rotation — isolated so it doesn't conflict with keyframe transforms */}
      <div style={{ transform: `rotate(${rotation}deg)` }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "-60%",
            borderRadius: "50%",
            background: "radial-gradient(circle, #000000 15%, transparent 70%)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <p className="relative z-10 text-xs font-bold uppercase tracking-widest opacity-60">
          {label}
        </p>
        <p className="relative z-10 mt-1 text-base leading-snug font-acidic">
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── AboutMe ───────────────────────────────────────────────────────────────────
export default function AboutMe() {
  const { sectionRef } = useGlitchReveal();

  return (
    <SectionWrapper id="about">
      {/* Ref anchor — walks up to <section> for IntersectionObserver */}
      <div
        ref={(el) => {
          if (el) sectionRef.current = el.closest("section") as HTMLElement | null;
        }}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />

      <div className="relative flex min-h-screen w-full items-center justify-center px-8 py-24">

        {/* ── Central avatar ── */}
        <div
          data-glitch-reveal=""
          data-glitch-delay="0"
          data-glitch-type="image"
          className="relative z-10 h-64 w-64 shrink-0 glitch-hidden-img"
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: "-30%",
              borderRadius: "50%",
              background: "radial-gradient(circle, #000000 20%, transparent 70%)",
              zIndex: 0,
            }}
          />
          <Image
            src="/images/avatar.png"
            alt="Hand-drawn avatar of Marwa"
            fill
            className="object-contain"
            style={{ filter: "invert(1)", zIndex: 1 }}
          />
        </div>

        {/* ── Info blurbs ── */}
        {BLURBS.map((b) => (
          <InfoBlurb key={b.id} {...b} />
        ))}

      </div>
    </SectionWrapper>
  );
}
