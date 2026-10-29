"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// ─── OSWindow — draggable, resizable, maximisable desktop-style window ───────
// Drag by the title bar, resize from any edge/corner, double-click the title
// bar (or □) to maximise, Escape or × to close.

type Rect = { x: number; y: number; w: number; h: number };
type Edge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const MIN_W = 320;
const MIN_H = 220;
const MARGIN = 8;          // keep this much of the viewport free around a maximised window
const TITLE_BAR_H = 34;
const MOBILE_BP = 640;     // below this width the window always opens maximised

const EDGE_CURSOR: Record<Edge, string> = {
  n: "ns-resize", s: "ns-resize", e: "ew-resize", w: "ew-resize",
  ne: "nesw-resize", sw: "nesw-resize", nw: "nwse-resize", se: "nwse-resize",
};

function initialRect(): Rect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(640, vw - MARGIN * 2);
  const h = Math.min(Math.round(vh * 0.72), vh - MARGIN * 2);
  return { x: Math.round((vw - w) / 2), y: Math.round((vh - h) / 2), w, h };
}

function maximisedRect(): Rect {
  return {
    x: MARGIN,
    y: MARGIN,
    w: window.innerWidth - MARGIN * 2,
    h: window.innerHeight - MARGIN * 2,
  };
}

// Keep at least the title bar reachable so the window can always be dragged back
function clampPosition(r: Rect): Rect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return {
    ...r,
    x: Math.min(Math.max(r.x, 80 - r.w), vw - 80),
    y: Math.min(Math.max(r.y, 0), vh - TITLE_BAR_H),
  };
}

interface OSWindowProps {
  title: string;
  accent?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function OSWindow({ title, accent = "#a0d8d8", onClose, children }: OSWindowProps) {
  const [rect, setRect] = useState<Rect>(() => initialRect());
  const [maximised, setMaximised] = useState(() => window.innerWidth < MOBILE_BP);
  const [gesturing, setGesturing] = useState(false);
  const restoreRef = useRef<Rect | null>(null);
  const gestureRef = useRef<{ kind: "move" | Edge; startX: number; startY: number; start: Rect } | null>(null);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Re-fit when the viewport changes
  useEffect(() => {
    const handleResize = () => {
      if (maximised) setRect(maximisedRect());
      else setRect((r) => clampPosition(r));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [maximised]);

  const shown = maximised ? maximisedRect() : rect;

  function toggleMaximise() {
    if (maximised) {
      setMaximised(false);
      if (restoreRef.current) setRect(restoreRef.current);
    } else {
      restoreRef.current = rect;
      setMaximised(true);
    }
  }

  function startGesture(kind: "move" | Edge, e: React.PointerEvent<HTMLElement>) {
    if (e.button !== 0) return;
    // Dragging a maximised window restores it under the cursor, like a real OS
    let start = rect;
    if (maximised) {
      if (kind !== "move") return;
      const restored = restoreRef.current ?? initialRect();
      start = { ...restored, x: e.clientX - restored.w / 2, y: e.clientY - TITLE_BAR_H / 2 };
      setMaximised(false);
      setRect(start);
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    gestureRef.current = { kind, startX: e.clientX, startY: e.clientY, start };
    setGesturing(true);
    e.preventDefault();
  }

  function onGestureMove(e: React.PointerEvent<HTMLElement>) {
    const g = gestureRef.current;
    if (!g) return;
    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;
    const s = g.start;

    if (g.kind === "move") {
      setRect(clampPosition({ ...s, x: s.x + dx, y: s.y + dy }));
      return;
    }

    let { x, y, w, h } = s;
    if (g.kind.includes("e")) w = Math.max(MIN_W, s.w + dx);
    if (g.kind.includes("s")) h = Math.max(MIN_H, s.h + dy);
    if (g.kind.includes("w")) {
      w = Math.max(MIN_W, s.w - dx);
      x = s.x + (s.w - w);
    }
    if (g.kind.includes("n")) {
      h = Math.max(MIN_H, s.h - dy);
      y = Math.max(0, s.y + (s.h - h));
      h = s.y + s.h - y;
    }
    setRect({ x, y, w, h });
  }

  function endGesture(e: React.PointerEvent<HTMLElement>) {
    if (!gestureRef.current) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    gestureRef.current = null;
    setGesturing(false);
  }

  const gestureHandlers = {
    onPointerMove: onGestureMove,
    onPointerUp: endGesture,
    onPointerCancel: endGesture,
  };

  const edges: { edge: Edge; style: React.CSSProperties }[] = [
    { edge: "n",  style: { top: -3, left: 8, right: 8, height: 6 } },
    { edge: "s",  style: { bottom: -3, left: 8, right: 8, height: 6 } },
    { edge: "e",  style: { right: -3, top: 8, bottom: 8, width: 6 } },
    { edge: "w",  style: { left: -3, top: 8, bottom: 8, width: 6 } },
    { edge: "nw", style: { top: -4, left: -4, width: 12, height: 12 } },
    { edge: "ne", style: { top: -4, right: -4, width: 12, height: 12 } },
    { edge: "sw", style: { bottom: -4, left: -4, width: 12, height: 12 } },
    { edge: "se", style: { bottom: -4, right: -4, width: 14, height: 14 } },
  ];

  const titleButton: React.CSSProperties = {
    width: 22,
    height: 20,
    display: "grid",
    placeItems: "center",
    background: "none",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "rgba(255,255,255,0.75)",
    cursor: "pointer",
    fontSize: "11px",
    lineHeight: 1,
    fontFamily: "monospace",
  };

  // Portalled to <body>: <main> is its own stacking context (z-0), which would
  // otherwise trap the window underneath the Navbar
  return createPortal(
    <div
      role="dialog"
      aria-label={title}
      className="animate-os-window-open"
      style={{
        position: "fixed",
        left: shown.x,
        top: shown.y,
        width: shown.w,
        height: shown.h,
        zIndex: 60,           // above Navbar + ScrollToTop (z-50), below CustomCursor
        display: "flex",
        flexDirection: "column",
        background: "#080c0c",
        border: `1px solid ${accent}55`,
        boxShadow: `0 0 0 1px rgba(0,0,0,0.6), 0 24px 60px rgba(0,0,0,0.7), 0 0 24px ${accent}14`,
        fontFamily: "monospace",
        transition: gesturing ? "none" : "left 0.18s ease, top 0.18s ease, width 0.18s ease, height 0.18s ease",
      }}
    >
      {/* ── Title bar ── */}
      <div
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          startGesture("move", e);
        }}
        onDoubleClick={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          toggleMaximise();
        }}
        {...gestureHandlers}
        style={{
          height: TITLE_BAR_H,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0 0.5rem 0 0.75rem",
          borderBottom: `1px solid ${accent}33`,
          background: `linear-gradient(90deg, ${accent}1f, transparent 70%)`,
          cursor: maximised ? "default" : "move",
          userSelect: "none",
          touchAction: "none",
        }}
      >
        <span aria-hidden="true" style={{ color: accent, fontSize: "10px", opacity: 0.8 }}>◇</span>
        <span
          style={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: "11px",
            letterSpacing: "0.15em",
            opacity: 0.75,
          }}
        >
          {title}
        </span>
        <button
          type="button"
          onClick={toggleMaximise}
          aria-label={maximised ? "Restore window" : "Maximise window"}
          style={titleButton}
        >
          {maximised ? "❐" : "□"}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close window"
          style={{ ...titleButton, borderColor: `${accent}66`, color: accent }}
        >
          ×
        </button>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>{children}</div>

      {/* ── Resize handles ── */}
      {!maximised &&
        edges.map(({ edge, style }) => (
          <div
            key={edge}
            aria-hidden="true"
            onPointerDown={(e) => startGesture(edge, e)}
            {...gestureHandlers}
            style={{ position: "absolute", ...style, cursor: EDGE_CURSOR[edge], touchAction: "none", zIndex: 2 }}
          />
        ))}

      {/* Corner grip hint */}
      {!maximised && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 3,
            bottom: 1,
            fontSize: "10px",
            color: accent,
            opacity: 0.45,
            pointerEvents: "none",
          }}
        >
          ◢
        </span>
      )}
    </div>,
    document.body,
  );
}
