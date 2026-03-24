"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Image from "next/image";

// ─── Blurb config ──────────────────────────────────────────────────────────────
const BLURBS = [
  { id: "name",     label: "ᯓ★",              value: "marwa",                   position: "top-[28%] left-[20%]",    rotation: -4 },
  { id: "location", label: "based in",         value: "lausanne, CH",            position: "bottom-[30%] left-[18%]", rotation: -2 },
  { id: "role",     label: "comp sci student", value: "& all pretty things enjoyer", position: "bottom-[28%] right-[18%]", rotation: 2  },
];

// ─── InfoBlurb ─────────────────────────────────────────────────────────────────
interface InfoBlurbProps {
  id: string;
  label: string;
  value: string;
  position: string;
  rotation?: number;
}

function InfoBlurb({ id, label, value, position, rotation = 0 }: InfoBlurbProps) {
  return (
    <div
      data-blurb-id={id}
      className={`absolute ${position} max-w-[140px] text-center`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
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
      <p
        className="relative z-10 mt-1 text-base leading-snug font-acidic"
      >
        {value}
      </p>
    </div>
  );
}

// ─── AboutMe ───────────────────────────────────────────────────────────────────
export default function AboutMe() {
  return (
    <SectionWrapper id="about">
      <div className="relative flex min-h-screen w-full items-center justify-center px-8 py-24">

        {/* ── Central avatar ── */}
        <div className="relative z-10 h-64 w-64 shrink-0">
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


