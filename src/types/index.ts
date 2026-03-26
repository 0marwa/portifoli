// ─── Section IDs ──────────────────────────────────────────────────────────────
export type SectionId = "about" | "projects" | "art" | "photos" | "contact";

// ─── Navbar link ──────────────────────────────────────────────────────────────
export interface NavLink {
  label: string;
  href: SectionId;
}

// ─── Project card ─────────────────────────────────────────────────────────────
export type ProjectCategory = 'academic' | 'personal' | 'volunteering';

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  image: string; // path relative to /public
  link?: string;
  category: ProjectCategory;
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
