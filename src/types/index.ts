// ─── Section IDs ──────────────────────────────────────────────────────────────
export type SectionId = "about" | "projects" | "art" | "photos" | "ctf" | "contact";

// ─── Navbar link ──────────────────────────────────────────────────────────────
export interface NavLink {
  label: string;
  href: SectionId;
}

// ─── Project ──────────────────────────────────────────────────────────────────
// Shared by clean mode (card grid) and wild mode (terminal). Array order in
// src/lib/projects.ts is display order.
export interface ProjectLink {
  label: string; // e.g. "github", "live demo"
  url: string;
}

export interface Project {
  id: string;
  title: string;
  pitch: string;       // one-liner
  description: string;
  role: string;        // what Marwa did, e.g. "full-stack · AI agents"
  context?: string;    // personal / client / course + team
  outcome?: string;    // award, result, metric
  tags: string[];      // tech stack
  image?: string;      // path relative to /public — omit until the file exists
  links: ProjectLink[];
  featured?: boolean;
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export interface Profile {
  name: string;
  firstName: string;
  role: string;
  location: string;
  tagline: string;
  email: string;
  github: { handle: string; url: string };
  linkedin: { handle: string; url: string };
  cvPath?: string; // path relative to /public — omit until the file exists
}

// ─── Art page ─────────────────────────────────────────────────────────────────
export interface ArtPage {
  id: string;
  drawings: ArtPiece[];
}

export interface ArtPiece {
  id: string;
  src: string; // path relative to /public
  alt: string;
  rotation?: number; // degrees, for scrapbook tilt effect
  width?: number;
  height?: number;
  top?: number;   // % of page height, center-point of piece
  left?: number;  // % of page width, center-point of piece
  label?: string; // optional caption shown below the piece
}

// ─── Photo album ──────────────────────────────────────────────────────────────
export interface PhotoAlbum {
  id: string;
  title: string;
  coverSrc: string; // camera folder cover image
  photos: Photo[];
}

export interface Photo {
  id: string;
  src: string;
  alt: string;
  caption?: string;
}

export type { CTFWriteup, CTFDifficulty, CTFCategory } from "./ctf";
