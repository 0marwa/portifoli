import SectionWrapper from "@/components/ui/SectionWrapper";
import Image from "next/image";

/**
 * ─── About Me ─────────────────────────────────────────────────────────────────
 *
 * Layout: hand-drawn avatar in the centre, radiating arrows pointing to
 * info blurbs (name, role, location, skills, fun-fact, etc.)
 *
 * TODO:
 *   1. Replace /images/avatar.png with your actual hand-drawn avatar.
 *   2. Replace the placeholder text in each <InfoBlurb> with your real info.
 *   3. Swap the inline SVG arrows for your hand-drawn arrow assets.
 *   4. Apply your grungy font classes once the font is added to the project.
 */

interface InfoBlurbProps {
  label: string;
  value: string;
  /** Tailwind positioning classes, e.g. "top-8 left-0" */
  position: string;
  /** degrees to rotate the blurb for a hand-drawn tilt effect */
  rotation?: number;
}

function InfoBlurb({ label, value, position, rotation = 0 }: InfoBlurbProps) {
  return (
    <div
      className={`absolute ${position} max-w-[140px] text-center`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* TODO: draw an arrow SVG/asset from the avatar to each blurb */}
      <p className="text-xs font-bold uppercase tracking-widest opacity-60">
        {label}
      </p>
      <p className="mt-1 text-base leading-snug">{value}</p>
    </div>
  );
}

export default function AboutMe() {
  return (
    <SectionWrapper id="about">
      <div className="relative flex min-h-screen w-full items-center justify-center px-8 py-24">

        {/* ── Central avatar ── */}
        <div className="relative z-10 h-64 w-64 shrink-0">
          {/* Radial gradient: black at center fading to transparent at edges.
              Sits behind the avatar drawing so the illustration blends into the canvas. */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "radial-gradient(circle, #000 0%, transparent 72%)",
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
        <InfoBlurb
          label="ᯓ★"
          value="marwa"
          position="top-[30%] left-[18%]"
          rotation={-4}
        />
        <InfoBlurb
          label="based in"
          value="lausanne, CH"
          position="bottom-[32%] left-[16%]"
          rotation={-2}
        />
        <InfoBlurb
          label="comp sci student"
          value="& pretty things enjoyer"
          position="bottom-[30%] right-[16%]"
          rotation={2}
        />

      </div>
    </SectionWrapper>
  );
}
