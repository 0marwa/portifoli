"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import OSWindow from "@/components/ui/OSWindow";
import { useGlitchReveal } from "@/hooks/useGlitchReveal";
import type { CTFWriteup } from "@/types/ctf";
import { CTF_WRITEUPS } from "@/lib/ctfData";

// ─── Node positions [top%, left%] — left half of viewport ─────────────────────
const NODE_POSITIONS: [number, number][] = [
  [18, 8],
  [22, 48],
  [58, 14],
  [62, 52],
];

// ─── Connector pairs ───────────────────────────────────────────────────────────
const CONNECTIONS: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
];

// Node card dimensions for centre calculation
const NODE_W = 10; // % of viewport
const NODE_H =  8; // % of viewport

function nodeCentre(i: number): [number, number] {
  const [top, left] = NODE_POSITIONS[i];
  return [top + NODE_H / 2, left + NODE_W / 2];
}

// ─── Difficulty colour ─────────────────────────────────────────────────────────
const ACCENT = "#f0b0c4"; // match Projects pink

function difficultyColor(d: CTFWriteup["difficulty"]): string {
  switch (d) {
    case "easy":   return "#a0d8d8";
    case "medium": return ACCENT;
    case "hard":   return "#ff8080";
  }
}

// ─── CTFNode — minimal, clean ──────────────────────────────────────────────────
interface CTFNodeProps {
  writeup:    CTFWriteup;
  position:   [number, number];
  index:      number;
  isSelected: boolean;
  onSelect:   (w: CTFWriteup) => void;
}

function CTFNode({ writeup, position, index, isSelected, onSelect }: CTFNodeProps) {
  const [top, left] = position;
  const dot = difficultyColor(writeup.difficulty);

  return (
    <button
      data-repel
      onClick={() => onSelect(writeup)}
      aria-label={`Open CTF writeup: ${writeup.challengeName}`}
      style={{
        position:   "absolute",
        top:        `${top}%`,
        left:       `${left}%`,
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        width:      "clamp(160px, 18vw, 240px)",
        textAlign:  "left",
        cursor:     "pointer",
        background: "none",
        padding:    0,
        border:     "none",
      }}
    >
      {/* Dot + name row */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            width:        7,
            height:       7,
            borderRadius: "50%",
            background:   dot,
            flexShrink:   0,
            opacity:      isSelected ? 1 : 0.7,
            transition:   "opacity 0.2s, box-shadow 0.2s",
            boxShadow:    isSelected ? `0 0 6px 1px ${dot}` : "none",
          }}
        />
        <span
          style={{
            fontSize:      "13px",
            fontWeight:    isSelected ? 600 : 400,
            letterSpacing: "0.04em",
            color:         isSelected ? "#ffffff" : "rgba(240,235,224,0.85)",
            transition:    "color 0.2s",
            whiteSpace:    "nowrap",
            overflow:      "hidden",
            textOverflow:  "ellipsis",
          }}
        >
          {writeup.challengeName}
        </span>
      </div>

      {/* Category + platform — single dim line */}
      <div
        style={{
          marginTop:     "3px",
          paddingLeft:   "15px",
          fontSize:      "11px",
          color:         "rgba(240,235,224,0.45)",
          letterSpacing: "0.06em",
          whiteSpace:    "nowrap",
        }}
      >
        {writeup.category} · {writeup.platform}
      </div>
    </button>
  );
}

// ─── ConnectorSVG — clean single lines, no noise filter ───────────────────────
function ConnectorSVG() {
  return (
    <svg
      aria-hidden="true"
      style={{
        position:      "absolute",
        inset:         0,
        width:         "100%",
        height:        "100%",
        pointerEvents: "none",
        zIndex:        0,
      }}
    >
      {CONNECTIONS.map(([a, b], i) => {
        const [y1, x1] = nodeCentre(a);
        const [y2, x2] = nodeCentre(b);
        return (
          <line
            key={i}
            x1={`${x1}%`} y1={`${y1}%`}
            x2={`${x2}%`} y2={`${y2}%`}
            stroke="rgba(240,235,224,0.15)"
            strokeWidth="0.8"
            strokeDasharray="3 5"
          />
        );
      })}
    </svg>
  );
}

// ─── CTFWindow — draggable / resizable OS-style window ───────────────────────
function CTFWindow({ writeup, onClose }: { writeup: CTFWriteup; onClose: () => void }) {
  const dot = difficultyColor(writeup.difficulty);

  return (
    <OSWindow title={`ctf://${writeup.ctfName}/${writeup.challengeName}`} accent={ACCENT} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>
        {/* Header */}
        <div style={{ padding: "1.5rem 1.75rem 1.25rem", borderBottom: "1px solid rgba(240,235,224,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.6rem" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot, display: "inline-block", boxShadow: `0 0 5px ${dot}` }} />
            <span style={{ fontSize: "11px", letterSpacing: "0.15em", color: "rgba(240,235,224,0.4)", textTransform: "uppercase" }}>
              {writeup.category} · {writeup.difficulty}
            </span>
          </div>
          <h2
            style={{
              fontFamily:    "var(--font-acidic), sans-serif",
              fontSize:      "1.6rem",
              fontWeight:    400,
              color:         "#f0ebe0",
              lineHeight:    1.1,
              margin:        0,
              letterSpacing: "0.01em",
            }}
          >
            {writeup.challengeName}
          </h2>
          <div style={{ marginTop: "0.4rem", fontSize: "12px", color: "rgba(240,235,224,0.45)", letterSpacing: "0.04em" }}>
            {writeup.ctfName} · {writeup.platform}
          </div>
        </div>

      {/* Body */}
      <div style={{ padding: "1.5rem 1.75rem", display: "flex", flexDirection: "column", gap: "1.5rem", flex: 1 }}>

        {/* Solve date */}
        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(240,235,224,0.35)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
            solved
          </div>
          <div style={{ fontSize: "13px", color: "rgba(240,235,224,0.7)" }}>
            {writeup.solveDate}
          </div>
        </div>

        {/* Techniques */}
        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(240,235,224,0.35)", marginBottom: "0.5rem", textTransform: "uppercase" }}>
            techniques
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            {writeup.techniques.map((t) => (
              <div key={t} style={{ fontSize: "13px", color: "rgba(240,235,224,0.8)" }}>
                → {t}
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(240,235,224,0.35)", marginBottom: "0.5rem", textTransform: "uppercase" }}>
            writeup
          </div>
          <p style={{ fontSize: "13px", lineHeight: 1.75, color: "rgba(240,235,224,0.85)", margin: 0 }}>
            {writeup.summary}
          </p>
        </div>

        {/* Flag */}
        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(240,235,224,0.35)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
            flag
          </div>
          {writeup.flagRedacted ? (
            <div style={{ fontSize: "12px", color: ACCENT, letterSpacing: "0.06em" }}>
              flag&#123;REDACTED&#125;
            </div>
          ) : writeup.flag ? (
            <div style={{ fontSize: "12px", color: "#a0d8d8", letterSpacing: "0.06em" }}>
              {writeup.flag}
            </div>
          ) : (
            <div style={{ fontSize: "12px", color: "rgba(240,235,224,0.25)" }}>—</div>
          )}
        </div>
      </div>

      {/* CTA */}
      {writeup.writeupUrl && (
        <div style={{ padding: "1.25rem 1.75rem", borderTop: "1px solid rgba(240,235,224,0.08)", marginTop: "auto" }}>
          <a
            href={writeup.writeupUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display:       "block",
              textAlign:     "center",
              border:        `1px solid ${ACCENT}55`,
              color:         ACCENT,
              padding:       "0.7rem 1rem",
              fontSize:      "12px",
              letterSpacing: "0.12em",
              textDecoration: "none",
              transition:    "background 0.15s",
              fontFamily:    "inherit",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = `${ACCENT}14`; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
          >
            VIEW FULL WRITEUP →
          </a>
        </div>
      )}
      </div>
    </OSWindow>
  );
}

// ─── CTFWriteups (main export) ─────────────────────────────────────────────────
export default function CTFWriteups() {
  const [selected, setSelected] = useState<CTFWriteup | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const { sectionRef: glitchRef } = useGlitchReveal();

  // Particle dimming
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) document.documentElement.dataset.dimParticles = "1";
        else delete document.documentElement.dataset.dimParticles;
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleSelect = useCallback((w: CTFWriteup) => {
    setSelected((prev) => (prev?.id === w.id ? null : w));
  }, []);

  const handleClose = useCallback(() => setSelected(null), []);

  return (
    <>
      <SectionWrapper id="ctf">
        {/* Ref anchor */}
        <div
          ref={(el) => {
            if (el) {
              const section = el.closest("section") as HTMLElement | null;
              sectionRef.current = section;
              glitchRef.current  = section;
            }
          }}
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        />

        {/* ── Title block — top-right ──────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            top:      "2rem",
            right:    "2.5rem",
            textAlign: "right",
            zIndex:   2,
            pointerEvents: "none",
          }}
        >
          <h2
            style={{
              fontFamily:    "var(--font-acidic), sans-serif",
              fontSize:      "clamp(2.8rem, 6vw, 5rem)",
              fontWeight:    400,
              letterSpacing: "-.01em",
              lineHeight:    1,
              color:         "#f0ebe0",
              margin:        0,
            }}
          >
            ctf
          </h2>
          <p
            style={{
              fontFamily:    "'JetBrains Mono', ui-monospace, monospace",
              fontSize:      "12px",
              color:         "rgba(240,235,224,0.5)",
              letterSpacing: "0.06em",
              margin:        "8px 0 0",
            }}
          >
            {CTF_WRITEUPS.length} writeups · click a node
          </p>
        </div>

        {/* SVG connectors */}
        <div
          style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
          aria-hidden="true"
        >
          <ConnectorSVG />
        </div>

        {/* Nodes */}
        {CTF_WRITEUPS.map((w, i) => (
          <CTFNode
            key={w.id}
            writeup={w}
            position={NODE_POSITIONS[i] ?? [20 + i * 20, 10]}
            index={i}
            isSelected={selected?.id === w.id}
            onSelect={handleSelect}
          />
        ))}
      </SectionWrapper>

      {/* Detail window — draggable / resizable; keyed so each writeup opens fresh */}
      {selected && <CTFWindow key={selected.id} writeup={selected} onClose={handleClose} />}
    </>
  );
}
