"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Image from "next/image";
import Link from "next/link";
import { useGlitchReveal } from "@/hooks/useGlitchReveal";

// ─── Blurb config ──────────────────────────────────────────────────────────────
const BLURBS = [
  { id: "name",     label: "ᯓ★",              value: "marwa",                       position: "sm:top-[28%] sm:left-[20%]",    rotation: -4, glitchDelay: 200 },
  { id: "location", label: "based in",         value: "lausanne, CH",                position: "sm:bottom-[30%] sm:left-[18%]", rotation: -2, glitchDelay: 360 },
  { id: "role",     label: "comp sci student", value: "& all pretty things enjoyer", position: "sm:bottom-[28%] sm:right-[18%]", rotation: 2,  glitchDelay: 500 },
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
      className={`relative sm:absolute ${position} max-w-[200px] text-center glitch-hidden`}
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
        <p className="relative z-10 text-base uppercase tracking-widest font-acidic opacity-60">
          {label}
        </p>
        <p className="relative z-10 mt-1 text-xl leading-snug font-acidic">
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── AboutMe ───────────────────────────────────────────────────────────────────
interface AboutMeProps {
  /** When set, the avatar becomes a link (clean mode → digidump). */
  avatarHref?: string;
}

export default function AboutMe({ avatarHref }: AboutMeProps) {
  const { sectionRef } = useGlitchReveal();

  const avatar = (
    <Image
      src="/images/avatar.png"
      alt={avatarHref ? "" : "Hand-drawn avatar of Marwa"}
      fill
      sizes="320px"
      className="avatar-idle object-contain transition-transform duration-300 motion-reduce:transition-none"
      style={{ filter: "invert(1)", zIndex: 1 }}
    />
  );

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

      <div className="relative flex min-h-screen w-full flex-col items-center justify-center gap-8 px-8 py-24 sm:flex-row sm:gap-0">

        {/* ── Central avatar ── */}
        <div
          data-glitch-reveal=""
          data-glitch-delay="0"
          data-glitch-type="image"
          className="relative z-10 h-56 w-56 shrink-0 glitch-hidden-img sm:h-80 sm:w-80"
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
          {avatarHref ? (
            <>
              <Link
                href={avatarHref}
                aria-label="Enter the digidump — the experimental version of this site"
                className="avatar-trigger group absolute inset-0 z-[1] block rounded-full focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#f0b0c4] [&:hover_img]:-rotate-3 [&:hover_img]:scale-105"
              >
                {avatar}
              </Link>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-6 top-2 z-[2] rotate-12 font-acidic text-xs opacity-45"
              >
                don&apos;t click me
              </span>
            </>
          ) : (
            avatar
          )}
        </div>

        {/* ── Info blurbs ── */}
        {BLURBS.map((b) => (
          <InfoBlurb key={b.id} {...b} />
        ))}

      </div>
    </SectionWrapper>
  );
}
