"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import type { Project } from "@/types";

// ─── Project data ──────────────────────────────────────────────────────────────
// TODO: Replace with real project data and screenshots.
const PROJECTS: Project[] = [
  {
    id: "project-1",
    title: "Project One",
    description:
      "A deep dive into generative art systems using noise fields and emergent behaviour. Built with p5.js and a custom particle engine.",
    tags: ["p5.js", "TypeScript", "Canvas API"],
    image: "/images/projects/p1.png",
    link: "https://github.com/",
  },
  {
    id: "project-2",
    title: "Project Two",
    description:
      "Full-stack web application for collaborative annotation of digitised manuscripts. REST API with Next.js frontend.",
    tags: ["Next.js", "Node", "PostgreSQL"],
    image: "/images/projects/p2.png",
    link: "https://github.com/",
  },
  {
    id: "project-3",
    title: "Project Three",
    description:
      "CLI tool that parses academic paper PDFs and surfaces citation graphs as interactive force-directed visualisations.",
    tags: ["Python", "D3.js", "Graph Theory"],
    image: "/images/projects/p3.png",
    link: "https://github.com/",
  },
  {
    id: "project-4",
    title: "Project Four",
    description:
      "Procedural music generator trained on folk melodies. Outputs MIDI files via a Markov chain composition model.",
    tags: ["Python", "MIDI", "ML"],
    image: "/images/projects/p4.png",
    link: "https://github.com/",
  },
];

// ─── Card positions — hardcoded scatter across the viewport ───────────────────
// Each tuple is [top%, left%]. Chosen manually for a messy-intentional feel.
const CARD_POSITIONS: [number, number][] = [
  [8,  6],
  [10, 54],
  [54, 18],
  [58, 62],
];

// ─── SVG connector lines between cards ────────────────────────────────────────
// Each tuple is [fromIndex, toIndex]. Draws a line between those card centres.
// Centre of card i ≈ [CARD_POSITIONS[i][1] + 11, CARD_POSITIONS[i][0] + 6] in %.
const CONNECTIONS: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
  [1, 2],
];

// ─── Glitch labels floating between nodes ─────────────────────────────────────
interface GlitchLabel {
  text: string;
  top: number;  // %
  left: number; // %
  delay: number; // animation-delay in seconds
}

const GLITCH_LABELS: GlitchLabel[] = [
  { text: "ref_0x4f",   top: 6,  left: 33, delay: 0    },
  { text: "→ null",     top: 34, left: 8,  delay: 1.2  },
  { text: "⌀ link",     top: 28, left: 72, delay: 0.6  },
  { text: "0b1101",     top: 65, left: 44, delay: 1.8  },
  { text: "ERR//03",    top: 80, left: 78, delay: 0.3  },
  { text: "undef→",     top: 80, left: 12, delay: 2.1  },
];

// ─── Card width/height constants (used for centre calculation) ─────────────────
// These match the rendered card dimensions so SVG lines land accurately.
// Card: w ≈ 220px (~14vw), h ≈ 120px (~10vh) — centre offset added to top/left.
const CARD_W_PCT = 15; // approximate card width as % of viewport width
const CARD_H_PCT = 12; // approximate card height as % of viewport height

function cardCentre(index: number): [number, number] {
  const [top, left] = CARD_POSITIONS[index];
  return [top + CARD_H_PCT / 2, left + CARD_W_PCT / 2];
}

// ─── Glitchy preview text shown inside each collapsed card ────────────────────
const GLITCH_PREVIEWS = [
  ["▓▓ GEN_ART", "noise() → ∞", "// canvas"],
  ["▓ WEB_APP",  "GET /api/v1",  "// fullstack"],
  ["▓▓ CLI_TOOL","graph.parse()", "// python"],
  ["▓ PROC_MUS", "chain.next()", "// midi"],
];

// ─── ProjectNode ──────────────────────────────────────────────────────────────
interface ProjectNodeProps {
  project: Project;
  position: [number, number];
  index: number;
  isSelected: boolean;
  onSelect: (project: Project) => void;
}

function ProjectNode({ project, position, index, isSelected, onSelect }: ProjectNodeProps) {
  const [top, left] = position;
  const preview = GLITCH_PREVIEWS[index] ?? ["▓▓ ???", "// unknown"];

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
        animation: `node-pulse ${2.5 + index * 0.4}s ease-in-out infinite`,
        animationDelay: `${index * 0.3}s`,
      }}
      className={[
        "group w-[220px] cursor-pointer border px-4 py-3 text-left transition-all duration-200",
        "focus:outline-none focus-visible:ring-1 focus-visible:ring-current",
        isSelected
          ? "border-[#a0d8d8] bg-black/70 text-[#a0d8d8]"
          : "border-[#f0ebe0]/30 bg-black/50 text-[#f0ebe0]/80 hover:border-[#f0ebe0]/70 hover:text-[#f0ebe0]",
      ].join(" ")}
    >
      {/* Node ID */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] opacity-40 tracking-widest uppercase">
          node_{String(index).padStart(2, "0")}
        </span>
        <span className="text-[10px] opacity-30">[{project.tags[0]}]</span>
      </div>

      {/* Title with glitch */}
      <div
        className="text-sm font-bold tracking-wide"
        style={{ animation: `glitch-text ${3.5 + index * 0.7}s step-end infinite`, animationDelay: `${index * 0.9}s` }}
      >
        {project.title.toUpperCase()}
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
            isSelected ? "bg-[#a0d8d8]" : "bg-current opacity-40 group-hover:opacity-80",
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
        {/* Scanline/noise filter for the lines */}
        <filter id="line-noise" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" result="noise" seed="2" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      {CONNECTIONS.map(([fromIdx, toIdx], i) => {
        const [fromTop, fromLeft] = cardCentre(fromIdx);
        const [toTop, toLeft]     = cardCentre(toIdx);

        // Midpoint for the "glitch break" effect — a slightly offset second line segment
        const midLeft = (fromLeft + toLeft) / 2;
        const midTop  = (fromTop + toTop) / 2;

        return (
          <g key={i} filter="url(#line-noise)">
            {/* Primary line */}
            <line
              x1={`${fromLeft}%`} y1={`${fromTop}%`}
              x2={`${toLeft}%`}   y2={`${toTop}%`}
              stroke="#f0ebe0"
              strokeWidth="0.5"
              strokeOpacity="0.25"
              style={{
                animation: `glitch-line ${5 + i * 1.1}s step-end infinite`,
                animationDelay: `${i * 0.7}s`,
              }}
            />
            {/* Ghost offset line — gives corrupted-duplicate feeling */}
            <line
              x1={`${fromLeft + 0.15}%`} y1={`${fromTop + 0.1}%`}
              x2={`${midLeft}%`}          y2={`${midTop}%`}
              stroke="#80c0c0"
              strokeWidth="0.3"
              strokeOpacity="0.12"
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
              fill="#f0ebe0"
              fillOpacity="0.15"
            />
          </g>
        );
      })}
    </svg>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────
interface DetailPanelProps {
  project: Project | null;
  onClose: () => void;
}

function DetailPanel({ project, onClose }: DetailPanelProps) {
  // Close on Escape
  useEffect(() => {
    if (!project) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [project, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={project?.title ?? "Project detail"}
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        height: "100dvh",
        width: "min(420px, 100vw)",
        zIndex: 50,
        fontFamily: "monospace",
        transform: project ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)",
        background: "rgba(8, 12, 12, 0.97)",
        borderLeft: "1px solid rgba(160, 216, 216, 0.25)",
        display: "flex",
        flexDirection: "column",
        pointerEvents: project ? "auto" : "none",
      }}
    >
      {project && (
        <>
          {/* Header */}
          <div
            style={{
              padding: "1.5rem",
              borderBottom: "1px solid rgba(240, 235, 224, 0.1)",
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
                  color: "#a0d8d8",
                  lineHeight: 1.2,
                  animation: "glitch-text 6s step-end infinite",
                }}
              >
                {project.title.toUpperCase()}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close detail panel"
              style={{
                background: "none",
                border: "1px solid rgba(240, 235, 224, 0.2)",
                color: "#f0ebe0",
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
          <div style={{ flex: 1, overflow: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Description */}
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "0.2em", opacity: 0.4, marginBottom: "0.5rem" }}>
                README.md
              </div>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.7, opacity: 0.85, color: "#f0ebe0" }}>
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
                      border: "1px solid rgba(160, 216, 216, 0.4)",
                      color: "#a0d8d8",
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

            {/* Image placeholder */}
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "0.2em", opacity: 0.4, marginBottom: "0.75rem" }}>
                preview.png
              </div>
              <div
                style={{
                  border: "1px solid rgba(240, 235, 224, 0.12)",
                  height: "180px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  opacity: 0.3,
                  letterSpacing: "0.1em",
                }}
              >
                {/* TODO: replace with <Image> once real screenshots exist */}
                [IMG_NOT_FOUND]
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          {project.link && (
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderTop: "1px solid rgba(240, 235, 224, 0.1)",
              }}
            >
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  textAlign: "center",
                  border: "1px solid rgba(160, 216, 216, 0.5)",
                  color: "#a0d8d8",
                  padding: "0.75rem 1rem",
                  fontSize: "12px",
                  letterSpacing: "0.15em",
                  textDecoration: "none",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(160, 216, 216, 0.1)";
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
  );
}

// ─── Projects (main export) ───────────────────────────────────────────────────
export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

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

  const handleSelect = useCallback((project: Project) => {
    setSelectedProject((prev) => (prev?.id === project.id ? null : project));
  }, []);

  const handleClose = useCallback(() => {
    setSelectedProject(null);
  }, []);

  // ── Backdrop click to close panel ────────────────────────────────────────
  const handleBackdropClick = useCallback(() => {
    if (selectedProject) setSelectedProject(null);
  }, [selectedProject]);

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

        {/* Internal ref capture via callback ref on the section root */}
        <div
          ref={(el) => {
            if (el) {
              // Walk up to the <section> element that SectionWrapper renders
              sectionRef.current = el.closest("section") as HTMLElement | null;
            }
          }}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          aria-hidden="true"
        />

        {/* SVG connector layer — sits behind cards */}
        <ConnectorSVG />

        {/* Floating glitch labels */}
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
              color: "#f0ebe0",
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

        {/* Project node cards */}
        {PROJECTS.map((project, index) => (
          <ProjectNode
            key={project.id}
            project={project}
            position={CARD_POSITIONS[index] ?? [10 + index * 20, 10]}
            index={index}
            isSelected={selectedProject?.id === project.id}
            onSelect={handleSelect}
          />
        ))}
      </SectionWrapper>

      {/* Backdrop — dims content when panel is open, click to close */}
      <div
        onClick={handleBackdropClick}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 49,
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(1px)",
          pointerEvents: selectedProject ? "auto" : "none",
          opacity: selectedProject ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Detail panel — slides in from right */}
      <DetailPanel project={selectedProject} onClose={handleClose} />
    </>
  );
}
