"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { useGlitchReveal } from "@/hooks/useGlitchReveal";
import type { CTFWriteup } from "@/types/ctf";
import { CTF_WRITEUPS } from "@/lib/ctfData";

// ─── Card positions — scatter across viewport ─────────────────────────────────
const CTF_CARD_POSITIONS: [number, number][] = [
  [8,  8],
  [12, 58],
  [55, 22],
  [60, 65],
];

// ─── SVG connector lines between cards ────────────────────────────────────────
const CTF_CONNECTIONS: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
];

// ─── Floating glitch labels ───────────────────────────────────────────────────
interface GlitchLabel {
  text: string;
  top: number;
  left: number;
  delay: number;
}

const CTF_GLITCH_LABELS: GlitchLabel[] = [
  { text: "0x4654",  top: 5,  left: 35, delay: 0   },
  { text: "→ flag",  top: 35, left: 10, delay: 1.1  },
  { text: "// pwn",  top: 30, left: 75, delay: 0.5  },
  { text: "ERR//0x", top: 68, left: 46, delay: 1.9  },
  { text: "nc 4444", top: 82, left: 80, delay: 0.2  },
  { text: "rev→",    top: 78, left: 14, delay: 2.2  },
];

// ─── Glitchy preview text per card ───────────────────────────────────────────
const CTF_GLITCH_PREVIEWS = [
  ["▓▓ WEB_EXPLOIT", "GET /?id=1'--", "// sql"],
  ["▓ CRYPTO",       "decrypt(key)",  "// rsa"],
  ["▓▓ PWN",         "ret2libc()",    "// x86"],
  ["▓ NETWORK",      "pcap.read()",   "// tcp"],
];

// ─── Card size constants (for SVG connector centre calculation) ───────────────
const CARD_W_PCT = 15;
const CARD_H_PCT = 12;

function cardCentre(index: number): [number, number] {
  const [top, left] = CTF_CARD_POSITIONS[index];
  return [top + CARD_H_PCT / 2, left + CARD_W_PCT / 2];
}

// ─── Difficulty colour ────────────────────────────────────────────────────────
function difficultyColor(difficulty: CTFWriteup["difficulty"]): string {
  switch (difficulty) {
    case "easy":   return "#a0d8d8";
    case "medium": return "#f0b0c4";
    case "hard":   return "#ff6b6b";
  }
}

// ─── CornerBrackets (copied from ArtGallery) ─────────────────────────────────
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

// ─── CTFNode ──────────────────────────────────────────────────────────────────
interface CTFNodeProps {
  writeup: CTFWriteup;
  position: [number, number];
  index: number;
  isSelected: boolean;
  onSelect: (writeup: CTFWriteup) => void;
  glitchDelay?: number;
}

function CTFNode({ writeup, position, index, isSelected, onSelect, glitchDelay = 0 }: CTFNodeProps) {
  const [top, left] = position;
  const preview = CTF_GLITCH_PREVIEWS[index] ?? ["▓▓ ???", "// unknown"];
  const revealedRef = useRef(false);
  const buttonRef   = useRef<HTMLButtonElement | null>(null);
  const dotColor    = difficultyColor(writeup.difficulty);

  // Watch for glitch-hidden removal by the hook and record it
  useEffect(() => {
    const el = buttonRef.current;
    if (!el || revealedRef.current) return;

    const observer = new MutationObserver(() => {
      if (!el.classList.contains("glitch-hidden")) {
        revealedRef.current = true;
        observer.disconnect();
      }
    });

    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // After re-renders, restore visible state if already revealed
  useEffect(() => {
    if (revealedRef.current && buttonRef.current) {
      buttonRef.current.classList.remove("glitch-hidden");
    }
  });

  return (
    <button
      ref={buttonRef}
      data-repel
      data-glitch-reveal=""
      data-glitch-delay={String(glitchDelay)}
      onClick={() => onSelect(writeup)}
      aria-label={`Open CTF writeup: ${writeup.challengeName}`}
      style={{
        position: "absolute",
        top:  `clamp(2%, ${top}%, 80%)`,
        left: `clamp(2%, ${left}%, 75%)`,
        fontFamily: "monospace",
        animation: `node-pulse ${2.5 + index * 0.4}s ease-in-out infinite`,
        animationDelay: `${index * 0.3}s`,
      }}
      className={[
        "group w-[220px] cursor-pointer border px-4 py-3 text-left transition-all duration-200 glitch-hidden",
        "focus:outline-none focus-visible:ring-1 focus-visible:ring-current",
        isSelected
          ? "border-[#a0d8d8] bg-black/70 text-[#a0d8d8]"
          : "border-white/60 bg-[#0a0a0a]/90 text-white/90 hover:border-white hover:text-white",
      ].join(" ")}
    >
      {/* Node ID */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] opacity-40 tracking-widest uppercase">
          node_{String(index).padStart(2, "0")}
        </span>
        <span className="text-[10px] opacity-30">[{writeup.category}]</span>
      </div>

      {/* Challenge name with glitch */}
      <div
        className="text-sm font-bold tracking-wide"
        style={{ animation: `glitch-text ${3.5 + index * 0.7}s step-end infinite`, animationDelay: `${index * 0.9}s` }}
      >
        {writeup.challengeName.toUpperCase()}
      </div>

      {/* CTF name + glitchy preview lines */}
      <div className="mt-1 text-[11px] opacity-60 truncate">{writeup.ctfName}</div>
      <div className="mt-1.5 space-y-0.5 opacity-50">
        {preview.map((line, i) => (
          <div key={i} className="text-[11px] truncate">
            {line}
          </div>
        ))}
      </div>

      {/* Bottom indicator with difficulty dot */}
      <div className="mt-3 flex items-center gap-2">
        <div
          className="h-1.5 w-1.5 rounded-full transition-opacity group-hover:opacity-80"
          style={{
            background: dotColor,
            opacity: isSelected ? 1 : 0.4,
          }}
        />
        <span className="text-[10px] opacity-40 tracking-widest">
          {isSelected ? "SELECTED" : "CLICK TO EXPAND"}
        </span>
      </div>
    </button>
  );
}

// ─── ConnectorSVG ─────────────────────────────────────────────────────────────
function ConnectorSVG() {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <defs>
        <filter id="ctf-line-noise" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" result="noise" seed="7" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      {CTF_CONNECTIONS.map(([fromIdx, toIdx], i) => {
        const [fromTop, fromLeft] = cardCentre(fromIdx);
        const [toTop, toLeft]     = cardCentre(toIdx);
        const midLeft = (fromLeft + toLeft) / 2;
        const midTop  = (fromTop + toTop) / 2;

        return (
          <g key={i} filter="url(#ctf-line-noise)">
            <line
              x1={`${fromLeft}%`} y1={`${fromTop}%`}
              x2={`${toLeft}%`}   y2={`${toTop}%`}
              stroke="white"
              strokeWidth="0.5"
              strokeOpacity="0.25"
              style={{
                animation: `glitch-line ${5 + i * 1.1}s step-end infinite`,
                animationDelay: `${i * 0.7}s`,
              }}
            />
            <line
              x1={`${fromLeft + 0.15}%`} y1={`${fromTop + 0.1}%`}
              x2={`${midLeft}%`}          y2={`${midTop}%`}
              stroke="white"
              strokeWidth="0.3"
              strokeOpacity="0.12"
              style={{
                animation: `glitch-line ${4 + i * 0.8}s step-end infinite`,
                animationDelay: `${i * 0.4 + 0.3}s`,
              }}
            />
            <circle
              cx={`${midLeft}%`}
              cy={`${midTop}%`}
              r="1.5"
              fill="white"
              fillOpacity="0.15"
            />
          </g>
        );
      })}
    </svg>
  );
}

// ─── CTFDetailPanel — slides in from the right ────────────────────────────────
interface CTFDetailPanelProps {
  writeup: CTFWriteup | null;
  onClose: () => void;
}

function CTFDetailPanel({ writeup, onClose }: CTFDetailPanelProps) {
  const isOpen = writeup !== null;

  // Close on Escape
  useEffect(() => {
    if (!writeup) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [writeup, onClose]);

  const dotColor = writeup ? difficultyColor(writeup.difficulty) : "#a0d8d8";

  return (
    <>
      {/* Dim backdrop — click to close */}
      <div
        role="presentation"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 49,
          background: "rgba(0,0,0,0.5)",
          pointerEvents: isOpen ? "auto" : "none",
          opacity: isOpen ? 1 : 0,
          transition: "opacity 0.25s ease",
        }}
      />

      {/* Panel — slides in from right */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={writeup?.challengeName ?? "CTF writeup detail"}
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          height: "100vh",
          width: "min(90vw, 480px)",
          zIndex: 50,
          background: "rgba(8, 12, 12, 0.98)",
          border: "1px solid rgba(160, 216, 216, 0.2)",
          borderRight: "none",
          fontFamily: "monospace",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Corner brackets */}
        <CornerBrackets color="rgba(160,216,216,0.3)" size={14} />

        {writeup && (
          <>
            {/* Header */}
            <div
              style={{
                padding: "1.5rem",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "1rem",
              }}
            >
              <div>
                <div style={{ fontSize: "10px", letterSpacing: "0.2em", opacity: 0.4, marginBottom: "0.5rem" }}>
                  {"// CTF_DETAIL"}
                </div>
                <h2
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    letterSpacing: "0.05em",
                    fontFamily: "var(--font-acidic), monospace",
                    color: "#a0d8d8",
                    lineHeight: 1.2,
                    animation: "glitch-text 6s step-end infinite",
                  }}
                >
                  {writeup.challengeName.toUpperCase()}
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close CTF detail"
                style={{
                  background: "none",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  cursor: "pointer",
                  padding: "0.25rem 0.5rem",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  flexShrink: 0,
                  marginTop: "1.5rem",
                }}
              >
                [ESC]
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* Platform + category + difficulty row */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
                <span
                  style={{
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "rgba(255,255,255,0.7)",
                    padding: "0.2rem 0.6rem",
                    fontSize: "11px",
                    letterSpacing: "0.08em",
                  }}
                >
                  {writeup.platform}
                </span>
                <span
                  style={{
                    border: "1px solid rgba(160,216,216,0.4)",
                    color: "#a0d8d8",
                    padding: "0.2rem 0.6rem",
                    fontSize: "11px",
                    letterSpacing: "0.08em",
                  }}
                >
                  {writeup.category}
                </span>
                <span
                  style={{
                    border: `1px solid ${dotColor}55`,
                    color: dotColor,
                    padding: "0.2rem 0.6rem",
                    fontSize: "11px",
                    letterSpacing: "0.08em",
                  }}
                >
                  {writeup.difficulty}
                </span>
              </div>

              {/* Solve date */}
              <div>
                <div style={{ fontSize: "10px", letterSpacing: "0.2em", opacity: 0.4, marginBottom: "0.4rem" }}>
                  SOLVE_DATE
                </div>
                <div style={{ fontSize: "12px", opacity: 0.7, letterSpacing: "0.05em" }}>
                  {`// ${writeup.solveDate}`}
                </div>
              </div>

              {/* Techniques */}
              <div>
                <div style={{ fontSize: "10px", letterSpacing: "0.2em", opacity: 0.4, marginBottom: "0.5rem" }}>
                  TECHNIQUES
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  {writeup.techniques.map((t) => (
                    <div key={t} style={{ fontSize: "12px", opacity: 0.75, letterSpacing: "0.04em" }}>
                      {`→ ${t}`}
                    </div>
                  ))}
                </div>
              </div>

              {/* Writeup / summary */}
              <div>
                <div style={{ fontSize: "10px", letterSpacing: "0.2em", opacity: 0.4, marginBottom: "0.5rem" }}>
                  WRITEUP
                </div>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.7, opacity: 0.85, color: "white" }}>
                  {writeup.summary}
                </p>
              </div>

              {/* Flag block */}
              <div>
                <div style={{ fontSize: "10px", letterSpacing: "0.2em", opacity: 0.4, marginBottom: "0.4rem" }}>
                  FLAG
                </div>
                {writeup.flagRedacted ? (
                  <div style={{ fontSize: "12px", letterSpacing: "0.06em", color: "#f0b0c4", opacity: 0.8 }}>
                    flag&#123;REDACTED&#125;
                  </div>
                ) : writeup.flag ? (
                  <div style={{ fontSize: "12px", letterSpacing: "0.06em", color: "#a0d8d8" }}>
                    {writeup.flag}
                  </div>
                ) : (
                  <div style={{ fontSize: "12px", letterSpacing: "0.06em", opacity: 0.3 }}>
                    —
                  </div>
                )}
              </div>
            </div>

            {/* Footer CTA */}
            {writeup.writeupUrl && (
              <div
                style={{
                  padding: "1.25rem 1.5rem",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  marginTop: "auto",
                }}
              >
                <a
                  href={writeup.writeupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    textAlign: "center",
                    border: "1px solid rgba(160,216,216,0.5)",
                    color: "#a0d8d8",
                    padding: "0.75rem 1rem",
                    fontSize: "12px",
                    letterSpacing: "0.15em",
                    textDecoration: "none",
                    transition: "background 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(160,216,216,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  }}
                >
                  VIEW FULL WRITEUP →
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

// ─── CTFWriteups (main export) ────────────────────────────────────────────────
export default function CTFWriteups() {
  const [selectedWriteup, setSelectedWriteup] = useState<CTFWriteup | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const { sectionRef: glitchRef } = useGlitchReveal();

  // ── Particle dimming via IntersectionObserver ────────────────────────────
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          document.documentElement.dataset.dimParticles = "1";
        } else {
          delete document.documentElement.dataset.dimParticles;
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleSelect = useCallback((writeup: CTFWriteup) => {
    setSelectedWriteup((prev) => (prev?.id === writeup.id ? null : writeup));
  }, []);

  const handleClose = useCallback(() => {
    setSelectedWriteup(null);
  }, []);

  const year = new Date().getFullYear();

  return (
    <>
      <SectionWrapper id="ctf">
        {/* Section label — top-left */}
        <div
          data-glitch-reveal=""
          data-glitch-delay="0"
          style={{
            position: "absolute",
            top: "1.5rem",
            left: "1.5rem",
            fontFamily: "monospace",
            fontSize: "11px",
            letterSpacing: "0.2em",
            opacity: 0.3,
            zIndex: 2,
            pointerEvents: "none",
          }}
          className="glitch-hidden"
        >
          SYS::CTF_MAP / {CTF_WRITEUPS.length} nodes
        </div>

        {/* Section label — bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: "1.5rem",
            right: "1.5rem",
            fontFamily: "monospace",
            fontSize: "11px",
            letterSpacing: "0.15em",
            opacity: 0.25,
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          [CLICK NODE TO INSPECT]
        </div>

        {/* Section title — top-center */}
        <div
          data-glitch-reveal=""
          data-glitch-delay="0"
          className="pointer-events-none absolute top-8 left-1/2 z-20 -translate-x-1/2 text-center glitch-hidden"
        >
          <p
            className="mb-1 text-[9px] uppercase tracking-widest"
            style={{ fontFamily: "monospace", color: "#a0d8d8", opacity: 0.6 }}
          >
            {`WRITEUPS // ${year}`}
          </p>
          <div className="flex items-center gap-3">
            <div aria-hidden="true" style={{ width: 32, height: 1, background: "rgba(255,255,255,0.2)" }} />
            <p className="text-3xl leading-tight" style={{ fontFamily: "var(--font-acidic), sans-serif" }}>
              ctf
            </p>
            <div aria-hidden="true" style={{ width: 32, height: 1, background: "rgba(255,255,255,0.2)" }} />
          </div>
          <p
            className="mt-1 text-[9px] uppercase tracking-widest"
            style={{ fontFamily: "monospace", color: "#ffffff", opacity: 0.3 }}
          >
            capture the flag
          </p>
        </div>

        {/* Invisible ref anchor — walks up to <section> */}
        <div
          ref={(el) => {
            if (el) {
              const section = el.closest("section") as HTMLElement | null;
              sectionRef.current = section;
              glitchRef.current  = section;
            }
          }}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          aria-hidden="true"
        />

        {/* SVG connector layer */}
        <div
          data-glitch-reveal=""
          data-glitch-delay="150"
          className="glitch-hidden"
          style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
          aria-hidden="true"
        >
          <ConnectorSVG />
        </div>

        {/* Floating glitch labels */}
        {CTF_GLITCH_LABELS.map((label, i) => (
          <span
            key={i}
            aria-hidden="true"
            style={{
              position: "absolute",
              top: `${label.top}%`,
              left: `${label.left}%`,
              fontFamily: "monospace",
              fontSize: "10px",
              letterSpacing: "0.12em",
              color: "white",
              opacity: 0.45,
              pointerEvents: "none",
              zIndex: 1,
              animation: `float-label ${3.5 + i * 0.5}s ease-in-out infinite, glitch-text ${7 + i * 1.3}s step-end infinite`,
              animationDelay: `${label.delay}s, ${label.delay + 1}s`,
            }}
          >
            {label.text}
          </span>
        ))}

        {/* CTF node cards */}
        {CTF_WRITEUPS.map((writeup, index) => (
          <CTFNode
            key={writeup.id}
            writeup={writeup}
            position={CTF_CARD_POSITIONS[index] ?? [10 + index * 20, 10]}
            index={index}
            isSelected={selectedWriteup?.id === writeup.id}
            onSelect={handleSelect}
            glitchDelay={300 + index * 100}
          />
        ))}
      </SectionWrapper>

      {/* Detail panel — slides in from right */}
      <CTFDetailPanel writeup={selectedWriteup} onClose={handleClose} />
    </>
  );
}
