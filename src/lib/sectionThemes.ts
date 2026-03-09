import type { SectionId } from "@/types";

/**
 * Background color / texture per section.
 * ─────────────────────────────────────────────────────────────────────────────
 * TODO: replace the placeholder colors with your actual section backgrounds
 * once you send the reference images. Each entry can also include a CSS
 * background-image pointing to a texture in /public/textures/.
 *
 * Format:
 *   bg          → Tailwind bg-* class or arbitrary [#hex]
 *   texture     → optional path to a /public texture PNG (set as bg-image)
 */
export const SECTION_BACKGROUNDS: Record<
  SectionId,
  { bg: string; texture?: string }
> = {
  about:    { bg: "bg-[#f5f0e8]" },   // warm parchment — placeholder
  projects: { bg: "bg-[#e8ede0]" },   // muted sage — placeholder
  art:      { bg: "bg-[#ede8f5]" },   // soft lavender — placeholder
  photos:   { bg: "bg-[#f0e8e8]" },   // dusty rose — placeholder
  contact:  { bg: "bg-[#e8edf5]" },   // pale blue — placeholder
};
