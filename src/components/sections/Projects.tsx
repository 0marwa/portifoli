"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import type { Project } from "@/types";

// ─── Project data ──────────────────────────────────────────────────────────────
const PROJECTS: Project[] = [
  {
    id: "cittitrip",
    title: "CittiTrip",
    description:
      "AI-powered travel planner built solo, end-to-end. Next.js + React Native frontend, TypeScript business logic, external API integrations. Designed and shipped the full stack autonomously.",
    tags: ["Next.js", "React Native", "TypeScript"],
    image: "/images/projects/cittitrip.png",
  },
  {
    id: "elysium",
    title: "Elysium Quran Chatbot",
    description:
      "Production website for a Moroccan company, including a functional chatbot via API integration. Responsible for front-end architecture, API wiring, and live deployment in a real client context.",
    tags: ["Next.js", "TypeScript", "APIs"],
    image: "/images/projects/elysium.png",
  },
  {
    id: "feedme",
    title: "FeedMe",
    description:
      "Android app built in a 14-week SCRUM team project at EPFL (CS311). Covered ideation → Figma prototyping → Kotlin development → user testing → final demo. 2nd place at Battle of the Apps 2023.",
    tags: ["Kotlin", "Figma", "SCRUM"],
    image: "/images/projects/feedme.png",
    link: "https://github.com/feedme-swent-epfl/feedme-android",
  },
  {
    id: "scala-webapp",
    title: "Web App",
    description:
      "Academic web application built for EPFL's Software Construction course. Focused on software architecture, clean separation of concerns, and UI implementation in Scala.",
    tags: ["Scala", "Web", "EPFL"],
    image: "/images/projects/scala-webapp.png",
  },
];

// ─── Terminal-enriched project metadata ───────────────────────────────────────
interface TerminalProject extends Project {
  dir:   string;
  lang:  string;
  one:   string;
  role:  string;
  sig:   string;
  links: { label: string; url: string }[];
}

const TP: TerminalProject[] = [
  {
    ...PROJECTS[0],
    dir:  "cittitrip/",
    lang: "Next.js",
    one:  "AI travel planner",
    role: "full-stack · solo",
    sig:  "plan() → trip",
    links: [{ label: "github", url: "https://github.com/0marwa" }],
  },
  {
    ...PROJECTS[1],
    dir:  "elysium-quran-chatbot/",
    lang: "Next.js",
    one:  "grounded Q&A chatbot",
    role: "full-stack · client project",
    sig:  "POST /api/chat",
    links: [{ label: "github", url: "https://github.com/0marwa" }],
  },
  {
    ...PROJECTS[2],
    dir:  "feedme/",
    lang: "Kotlin",
    one:  "meal-sharing Android app",
    role: "mobile · SCRUM team · EPFL",
    sig:  "scrum.sprint() → 2nd place",
    links: [{ label: "github", url: "https://github.com/feedme-swent-epfl/feedme-android" }],
  },
  {
    ...PROJECTS[3],
    dir:  "scala-webapp/",
    lang: "Scala",
    one:  "full-stack coursework",
    role: "EPFL · team",
    sig:  "build(scala)",
    links: [{ label: "github", url: "https://github.com/0marwa" }],
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────
const ACCENT      = "#f0b0c4";
const PROMPT      = ">";
const TYPE_MS     = 42;

// ─── Shell line ───────────────────────────────────────────────────────────────
type LineKind = "out" | "dim" | "cmd" | "accent" | "rule" | "err";
interface Line { text: string; kind: LineKind }

function color(k: LineKind): string {
  switch (k) {
    case "out":    return "rgba(236,237,238,.86)";
    case "dim":    return "rgba(236,237,238,.46)";
    case "cmd":    return "#ececed";
    case "accent": return ACCENT;
    case "rule":   return "rgba(236,237,238,.26)";
    case "err":    return "#e3795f";
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pad(s: string, n: number) { return s.length >= n ? s : s + " ".repeat(n - s.length); }

function findProject(q: string): TerminalProject | undefined {
  const lower = q.toLowerCase();
  return TP.find(
    (p) =>
      p.id === lower ||
      p.dir.replace("/", "") === lower ||
      p.title.toLowerCase() === lower ||
      p.id.includes(lower) ||
      p.title.toLowerCase().includes(lower),
  );
}

// ─── Line factories ───────────────────────────────────────────────────────────
const o = (text: string, kind: LineKind = "out"): Line => ({ text, kind });

function banner(): Line[] {
  return [o("")];
}

function whoami(): Line[] {
  return [
    o("marwa"),
    o("// CS @ EPFL · builds web + mobile · plays CTF · makes art", "dim"),
    o(""),
  ];
}

function ls(): Line[] {
  return [
    o("total " + TP.length, "dim"),
    ...TP.map((p) => o("drwxr-xr-x  " + pad(p.dir, 26) + p.one + " · " + p.lang)),
    o(""),
    o("// 'cat <name>' to inspect a project", "dim"),
    o(""),
  ];
}

function cat(p: TerminalProject): Line[] {
  const head = "── " + p.title.toUpperCase() + " ";
  const dash = "─".repeat(Math.max(6, 54 - head.length));
  return [
    o(""),
    o(head + dash, "rule"),
    o("   " + p.description),
    o("   stack · " + p.tags.join(" · "), "dim"),
    o("   role  · " + p.role, "dim"),
    o("   sig   · " + p.sig, "dim"),
    o("   link  · " + p.links.map((l) => "↗ " + l.label).join("    "), "accent"),
    o("─".repeat(54), "rule"),
    o(""),
  ];
}

function help(): Line[] {
  return [
    o("commands", "cmd"),
    o("  ls               list all projects", "dim"),
    o("  cat <name>       inspect a project", "dim"),
    o("  open <name>      open project link", "dim"),
    o("  tree             switch to tree view", "dim"),
    o("  clear            clear the screen", "dim"),
    o("  whoami           about me", "dim"),
    o(""),
  ];
}

// ─── Noise URI (no external dep) ─────────────────────────────────────────────
const NOISE_URI = (() => {
  const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>";
  return `data:image/svg+xml;base64,${btoa(svg)}`;
})();

// ─── Projects ─────────────────────────────────────────────────────────────────
export default function Projects() {
  const [view,      setView]      = useState<"shell" | "tree">("shell");
  const [lines,     setLines]     = useState<Line[]>(banner());
  const [booted,    setBooted]    = useState(false);
  const [input,     setInput]     = useState("");
  const [treeOpen,  setTreeOpen]  = useState<Record<string, boolean>>({});
  const [treeReveal, setReveal]   = useState(0);
  const [treeDrawn,  setDrawn]    = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollRef  = useRef<HTMLDivElement | null>(null);
  const inputRef   = useRef<HTMLInputElement | null>(null);
  const timers     = useRef<ReturnType<typeof setTimeout>[]>([]);
  const bootDone   = useRef(false);
  const treeDone   = useRef(false);

  // ── One-time setup: font + keyframe injection ─────────────────────────────
  useEffect(() => {
    if (!document.getElementById("pe-font")) {
      const l  = document.createElement("link");
      l.id     = "pe-font";
      l.rel    = "stylesheet";
      l.href   = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap";
      document.head.appendChild(l);
    }
    if (!document.getElementById("pe-kf")) {
      const s       = document.createElement("style");
      s.id          = "pe-kf";
      s.textContent = "@keyframes pe-flick{0%,100%{opacity:.07}45%{opacity:.045}70%{opacity:.085}}";
      document.head.appendChild(s);
    }
    return () => { timers.current.forEach(clearTimeout); };
  }, []);

  // ── Particle dimming ──────────────────────────────────────────────────────
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

  // ── Auto-scroll shell on new lines ────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  // ── Boot sequence — imperative timer queue ────────────────────────────────
  useEffect(() => {
    if (view !== "shell" || bootDone.current) return;
    bootDone.current = true;

    let t = 0;

    // Helper: schedule a setTimeout and track it
    const after = (ms: number, fn: () => void) => {
      t += ms;
      timers.current.push(setTimeout(fn, t));
    };

    // Type a command character by character into the last line of `lines`
    // We use a closure over `lineIndex` because we know we add the prompt line first
    const typeCmd = (cmd: string, onDone: () => void) => {
      // Push the prompt line
      let lineIndex = -1;
      setLines((prev) => { lineIndex = prev.length; return [...prev, o(PROMPT + " ", "cmd")]; });

      // Type each character
      for (let i = 1; i <= cmd.length; i++) {
        const chars = cmd.slice(0, i);
        after(TYPE_MS, () => {
          setLines((prev) => {
            // lineIndex captured at push time — but it may not be set yet due to closure timing.
            // Use a stable ref trick: update the last line that starts with PROMPT + " "
            const updated = [...prev];
            // Find the line we pushed: it's the one at lineIndex (we capture via the let)
            if (lineIndex >= 0 && lineIndex < updated.length) {
              updated[lineIndex] = o(PROMPT + " " + chars, "cmd");
            }
            return updated;
          });
        });
      }

      after(300, onDone);
    };

    // Boot sequence: whoami → output → ls → output → ready
    typeCmd("whoami", () => {
      setLines((prev) => [...prev, ...whoami()]);
      after(380, () => {
        typeCmd("ls ~/projects", () => {
          setLines((prev) => [...prev, ...ls()]);
          setBooted(true);
          timers.current.push(setTimeout(() => inputRef.current?.focus(), 30));
        });
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // ── Tree reveal animation ─────────────────────────────────────────────────
  useEffect(() => {
    if (view !== "tree" || treeDone.current) return;
    treeDone.current = true;
    const total = 1 + TP.length;
    let count   = 0;
    const step  = () => {
      count++;
      setReveal(count);
      if (count >= total) setDrawn(true);
      else timers.current.push(setTimeout(step, 120));
    };
    timers.current.push(setTimeout(step, 220));
  }, [view]);

  // ── Command handler ───────────────────────────────────────────────────────
  const runCommand = useCallback((raw: string) => {
    const cmd  = raw.trim();
    const verb = cmd.split(/\s+/)[0]?.toLowerCase() ?? "";
    const arg  = cmd.split(/\s+/).slice(1).join(" ").toLowerCase().replace(/\/$/, "");

    setLines((prev) => [...prev, o(PROMPT + " " + cmd, "cmd")]);
    setInput("");
    if (!cmd) return;

    if (verb === "clear")                         { setLines(banner()); return; }
    if (verb === "help" || verb === "h")          { setLines((p) => [...p, ...help()]); return; }
    if (["ls", "ll", "dir"].includes(verb))       { setLines((p) => [...p, ...ls()]);  return; }
    if (verb === "whoami")                        { setLines((p) => [...p, ...whoami()]); return; }
    if (verb === "tree") {
      setLines((p) => [...p, o("→ opening tree view…", "accent")]);
      timers.current.push(setTimeout(() => setView("tree"), 260));
      return;
    }
    if (verb === "shell") {
      setLines((p) => [...p, o("→ switching to shell…", "accent")]);
      timers.current.push(setTimeout(() => { setView("shell"); setTimeout(() => inputRef.current?.focus(), 30); }, 260));
      return;
    }
    if (["cat", "inspect", "cd"].includes(verb)) {
      const p = findProject(arg);
      if (p) setLines((prev) => [...prev, ...cat(p)]);
      else   setLines((prev) => [...prev, o(`cat: ${arg || "?"}: no such project — try 'ls'`, "err")]);
      return;
    }
    if (["open", "xdg-open"].includes(verb)) {
      const p = findProject(arg);
      if (p) {
        setLines((prev) => [...prev, o(`↗ opening ${p.links[0].label} …`, "accent")]);
        timers.current.push(setTimeout(() => window.open(p.links[0].url, "_blank"), 300));
      } else {
        setLines((prev) => [...prev, o(`open: ${arg || "?"}: not found`, "err")]);
      }
      return;
    }
    if (verb === "sudo") {
      setLines((p) => [...p, o("guest is not in the sudoers file. This incident will be reported.", "err")]);
      return;
    }
    if (verb === "flag" || verb === "ctf") {
      setLines((p) => [...p, o("flag{w3lc0me_t0_my_p0rtf0li0}", "accent"), o("// nice. you read the source too?", "dim")]);
      return;
    }
    setLines((p) => [...p, o(`zsh: command not found: ${verb} — try 'help'`, "err")]);
  }, []);

  // ── View switch ───────────────────────────────────────────────────────────
  const switchView = (v: "shell" | "tree") => {
    setView(v);
    if (v === "shell") setTimeout(() => inputRef.current?.focus(), 30);
  };

  // ── Tree rows ─────────────────────────────────────────────────────────────
  const treeRows = () => {
    const rows: { text: string; kind: LineKind; clickable?: boolean; id?: string }[] = [];
    rows.push({ text: "~/projects", kind: "accent" });
    TP.forEach((p, i) => {
      const last   = i === TP.length - 1;
      const isOpen = !!treeOpen[p.id];
      const label  = (last ? "└─ " : "├─ ") + (isOpen ? "▾ " : "▸ ") + p.dir;
      rows.push({ text: pad(label, 34) + p.one + " · " + p.lang, kind: "cmd", clickable: true, id: p.id });
      if (isOpen) {
        const c = last ? "    " : "│   ";
        rows.push({ text: c + "  readme · " + p.description, kind: "out" });
        rows.push({ text: c + "  stack  · " + p.tags.join(" · "), kind: "dim" });
        rows.push({ text: c + "  role   · " + p.role, kind: "dim" });
        rows.push({ text: c + "  link   · " + p.links.map((l) => "↗ " + l.label).join("   "), kind: "accent" });
        if (!last) rows.push({ text: "│", kind: "rule" });
      }
    });
    return treeDrawn ? rows : rows.slice(0, treeReveal);
  };

  // ── Tab style ─────────────────────────────────────────────────────────────
  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding:       "6px 15px",
    cursor:        "pointer",
    letterSpacing: ".14em",
    fontSize:      "12px",
    color:         active ? "#ececed" : "rgba(236,237,238,.4)",
    userSelect:    "none",
    transition:    "color .15s, border-color .15s",
    background:    "none",
    border:        "none",
    borderBottom:  active ? `2px solid ${ACCENT}` : "2px solid transparent",
    fontFamily:    "inherit",
  });

  return (
    <SectionWrapper id="projects">
      {/* Ref anchor for IntersectionObserver (particle dimming) */}
      <div
        ref={(el) => {
          if (el) sectionRef.current = el.closest("section") as HTMLElement | null;
        }}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />

      <div
        style={{
          position:      "relative",
          height:        "100vh",
          color:         "rgba(236,237,238,.86)",
          fontFamily:    "'JetBrains Mono', ui-monospace, monospace",
          display:       "flex",
          flexDirection: "column",
          overflow:      "hidden",
          background:    "transparent",
        }}
      >
        {/* Noise grain */}
        <div
          aria-hidden="true"
          style={{
            position:        "absolute",
            inset:           0,
            pointerEvents:   "none",
            zIndex:          1,
            opacity:         0.055,
            mixBlendMode:    "screen",
            backgroundImage: `url("${NOISE_URI}")`,
            animation:       "pe-flick 7s steps(4) infinite",
          }}
        />

        {/* Scanlines */}
        <div
          aria-hidden="true"
          style={{
            position:      "absolute",
            inset:         0,
            pointerEvents: "none",
            zIndex:        1,
            opacity:       0.35,
            background:    "repeating-linear-gradient(to bottom, rgba(255,255,255,.018) 0px, rgba(255,255,255,.018) 1px, transparent 1px, transparent 3px)",
          }}
        />

        {/* Vignette */}
        <div
          aria-hidden="true"
          style={{
            position:      "absolute",
            inset:         0,
            pointerEvents: "none",
            zIndex:        1,
            background:    "radial-gradient(120% 120% at 50% 0%, transparent 55%, rgba(0,0,0,.4) 100%)",
          }}
        />

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header
          style={{
            position:    "relative",
            zIndex:      3,
            padding:     "32px 40px 20px",
            borderBottom: "1px solid rgba(236,237,238,.1)",
            flexShrink:  0,
          }}
        >
          {/* Big title */}
          <h2
            style={{
              fontFamily:    "var(--font-acidic), sans-serif",
              fontSize:      "clamp(2.8rem, 6vw, 5rem)",
              fontWeight:    700,
              letterSpacing: "-.01em",
              lineHeight:    1,
              color:         "#f0ebe0",
              margin:        0,
            }}
          >
            projects
          </h2>

          {/* Subtitle + tabs row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px" }}>
            <p style={{ fontFamily: "inherit", fontSize: "13px", color: "rgba(236,237,238,.45)", letterSpacing: ".04em", margin: 0 }}>
              type{" "}
              <span style={{ color: ACCENT }}>&apos;help&apos;</span>
              {" "}to start
            </p>

            <div style={{ display: "flex", gap: "4px" }}>
              <button onClick={() => switchView("shell")} style={tabStyle(view === "shell")}>SHELL</button>
              <button onClick={() => switchView("tree")}  style={tabStyle(view === "tree")}>TREE</button>
            </div>
          </div>
        </header>

        {/* ── Main ───────────────────────────────────────────────────────── */}
        <main
          style={{
            position:      "relative",
            zIndex:        2,
            flex:          1,
            minHeight:     0,
            padding:       "26px 40px 24px",
            display:       "flex",
            flexDirection: "column",
          }}
        >
          {/* SHELL */}
          {view === "shell" && (
            <div
              onClick={() => inputRef.current?.focus()}
              style={{ width: "100%", maxWidth: "960px", margin: "0 auto", height: "100%", display: "flex", flexDirection: "column", cursor: "text" }}
            >
              <div
                ref={scrollRef}
                style={{ flex: 1, minHeight: 0, overflowY: "auto", fontSize: "14px", lineHeight: 1.7, paddingRight: "8px", scrollbarWidth: "thin", scrollbarColor: "rgba(236,237,238,.12) transparent" }}
              >
                {lines.map((line, i) => (
                  <div key={i} style={{ color: color(line.kind), whiteSpace: "pre-wrap", margin: 0 }}>
                    {line.text}
                  </div>
                ))}

                {booted && (
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", paddingTop: "2px" }}>
                    <span style={{ color: ACCENT, whiteSpace: "pre", flexShrink: 0, fontSize: "14px" }}>{PROMPT}</span>
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") runCommand(input); }}
                      spellCheck={false}
                      autoComplete="off"
                      placeholder="type a command…"
                      style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", color: "#ececed", fontFamily: "inherit", fontSize: "inherit", padding: 0, caretColor: ACCENT }}
                    />
                  </div>
                )}
              </div>

              <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid rgba(236,237,238,.08)", color: "rgba(236,237,238,.26)", fontSize: "12px", letterSpacing: ".03em", flexShrink: 0 }}>
                help · ls · cat &lt;name&gt; · open &lt;name&gt; · tree · clear
              </div>
            </div>
          )}

          {/* TREE */}
          {view === "tree" && (
            <div style={{ width: "100%", maxWidth: "900px", margin: "0 auto", height: "100%", overflowY: "auto", paddingTop: "4px", scrollbarWidth: "thin", scrollbarColor: "rgba(236,237,238,.12) transparent" }}>
              <div style={{ fontSize: "12px", letterSpacing: ".04em", color: "rgba(236,237,238,.38)", marginBottom: "16px" }}>
                $ tree ~/projects&nbsp;&nbsp;<span style={{ color: "rgba(236,237,238,.22)" }}>— click a folder to expand</span>
              </div>
              <div style={{ fontSize: "14px", lineHeight: 1.95 }}>
                {treeRows().map((row, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      if (row.clickable && row.id && treeDrawn) {
                        setTreeOpen((prev) => ({ ...prev, [row.id!]: !prev[row.id!] }));
                      }
                    }}
                    style={{ color: color(row.kind), whiteSpace: "pre-wrap", margin: 0, cursor: row.clickable ? "pointer" : "default" }}
                  >
                    {row.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </SectionWrapper>
  );
}
