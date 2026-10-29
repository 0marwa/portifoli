# Portifoli — Spec (cahier des charges)

_Last updated: 2026-10-29_

## 1. Vision

One site, two audiences.

- **Clean mode** (`/`) is the version employers see. It is dark and on-brand, but it's disciplined: you can scan it in 30 seconds, and it's fast and readable on any device.
- **Wild mode** (`/digidump`) is the stylish, experimental version: particles, glitch, terminal and OS windows, art, photos.
- **The bridge:** clicking the avatar (the drawn head in the centre of the About section) makes the clean site **explode** into wild mode. A button in wild mode **implodes** it back.

The clean site must hold up on its own. Wild mode is a reward for curious visitors, not a requirement for understanding who Marwa is.

---

## 2. Decisions

| # | Topic | Decision |
|---|---|---|
| D1 | Landing mode | Visitors **always** land on clean mode. The choice is never remembered between visits. |
| D2 | Wild mode content | It is a **superset** of clean mode: the same core content restyled, **plus extras** (art, photos, CTF map, experiments). |
| D3 | Wild mode URL | `/digidump` is the working name, with `/funsies` as the alternative. It's defined as a single constant so it's trivial to rename. |
| D4 | CV | Clean mode offers a **CV download**. |
| D5 | Platforms | Both modes **and** the explosion work on **phone, tablet and desktop**. |
| D6 | Shared data | All content lives in `src/lib/` data files, and both modes read from them. Content is never duplicated. |
| D7 | Routing | Separate routes, so clean mode never loads wild-mode code (p5, the 3D gallery, OSWindow). |

---

## 3. Information architecture

```
/            Clean mode
├── #me        Avatar (explode trigger) + name, role, location, short intro
├── #projects  Project card grid  ← most important section
├── #security  CTF / security work, compact list
└── #contact   Email · GitHub · LinkedIn · CV download

/digidump    Wild mode
├── Me         Current AboutMe (glitch reveal, blurbs, particles)
├── Projects   Terminal-style projects (current)
├── CTF        Node map + OSWindow writeups (current)
├── Art        3D depth gallery (currently hidden, comes back here)
├── Photos     Corkboard + film strip (currently hidden, comes back here)
├── Contact    Current contact + reworked ASCII piece
└── "back to normal" control → implode → /
```

Later on, wild mode may evolve into the **Widget OS** concept: a desktop with floating widgets, where each section opens as an `OSWindow`.

---

## 4. Clean mode requirements

### 4.1 General
- Same palette: `#0d0d0d` background, `#f0ebe0` text, pink `#f0b0c4` / teal `#a0d8d8` used sparingly as accents.
- **Typography:** Acidic only for the name and section titles. Geist for all body text, labels and metadata.
- Particles are either off, or a very subtle static/slow field. Readability always wins.
- Simple sticky nav: `me · projects · security · contact` plus a CV button.
- No scroll hijacking. Native scrolling only.

### 4.2 Me (hero)
- The avatar stays as the signature visual and is the explode trigger (§6).
- Name, role ("Computer Science student, EPFL" or similar), location (Lausanne, CH), and a 1–2 line intro.
- **Discoverability hint** (§6.4).

### 4.3 Projects (top priority)
- A responsive card grid: 1 column on phone, 2 on tablet, 2–3 on desktop.
- Each card shows:
  - title + one-line pitch
  - role / context (personal, client, EPFL course, team size)
  - tech stack (tags)
  - **outcome / highlight** (e.g. "2nd place, Battle of the Apps 2023")
  - links: GitHub, live demo (if any)
  - screenshot (optional; the card must look complete without one)
- Order: strongest or most relevant project first.
- Optional: a details view (expand or modal) for a longer description. Not needed for v1.

### 4.4 Security
- A compact list or table of CTF writeups: challenge, event, category, difficulty, date, link to the full writeup.
- Hidden until **real** writeups exist. Placeholder data must never ship to clean mode.

### 4.5 Contact
- Email, GitHub, LinkedIn: icon + text, all clickable.
- **CV download button** linking to `/cv/Marwa_Rezziki_CV.pdf` (the file needs to be added).

---

## 5. Wild mode requirements

- Hosts everything that exists now: AboutMe glitch reveal, terminal Projects, CTF node map + OSWindow, Contact, custom cursor, particles.
- Brings back **Art** and **Photo** galleries once their assets exist.
- Always visible **"back to normal"** control (top corner). It triggers the implosion (§6.3) and goes back to `/`.
- Directly linkable: visiting `/digidump` without the explosion works fine and simply loads wild mode.
- Must work on touch: no hover-only interactions, OSWindow drag and resize work with touch (already uses pointer events), and there are wheel-free alternatives wherever wheel scroll is hijacked.

---

## 6. The explosion

### 6.1 Sequence (~1.5 s)
1. **Trigger:** the visitor clicks or taps the avatar.
2. **Wind-up (≈200 ms):** the avatar glitches and shakes.
3. **Burst (≈500 ms):** particles burst outward from the avatar's centre, and the clean UI cracks into shards and flies apart.
4. **Settle (≈800 ms):** wild mode fades or glitches in behind the debris, and the particles settle into the wild-mode field.

### 6.2 Implementation sketch
- A full-screen overlay (portalled to `<body>`) plays the animation, and `router.push("/digidump")` runs underneath partway through.
- Wild-mode code is **prefetched** when the visitor hovers or focuses the avatar, so the switch is instant.
- Shards: CSS `clip-path` polygons on a snapshot layer, or split section blocks, driven by CSS keyframes and transforms. No animation libraries (project convention).
- Particle burst: a lightweight canvas for the overlay itself, so clean mode doesn't need p5.

### 6.3 Implosion (wild → clean)
- The same sequence reversed: debris pulls back into the avatar, then the clean layout snaps back.

### 6.4 Discoverability
Several layered, subtle hints:
- The avatar shows a small idle glitch every few seconds.
- The cursor changes on hover, and the avatar scales or wiggles slightly.
- A tiny handwritten-style label near the avatar ("don't click me" or similar).
- A backup nav link in clean mode: "✦ digidump".

### 6.5 Accessibility and fallbacks
- With `prefers-reduced-motion`, a simple ~300 ms crossfade replaces the explosion.
- The avatar is a real `<button>` with an accessible label ("Enter the digidump") and can be activated by keyboard.
- If JS fails, the avatar still links to `/digidump`.

---

## 7. Data layer

| File | Contents | Used by |
|---|---|---|
| `src/lib/projects.ts` | `PROJECTS` (moved out of `Projects.tsx`) | clean + wild |
| `src/lib/ctfData.ts` | `CTF_WRITEUPS` (exists) | clean + wild |
| `src/lib/profile.ts` | name, role, location, intro, socials, CV path | clean + wild |
| `src/lib/routes.ts` | `WILD_ROUTE = "/digidump"` | trigger, nav, back button |

Additions to the `Project` type: `pitch`, `role`, `context`, `outcome?`, `demo?`, `featured?`, `order`.

---

## 8. Non-functional requirements

- **Responsive:** 320 px → wide desktop, no horizontal scroll, minimum 16 px gutters.
- **Performance (clean mode):** good Lighthouse scores, no p5 or 3D code in the `/` bundle, images via `next/image` with `sizes`.
- **Accessibility:** semantic headings, visible focus states, AA contrast in clean mode, alt text on all images.
- **SEO:** proper title and description, Open Graph image, clean mode is the indexed page.

---

## 9. Phases

| Phase | Scope | Done when |
|---|---|---|
| **P1 · Data** | Move content into `src/lib/` (projects, profile, routes); extend `Project` type | Both modes can import shared data; no content left in components |
| **P2 · Clean mode** | Build `/`: hero, project grid, security list (hidden until real data), contact + CV | Recruiter-ready on phone, tablet and desktop |
| **P3 · Wild route** | Move current sections to `/digidump`; add "back to normal" control | `/digidump` works standalone; `/` has no wild code in its bundle |
| **P4 · Explosion** | Trigger, overlay, burst, shards, implosion, reduced-motion fallback, prefetch | Smooth on mid-range phone and desktop |
| **P5 · Wild extras** | Bring back Art + Photos; rework the Contact ASCII piece; explore Widget OS | Galleries live with real assets |
| **P6 · Polish** | Accessibility pass, SEO/OG, performance, cross-browser/device QA | Ready to share |

---

## 10. Content checklist (Marwa)

- [ ] CV PDF
- [ ] Final project list and order, plus pitch, role and outcome per project
- [ ] Project screenshots (optional): elysium/RAG chatbot, FeedMe, Scala web app
- [ ] Real CTF writeups
- [ ] Short intro line for the hero
- [ ] Art drawings (`drawing01–12.png`) and photos for wild mode
- [ ] Hand-drawn assets: scroll-to-top arrow, star for the blurb (Acidic font has no `★`)

---

## 11. Open questions

- Final wild-mode name: `/digidump` or `/funsies`?
- Clean-mode particles: fully off, or a very faint field?
- Keep the custom cursor in clean mode, or wild-only?
- Contact ASCII piece in wild mode: safety pin (branch `28-safety-pin-ascii`), or something new?
- What to do with the unmerged branches: `feat/ctf-redesign`, `10-projects-section` (text-scramble hook could be useful in wild mode), `9-background-inspos`.

## 12. Out of scope (for now)

- Contact form backend (links + CV are enough for v1)
- CMS / admin for content
- Blog
