"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import { useGlitchReveal } from "@/hooks/useGlitchReveal";
import { PROFILE } from "@/lib/profile";

// ─── Social / contact links ────────────────────────────────────────────────────
const SOCIAL_LINKS = [
  {
    label: PROFILE.email,
    href: `mailto:${PROFILE.email}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-4 h-4 shrink-0">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <polyline points="2,4 12,13 22,4" />
      </svg>
    ),
  },
  {
    label: `@${PROFILE.github.handle}`,
    href: PROFILE.github.url,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-4 h-4 shrink-0">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.461-1.11-1.461-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.647.35-1.087.636-1.337-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.547 1.377.203 2.394.1 2.647.64.698 1.028 1.591 1.028 2.682 0 3.842-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.742 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
      </svg>
    ),
  },
  {
    label: PROFILE.linkedin.handle,
    href: PROFILE.linkedin.url,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-4 h-4 shrink-0">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
] as const;

// ─── ASCII butterfly ───────────────────────────────────────────────────────────
// Two wings formed by words: YES, LOVE, THEE, PRECIOUS
const BUTTERFLY = `\
          \`          \`
 ,,,\`            \`           \`,,,
\`YES8888bo.       :     .od8888YES\`
 \`88SI08DO88b.   :   :   .d888SI8DO88\`
  8LOVEY' Y8b.  \`   \`  .d8Y  \`YLOVES
 jTHEE! .db. Yb.\`   \`.dY .db. 8THEE!
  \`888 Y88Y  \`b ( ) d\`  Y88Y 888\`
   8MYb \`\`  ,\`       \`,  \`\` dMY8
   j8prECIOUSgf'' ':' \`"?g8prECIOUSk
    \`Y' .8\`  d\`  \`b  .8. \`Y\`
      .8\` db d\`; ;b db \`8.
     d88  \`\` 8 ; 8  \`\` 88b
     d881b .g8 \`,\` 8g. dI86b
    :888LOVE8Y'    \`Y88LOVE888:
     '! THEE888'    \`888THEE !\`
       \`8Y \`Y      Y\` Y8\`
             Y          Y`;

function GlitchButterfly() {
  return (
    <div
      className="relative select-none"
      style={{ fontFamily: "monospace", fontSize: "clamp(7px, 1.1vw, 13px)", lineHeight: 1.45 }}
      aria-label="ASCII butterfly decoration"
    >
      {/* Base layer */}
      <pre
        className="animate-glitch-text"
        style={{
          color:      "#f0ebe0",
          opacity:    0.75,
          whiteSpace: "pre",
          background: "transparent",
          margin:     0,
          padding:    0,
        }}
      >
        {BUTTERFLY}
      </pre>

      {/* Pink glitch layer */}
      <pre
        aria-hidden="true"
        className="animate-glitch-text"
        style={{
          color:           "#f0b0c4",
          opacity:         0.45,
          whiteSpace:      "pre",
          background:      "transparent",
          margin:          0,
          padding:         0,
          position:        "absolute",
          inset:           0,
          animationDelay:  "-1.3s",
        }}
      >
        {BUTTERFLY}
      </pre>

      {/* Cyan glitch layer */}
      <pre
        aria-hidden="true"
        className="animate-glitch-text"
        style={{
          color:           "#a0d8d8",
          opacity:         0.2,
          whiteSpace:      "pre",
          background:      "transparent",
          margin:          0,
          padding:         0,
          position:        "absolute",
          inset:           0,
          animationDelay:  "-2.7s",
        }}
      >
        {BUTTERFLY}
      </pre>
    </div>
  );
}

export default function Contact() {
  const { sectionRef } = useGlitchReveal();

  return (
    <SectionWrapper id="contact" fullHeight={false}>
      {/* Ref anchor — walks up to <section> for IntersectionObserver */}
      <div
        ref={(el) => {
          if (el) sectionRef.current = el.closest("section") as HTMLElement | null;
        }}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />

      <div className="flex min-h-screen w-full items-center justify-center px-8 py-24">
        <div
          data-glitch-reveal=""
          data-glitch-delay="0"
          className="glitch-hidden flex items-center gap-10"
        >
          {/* Social links — left of butterfly */}
          <nav
            aria-label="Contact links"
            className="flex flex-col gap-5"
          >
            {SOCIAL_LINKS.map(({ label, href, icon }) => (
              <a
                key={href}
                href={href}
                aria-label={label}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                className="group flex items-center transition-opacity duration-200 opacity-60 hover:opacity-100"
                style={{ color: "#f0ebe0" }}
              >
                <span className="transition-colors duration-200 group-hover:text-[#f0b0c4]">
                  {icon}
                </span>
              </a>
            ))}
          </nav>

          {/* Butterfly */}
          <GlitchButterfly />
        </div>
      </div>
    </SectionWrapper>
  );
}
