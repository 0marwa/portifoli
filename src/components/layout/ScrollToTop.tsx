"use client";

import { useEffect, useState } from "react";

/**
 * Arrow ↑ button that appears after the user scrolls down 300px.
 * Sits fixed at the bottom-right of the screen.
 * The SVG arrow can be swapped for a hand-drawn asset once you have it.
 */
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className="fixed bottom-8 right-8 z-50 flex h-10 w-10 items-center justify-center rounded-full border-2 border-current bg-transparent opacity-70 transition-opacity hover:opacity-100"
    >
      {/* TODO: replace with your hand-drawn up-arrow asset */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}
