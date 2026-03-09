import type { SectionId } from "@/types";

interface SectionWrapperProps {
  id: SectionId;
  children: React.ReactNode;
  className?: string;
  /**
   * When true the section takes exactly 100vh (default).
   * Pass false for sections that need more natural height (e.g. Contact).
   */
  fullHeight?: boolean;
}

/**
 * Wraps every section with:
 *   - The correct `id` for anchor navigation
 *   - A `data-section-id` attribute for IntersectionObserver background switching
 *   - Optional full-viewport height
 *
 * The background color is controlled at the page level by useSectionBackground;
 * each section is transparent here so the page bg shows through.
 */
export default function SectionWrapper({
  id,
  children,
  className = "",
  fullHeight = true,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      data-section-id={id}
      className={`relative w-full ${fullHeight ? "min-h-screen" : ""} ${className}`}
    >
      {children}
    </section>
  );
}
