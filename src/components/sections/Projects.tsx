"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import type { Project, ProjectCategory } from "@/types";
import { useTextScramble } from "@/hooks/useTextScramble";

// ─── Project data ──────────────────────────────────────────────────────────────
const PROJECTS: Project[] = [
  {
    id: "cittitrip",
    title: "CittiTrip",
    description:
      "AI-powered travel planner built solo, end-to-end. Next.js + React Native frontend, TypeScript business logic, external API integrations. Designed and shipped the full stack autonomously.",
    tags: ["Next.js", "React Native", "TypeScript"],
    image: "/images/projects/cittitrip.png",
    category: "personal",
  },
  {
    id: "elysium",
    title: "Elysium Quran Chatbot",
    description:
      "Production website for a Moroccan company, including a functional chatbot via API integration. Responsible for front-end architecture, API wiring, and live deployment in a real client context.",
    tags: ["Next.js", "TypeScript", "APIs"],
    image: "/images/projects/elysium.png",
    category: "personal",
  },
  {
    id: "feedme",
    title: "FeedMe",
    description:
      "Android app built in a 14-week SCRUM team project at EPFL (CS311). Covered ideation → Figma prototyping → Kotlin development → user testing → final demo. 2nd place at Battle of the Apps 2023.",
    tags: ["Kotlin", "Figma", "SCRUM"],
    image: "/images/projects/feedme.png",
    link: "https://github.com/",
    category: "academic",
  },
  {
    id: "scala-webapp",
    title: "Web App",
    description:
      "Academic web application built for EPFL's Software Construction course. Focused on software architecture, clean separation of concerns, and UI implementation in Scala.",
    tags: ["Scala", "Web", "EPFL"],
    image: "/images/projects/scala-webapp.png",
    category: "academic",
  },
];

// ─── Filter options ────────────────────────────────────────────────────────────
const FILTER_OPTIONS: { label: string; value: ProjectCategory | "all" }[] = [
  { label: "ALL",          value: "all"          },
  { label: "PERSONAL",     value: "personal"     },
  { label: "ACADEMIC",     value: "academic"     },
  { label: "VOLUNTEERING", value: "volunteering" },
];

// ─── Card positions — hardcoded scatter: indices 0-3 real, 4-7 empty slots ────
// Each tuple is [top%, left%].
const CARD_POSITIONS: [number, number][] = [
  [8,  6],   // 0 cittitrip
  [10, 54],  // 1 elysium
  [54, 18],  // 2 feedme
  [58, 62],  // 3 scala-webapp
  [30, 78],  // 4 empty
  [80, 55],  // 5 empty
  [75, 8],   // 6 empty
  [35, 2],   // 7 empty
];

// ─── Card width/height constants (used for centre calculation) ─────────────────
const CARD_W_PCT = 15;
const CARD_H_PCT = 12;

// ─── Center node position: geometric center of all 4 real card positions ──────
const CENTER_NODE_POS: [number, number] = (() => {
  const realCards = CARD_POSITIONS.slice(0, 4);
  const avgTop  = realCards.reduce((s, [t]) => s + t, 0) / realCards.length + CARD_H_PCT / 2;
  const avgLeft = realCards.reduce((s, [, l]) => s + l, 0) / realCards.length + CARD_W_PCT / 2;
  return [avgTop, avgLeft];
})();

const CENTER_IDX = 8; // virtual index for connections

// ─── SVG connector lines — full mesh topology ─────────────────────────────────
// Indices 0-5: real node mesh (all 4 project nodes fully connected)
// Indices 6-9: center hub to all 4 real nodes
// Indices 10-13: empty slot peripherals, each connected to one real node
const CONNECTIONS: [number, number][] = [
  // Full mesh between 4 real project nodes — creates crossing lines
  [0, 1],        // 0
  [0, 2],        // 1
  [0, 3],        // 2
  [1, 2],        // 3
  [1, 3],        // 4
  [2, 3],        // 5
  // Center node connects to all 4 real nodes (hub role)
  [CENTER_IDX, 0], // 6
  [CENTER_IDX, 1], // 7
  [CENTER_IDX, 2], // 8
  [CENTER_IDX, 3], // 9
  // Empty slots each connect to one real node (peripheral nodes)
  [0, 7],        // 10
  [1, 4],        // 11
  [2, 6],        // 12
  [3, 5],        // 13
];

// ─── Glitch labels — positioned near midpoints of the 6 real mesh connections ─
interface GlitchLabel {
  text: string;
  top: number;  // %
  left: number; // %
  delay: number; // animation-delay in seconds
}

function cardCentre(index: number): [number, number] {
  if (index === CENTER_IDX) return CENTER_NODE_POS;
  const [top, left] = CARD_POSITIONS[index];
  return [top + CARD_H_PCT / 2, left + CARD_W_PCT / 2];
}

// Precompute mesh midpoints for label placement:
// node0 centre ≈ [14, 13.5], node1 ≈ [16, 61.5], node2 ≈ [60, 25.5], node3 ≈ [64, 69.5]
// conn[0,1] mid ≈ [15, 37.5]  conn[0,2] mid ≈ [37, 19.5]  conn[0,3] mid ≈ [39, 41.5]
// conn[1,2] mid ≈ [38, 43.5]  conn[1,3] mid ≈ [40, 65.5]  conn[2,3] mid ≈ [62, 47.5]
const GLITCH_LABELS: GlitchLabel[] = [
  // conn [0,1] — two labels
  { text: "ref_0x4f",  top: 14,  left: 35,  delay: 0   },
  { text: "→ null",    top: 16,  left: 40,  delay: 1.2 },
  // conn [0,2]
  { text: "0b1101",    top: 35,  left: 18,  delay: 0.6 },
  // conn [0,3] — two labels
  { text: "NULL_PTR",  top: 37,  left: 39,  delay: 1.8 },
  { text: "0x0000",    top: 41,  left: 43,  delay: 2.7 },
  // conn [1,2]
  { text: "ERR//03",   top: 36,  left: 46,  delay: 0.3 },
  // conn [1,3]
  { text: "undef→",    top: 38,  left: 66,  delay: 2.1 },
  // conn [2,3] — two labels
  { text: "//EMPTY",   top: 60,  left: 45,  delay: 0.8 },
  { text: "⌀ link",   top: 64,  left: 50,  delay: 1.5 },
];

// ─── Glitchy preview text shown inside each collapsed real card ───────────────
const GLITCH_PREVIEWS = [
  ["▓▓ AI_TRAVEL", "plan() → trip", "// next.js"],
  ["▓ CHATBOT",    "POST /api/chat", "// deployed"],
  ["▓▓ ANDROID",   "scrum.sprint()", "// kotlin"],
  ["▓ WEB_APP",    "build(scala)",   "// EPFL"],
];

// ─── EmptyNode — minimal dot/crosshair, no border box ────────────────────────
interface EmptyNodeProps {
  index: number; // 4–7
}

function EmptyNode({ index }: EmptyNodeProps) {
  const [top, left] = CARD_POSITIONS[index];
  const slotLabel = `slot_${String(index).padStart(2, "0")}`;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: `${top + CARD_H_PCT / 2}%`,
        left: `${left + CARD_W_PCT / 2}%`,
        transform: "translate(-50%, -50%)",
        fontFamily: "monospace",
        pointerEvents: "none",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {/* Crosshair dot */}
      <div
        style={{
          position: "relative",
          width: "10px",
          height: "10px",
          opacity: 0.35,
        }}
      >
        {/* Horizontal arm */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: "1px",
          background: "white",
          transform: "translateY(-50%)",
        }} />
        {/* Vertical arm */}
        <div style={{
          position: "absolute",
          left: "50%",
          top: 0,
          bottom: 0,
          width: "1px",
          background: "white",
          transform: "translateX(-50%)",
        }} />
        {/* Centre dot */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "3px",
          height: "3px",
          background: "rgba(255,255,255,0.7)",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
        }} />
      </div>
      {/* Slot label */}
      <div style={{
        fontSize: "8px",
        letterSpacing: "0.15em",
        opacity: 0.25,
        whiteSpace: "nowrap",
      }}>
        {slotLabel}
      </div>
    </div>
  );
}

// ─── CenterTitleNode ───────────────────────────────────────────────────────────
interface CenterTitleNodeProps {
  scrambleTrigger: boolean;
}

function CenterTitleNode({ scrambleTrigger }: CenterTitleNodeProps) {
  const [top, left] = CENTER_NODE_POS;
  const { displayText } = useTextScramble("projects", scrambleTrigger, { duration: 800 });

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: `${top}%`,
        left: `${left}%`,
        transform: "translate(-50%, -50%)",
        width: "110px",
        fontFamily: "monospace",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        background: "rgba(0, 0, 0, 0.75)",
        padding: "0.35rem 0.6rem",
        pointerEvents: "none",
        zIndex: 2,
        animation: "node-drift 8s ease-in-out infinite",
      }}
    >
      {/* Node label */}
      <div style={{ fontSize: "8px", letterSpacing: "0.18em", opacity: 0.35, marginBottom: "0.25rem" }}>
        node_root
      </div>
      {/* Scrambled title in Acidic font */}
      <div
        data-glitchable
        style={{
          fontFamily: "var(--font-acidic), monospace",
          fontSize: "clamp(0.75rem, 1.4vw, 1rem)",
          color: "white",
          letterSpacing: "0.08em",
          whiteSpace: "nowrap",
          textShadow: "0 0 8px rgba(255,255,255,0.3)",
        }}
      >
        {displayText}
      </div>
    </div>
  );
}

// ─── ProjectNode ──────────────────────────────────────────────────────────────
interface ProjectNodeProps {
  project: Project;
  position: [number, number];
  index: number;
  isSelected: boolean;
  isFiltered: boolean;
  onSelect: (project: Project) => void;
  scrambleTrigger: boolean;
}

function ProjectNode({
  project,
  position,
  index,
  isSelected,
  isFiltered,
  onSelect,
  scrambleTrigger,
}: ProjectNodeProps) {
  const [top, left] = position;
  const preview = GLITCH_PREVIEWS[index] ?? ["▓▓ ???", "// unknown"];

  const { displayText: scrambledTitle } = useTextScramble(
    project.title.toUpperCase(),
    scrambleTrigger,
    { duration: 900 + index * 120 }
  );

  return (
    <button
      data-repel
      onClick={() => onSelect(project)}
      aria-label={`Open project: ${project.title}`}
      style={{
        position: "absolute",
        top: `${top}%`,
        left: `${left}%`,
        fontFamily: "monospace",
        animation: isFiltered
          ? undefined
          : `node-pulse ${2.5 + index * 0.4}s ease-in-out infinite`,
        animationDelay: isFiltered ? undefined : `${index * 0.3}s`,
        opacity: isFiltered ? 0.2 : 1,
        pointerEvents: isFiltered ? "none" : "auto",
        transition: "opacity 0.3s ease",
        zIndex: 2,
      }}
      className={[
        "group w-[220px] cursor-pointer border px-4 py-3 text-left duration-200",
        "focus:outline-none focus-visible:ring-1 focus-visible:ring-current",
        isSelected
          ? "border-white bg-black/70 text-white"
          : "border-white bg-[#0a0a0a]/90 text-white hover:border-white hover:text-white",
      ].join(" ")}
    >
      {/* Node ID */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] opacity-40 tracking-widest uppercase">
          node_{String(index).padStart(2, "0")}
        </span>
        <span className="text-[10px] opacity-30">[{project.tags[0]}]</span>
      </div>

      {/* Title with scramble-on-enter effect */}
      <div
        data-glitchable
        className="text-sm font-bold tracking-wide"
        style={{
          animation: `glitch-text ${3.5 + index * 0.7}s step-end infinite`,
          animationDelay: `${index * 0.9}s`,
        }}
      >
        {scrambledTitle}
      </div>

      {/* Glitchy preview lines */}
      <div className="mt-2 space-y-0.5 opacity-50">
        {preview.map((line, i) => (
          <div key={i} className="text-[11px] truncate">
            {line}
          </div>
        ))}
      </div>

      {/* Bottom indicator */}
      <div className="mt-3 flex items-center gap-2">
        <div
          className={[
            "h-1.5 w-1.5 rounded-full",
            isSelected ? "bg-white" : "bg-current opacity-40 group-hover:opacity-80",
          ].join(" ")}
        />
        <span className="text-[10px] opacity-40 tracking-widest">
          {isSelected ? "SELECTED" : "CLICK TO EXPAND"}
        </span>
      </div>
    </button>
  );
}

// ─── ConnectorSVG ─────────────────────────────────────────────────────────────
interface ConnectorSVGProps {
  lineOverrides: Map<number, [number, number]>;
}

function ConnectorSVG({ lineOverrides }: ConnectorSVGProps) {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      <defs>
        {/* Scanline/noise filter with SMIL animation for dramatic line flicker spikes */}
        <filter id="line-noise" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" result="noise" seed="2">
            <animate
              attributeName="baseFrequency"
              values="0.9;0.9;0.9;1.6;0.9;0.9;2.2;0.9"
              dur="13s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G">
            <animate
              attributeName="scale"
              values="1.5;1.5;1.5;5;1.5;1.5;8;1.5"
              dur="13s"
              repeatCount="indefinite"
            />
          </feDisplacementMap>
        </filter>

        {/* Arrowhead marker — for primary mesh and center connections */}
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="white" fillOpacity="0.7" />
        </marker>

        {/* Faint arrowhead — for ghost duplicate lines */}
        <marker id="arrow-faint" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="white" fillOpacity="0.2" />
        </marker>
      </defs>

      {CONNECTIONS.map(([realFromIdx, realToIdx], i) => {
        // Apply rewire override if present
        const override = lineOverrides.get(i);
        const fromIdx = override ? override[0] : realFromIdx;
        const toIdx   = override ? override[1] : realToIdx;

        const [fromTop, fromLeft] = cardCentre(fromIdx);
        const [toTop, toLeft]     = cardCentre(toIdx);

        const midLeft = (fromLeft + toLeft) / 2;
        const midTop  = (fromTop + toTop) / 2;

        // Connection type drives styling:
        // 0-5: real mesh     → strokeWidth 1, opacity 0.55, arrowhead
        // 6-9: center hub    → strokeWidth 0.8, opacity 0.35, arrowhead
        // 10-13: empty slots → strokeWidth 0.6, opacity 0.2, no arrowhead
        const isMesh        = i <= 5;
        const isCenterHub   = i >= 6 && i <= 9;
        const isEmptySpoke  = i >= 10;

        const strokeWidth   = isMesh ? 1 : isCenterHub ? 0.8 : 0.6;
        const primaryOpacity = isMesh ? 0.55 : isCenterHub ? 0.35 : 0.2;
        const ghostOpacity   = primaryOpacity * 0.5;
        const markerEnd      = isEmptySpoke ? undefined : "url(#arrow)";
        const ghostMarkerEnd = isEmptySpoke ? undefined : "url(#arrow-faint)";

        return (
          <g key={i} filter="url(#line-noise)">
            {/* Primary line */}
            <line
              x1={`${fromLeft}%`} y1={`${fromTop}%`}
              x2={`${toLeft}%`}   y2={`${toTop}%`}
              stroke="white"
              strokeWidth={strokeWidth}
              strokeOpacity={primaryOpacity}
              markerEnd={markerEnd}
              style={{
                animation: `glitch-line ${5 + i * 1.1}s step-end infinite`,
                animationDelay: `${i * 0.7}s`,
              }}
            />
            {/* Ghost offset line — corrupted-duplicate feel */}
            <line
              x1={`${fromLeft + 0.15}%`} y1={`${fromTop + 0.1}%`}
              x2={`${midLeft}%`}          y2={`${midTop}%`}
              stroke="white"
              strokeWidth={strokeWidth * 0.4}
              strokeOpacity={ghostOpacity}
              markerEnd={ghostMarkerEnd}
              style={{
                animation: `glitch-line ${4 + i * 0.8}s step-end infinite`,
                animationDelay: `${i * 0.4 + 0.3}s`,
              }}
            />
            {/* Midpoint dot */}
            <circle
              cx={`${midLeft}%`}
              cy={`${midTop}%`}
              r="1.5"
              fill="white"
              fillOpacity={primaryOpacity * 0.6}
            />
          </g>
        );
      })}
    </svg>
  );
}

// ─── Detail modal — centered overlay ──────────────────────────────────────────
interface DetailPanelProps {
  project: Project | null;
  onClose: () => void;
}

function DetailPanel({ project, onClose }: DetailPanelProps) {
  // Bitmap reveal: start degraded, clear after short delay each time a new project opens
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (!project) return;
    setRevealed(false);
    const t = setTimeout(() => setRevealed(true), 2500);
    return () => clearTimeout(t);
  }, [project?.id]);

  // Close on Escape
  useEffect(() => {
    if (!project) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [project, onClose]);

  const isOpen = project !== null;

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(2px)",
        pointerEvents: isOpen ? "auto" : "none",
        opacity: isOpen ? 1 : 0,
        transition: "opacity 0.25s ease",
      }}
    >
      {/* Modal card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={project?.title ?? "Project detail"}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: isOpen
            ? "translate(-50%, -50%) scale(1)"
            : "translate(-50%, -50%) scale(0.95)",
          transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease",
          opacity: isOpen ? 1 : 0,
          width: "90vw",
          maxWidth: "560px",
          maxHeight: "80vh",
          overflowY: "auto",
          background: "rgba(8, 12, 12, 0.98)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          fontFamily: "monospace",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {project && (
          <>
            {/* Header */}
            <div
              style={{
                padding: "1.5rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "1rem",
              }}
            >
              <div>
                <div style={{ fontSize: "10px", letterSpacing: "0.2em", opacity: 0.4, marginBottom: "0.5rem" }}>
                  // PROJECT_DETAIL
                </div>
                <h2
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    letterSpacing: "0.05em",
                    fontFamily: "var(--font-acidic), monospace",
                    color: "white",
                    lineHeight: 1.2,
                    animation: "glitch-text 6s step-end infinite",
                  }}
                >
                  {project.title.toUpperCase()}
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close project detail"
                style={{
                  background: "none",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
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
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Description */}
              <div>
                <div style={{ fontSize: "10px", letterSpacing: "0.2em", opacity: 0.4, marginBottom: "0.5rem" }}>
                  README.md
                </div>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.7, opacity: 0.85, color: "white" }}>
                  {project.description}
                </p>
              </div>

              {/* Tags */}
              <div>
                <div style={{ fontSize: "10px", letterSpacing: "0.2em", opacity: 0.4, marginBottom: "0.75rem" }}>
                  dependencies[]
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        border: "1px solid rgba(255, 255, 255, 0.4)",
                        color: "white",
                        padding: "0.2rem 0.6rem",
                        fontSize: "11px",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Preview image — bitmap reveal */}
              <div>
                <div style={{ fontSize: "10px", letterSpacing: "0.2em", opacity: 0.4, marginBottom: "0.75rem" }}>
                  preview.png
                </div>
                <div
                  style={{
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    height: "180px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.image}
                    alt={`${project.title} preview`}
                    onError={(e) => {
                      const el = e.currentTarget as HTMLImageElement;
                      el.style.display = "none";
                      (el.parentElement as HTMLElement).style.display = "flex";
                      (el.parentElement as HTMLElement).style.alignItems = "center";
                      (el.parentElement as HTMLElement).style.justifyContent = "center";
                      (el.parentElement as HTMLElement).setAttribute("data-empty", "1");
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      position: "relative",
                      zIndex: 1,
                      imageRendering: revealed ? "auto" : "pixelated",
                      filter: revealed
                        ? "grayscale(0) brightness(0.9) contrast(1)"
                        : "grayscale(1) contrast(1.8) brightness(0.45) blur(0.5px)",
                      transition: "filter 1.6s ease",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      opacity: 0.3,
                      letterSpacing: "0.1em",
                      pointerEvents: "none",
                    }}
                    aria-hidden="true"
                  >
                    [IMG_NOT_FOUND]
                  </span>
                </div>
              </div>
            </div>

            {/* Footer CTA */}
            {project.link && (
              <div
                style={{
                  padding: "1.25rem 1.5rem",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    textAlign: "center",
                    border: "1px solid rgba(255, 255, 255, 0.5)",
                    color: "white",
                    padding: "0.75rem 1rem",
                    fontSize: "12px",
                    letterSpacing: "0.15em",
                    textDecoration: "none",
                    transition: "background 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255, 255, 255, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  }}
                >
                  OPEN_PROJECT →
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Projects (main export) ───────────────────────────────────────────────────
export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeFilter, setActiveFilter] = useState<ProjectCategory | "all">("all");
  const [lineOverrides, setLineOverrides] = useState<Map<number, [number, number]>>(new Map());

  // ── Scramble trigger: fire once on #projects entering viewport at 30% ──────
  const [scrambleTrigger, setScrambleTrigger] = useState(false);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const section = document.getElementById("projects");
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            setScrambleTrigger(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.30 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const handleSelect = useCallback((project: Project) => {
    setSelectedProject((prev) => (prev?.id === project.id ? null : project));
  }, []);

  const handleClose = useCallback(() => {
    setSelectedProject(null);
  }, []);

  // ── Line rewire effect: randomly redirect 1-2 connections from mesh+hub ────
  useEffect(() => {
    const totalNodes = CARD_POSITIONS.length + 1; // 0-7 + CENTER_IDX(8)
    // Only rewire from real mesh + center connections (indices 0-9)
    const rewirableCount = 10;

    function scheduleRewire() {
      const delay = 3000 + Math.random() * 4000; // 3–7 seconds
      return setTimeout(() => {
        const count = Math.random() < 0.4 ? 2 : 1;
        const overrides = new Map<number, [number, number]>();

        for (let n = 0; n < count; n++) {
          const connIdx = Math.floor(Math.random() * rewirableCount);
          const [realFrom, realTo] = CONNECTIONS[connIdx];
          let newTo: number;
          do {
            newTo = Math.floor(Math.random() * totalNodes);
            if (newTo === CARD_POSITIONS.length) newTo = CENTER_IDX;
          } while (newTo === realFrom || newTo === realTo);
          overrides.set(connIdx, [realFrom, newTo]);
        }

        setLineOverrides(overrides);

        const holdDuration = 400 + Math.random() * 400;
        const clearTimer = setTimeout(() => {
          setLineOverrides(new Map());
        }, holdDuration);

        const nextTimer = setTimeout(() => {
          scheduleRewire();
        }, holdDuration + 200);

        return () => {
          clearTimeout(clearTimer);
          clearTimeout(nextTimer);
        };
      }, delay);
    }

    const initialTimer = scheduleRewire();
    return () => clearTimeout(initialTimer);
  }, []);

  return (
    <>
      <SectionWrapper id="projects">
        {/* Section label — top-left corner */}
        <div
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
        >
          SYS::PROJECT_MAP / {PROJECTS.length} nodes
        </div>

        {/* Section label — bottom-right corner */}
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

        {/* Filter buttons — bottom-center */}
        <div
          style={{
            position: "absolute",
            bottom: "3rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "0.75rem",
            zIndex: 2,
            fontFamily: "monospace",
          }}
        >
          {FILTER_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setActiveFilter(value)}
              style={{
                fontSize: "10px",
                letterSpacing: "0.15em",
                padding: "0.2rem 0.6rem",
                border:
                  activeFilter === value
                    ? "1px solid rgba(255,255,255,0.9)"
                    : "1px solid rgba(255,255,255,0.4)",
                color:
                  activeFilter === value ? "white" : "rgba(255,255,255,0.7)",
                background:
                  activeFilter === value
                    ? "rgba(255,255,255,0.08)"
                    : "transparent",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* SVG connector layer — sits behind cards (zIndex 1), above canvas (zIndex -2) */}
        <ConnectorSVG lineOverrides={lineOverrides} />

        {/* Floating glitch labels — positioned near mesh connection midpoints */}
        {GLITCH_LABELS.map((label, i) => (
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
              opacity: 1,
              pointerEvents: "none",
              zIndex: 1,
              animation: `float-label ${3.5 + i * 0.5}s ease-in-out infinite, glitch-text ${7 + i * 1.3}s step-end infinite`,
              animationDelay: `${label.delay}s, ${label.delay + 1}s`,
            }}
          >
            {label.text}
          </span>
        ))}

        {/* Real project node cards */}
        {PROJECTS.map((project, index) => (
          <ProjectNode
            key={project.id}
            project={project}
            position={CARD_POSITIONS[index] ?? [10 + index * 20, 10]}
            index={index}
            isSelected={selectedProject?.id === project.id}
            isFiltered={
              activeFilter !== "all" && project.category !== activeFilter
            }
            onSelect={handleSelect}
            scrambleTrigger={scrambleTrigger}
          />
        ))}

        {/* Empty placeholder slots (indices 4-7) */}
        {CARD_POSITIONS.slice(4).map((_, i) => {
          const slotIndex = i + 4;
          return (
            <EmptyNode
              key={`empty-${slotIndex}`}
              index={slotIndex}
            />
          );
        })}

        {/* Center title node */}
        <CenterTitleNode scrambleTrigger={scrambleTrigger} />
      </SectionWrapper>

      {/* Detail modal — centered overlay */}
      <DetailPanel project={selectedProject} onClose={handleClose} />
    </>
  );
}
