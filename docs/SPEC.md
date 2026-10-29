# Portifoli — Spec (cahier des charges)

_Last updated: 2026-10-29 (shared-look revision)_

## 1. Vision

One site, two audiences.

- **Clean mode** (`/`) is the version employers see. It is the **same site** as wild mode (AboutMe, navbar, particles, Contact) except **Projects and CTF**, which are swapped for readable versions you can scan in 30 seconds.
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
| D7 | Routing | Separate routes sharing one shell (particles, navbar, scroll-to-top). Only the Projects and CTF sections differ, plus the extras that live in wild mode only. |
| D8 | Shared look | AboutMe, navbar, particles and Contact are visually identical in both modes (decided 2026-10-29). |

---

## 3. Information architecture

```
/            Clean mode
├── #about     Shared AboutMe — avatar is the explode trigger here
├── #projects  Project card grid  ← most important section (clean-only)
├── #ctf       Compact CTF list (clean-only, hidden until real writeups)
└── #contact   Shared Contact (+ CV download)

/digidump    Wild mode
├── Me         Shared AboutMe
├── Projects   Terminal-style projects (current)
├── CTF        Node map + OSWindow writeups (current)
├── Art        3D depth gallery (currently hidden, comes back here)
├── Photos     Corkboard + film strip (currently hidden, comes back here)
├── Contact    Shared Contact
└── "back to normal" control → implode → /
```

Later on, wild mode may evolve into the **Widget OS** concept: a desktop with floating widgets, where each section opens as an `OSWindow`.

---

## 4. Clean mode requirements

### 4.1 Shared with wild mode
AboutMe, navbar, particles, scroll-to-top and Contact are the **same components** in both modes. Clean mode only adds:
- The avatar becomes a link to wild mode, with an idle glitch and a "don't click me" hint (§6.4).
- A "✦ digidump" navbar link as a backup way in.
- The CTF navbar link is hidden until real writeups exist.

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
- The shared Contact section, plus a **CV download button** linking to `/cv/Marwa_Rezziki_CV.pdf` (the file needs to be added).

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
- **Performance:** good Lighthouse scores; wild-only sections (3D gallery, OSWindow, terminal) never ship in the `/` bundle; images via `next/image` with `sizes`.
- **Accessibility:** semantic headings, visible focus states, AA contrast in clean mode, alt text on all images.
- **SEO:** proper title and description, Open Graph image, clean mode is the indexed page.

---

## 9. Phases

| Phase | Scope | Done when |
|---|---|---|
| **P1 · Data** | Move content into `src/lib/` (projects, profile, routes); extend `Project` type | Both modes can import shared data; no content left in components |
| **P2 · Clean mode** | `/` = shared sections + clean project grid + clean CTF list (hidden until real data); stylish site moved to `/digidump` | Recruiter-ready on phone, tablet and desktop |
| **P3 · Wild route** | Add "back to normal" control; wild-only extras routing | `/digidump` works standalone |
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
- Contact ASCII piece in wild mode: safety pin (branch `28-safety-pin-ascii`), or something new?
- What to do with the unmerged branches: `feat/ctf-redesign`, `10-projects-section` (text-scramble hook could be useful in wild mode), `9-background-inspos`.

## 12. Out of scope (for now)

- Contact form backend (links + CV are enough for v1)
- CMS / admin for content
- Blog
