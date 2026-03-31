"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";

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
  return (
    <SectionWrapper id="contact" fullHeight={false}>
      <div className="flex min-h-screen w-full items-center justify-center px-8 py-24">
        <GlitchButterfly />
      </div>
    </SectionWrapper>
  );
}
