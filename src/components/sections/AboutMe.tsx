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
      <div className="relative flex h-full min-h-screen w-full items-center justify-center px-8 py-24">

        {/* ── Central avatar ── */}
        <div className="relative z-10 h-64 w-64 shrink-0">
          {/*
            TODO: replace with your hand-drawn avatar image.
            File should go in /public/images/avatar.png
          */}
          <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-dashed border-current opacity-30">
            <span className="text-sm opacity-60">avatar.png</span>
          </div>
          {/* Uncomment once you have the asset:
          <Image
            src="/images/avatar.png"
            alt="Hand-drawn avatar of Marwa"
            fill
            className="object-contain"
          />
          */}
        </div>

        {/* ── Info blurbs radiating around the avatar ──
              Positions are set for a ~1200px-wide viewport.
              Adjust the Tailwind position classes to match your design
              once the avatar asset is in place.
        */}
        {/* TODO: replace each value="..." with your real info */}
        <InfoBlurb
          label="Name"
          value="Marwa"
          position="top-1/4 left-[8%]"
          rotation={-4}
        />
        <InfoBlurb
          label="Role"
          value="Developer & Creative"
          position="top-[15%] right-[10%]"
          rotation={3}
        />
        <InfoBlurb
          label="Based in"
          value="——"
          position="bottom-1/3 left-[6%]"
          rotation={-2}
        />
        <InfoBlurb
          label="Skills"
          value="React · Next.js · Illustration"
          position="bottom-1/4 right-[8%]"
          rotation={2}
        />
        <InfoBlurb
          label="fun fact"
          value="——"
          position="bottom-[12%] left-1/2 -translate-x-1/2"
          rotation={-1}
        />

      </div>
    </SectionWrapper>
  );
}
