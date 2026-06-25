import type { SectionId } from "@/types";

/**
 * Maps each section to an optional photographic image overlay.
 *
 * "about" and "contact" intentionally have no image — the interactive canvas
 * background is the only backdrop for those two sections.
 *
 * For the remaining sections, place your files in /public/images/backgrounds/:
 *
 *   projects.jpg  → shown while the Projects section is active
 *   art.jpg       → shown while the Art Gallery section is active
 *   photos.jpg    → shown while the Photo Gallery section is active
 *
 * Images are displayed as background-size:cover, so landscape images work best.
 */
export const SECTION_BG_IMAGE: Record<SectionId, string> = {
  about:    "", // canvas only — no image overlay
  projects: "/images/backgrounds/projects.jpg",
  art:      "/images/backgrounds/art.jpg",
  photos:   "/images/backgrounds/photos.jpg",
  ctf:      "", // canvas only — no image overlay
  contact:  "", // canvas only — no image overlay
};
