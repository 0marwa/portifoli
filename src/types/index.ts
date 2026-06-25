// ─── Section IDs ──────────────────────────────────────────────────────────────
export type SectionId = "about" | "projects" | "art" | "photos" | "ctf" | "contact";

// ─── Navbar link ──────────────────────────────────────────────────────────────
export interface NavLink {
  label: string;
  href: SectionId;
}

// ─── Project card ─────────────────────────────────────────────────────────────
export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  image: string; // path relative to /public
  link?: string;
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
