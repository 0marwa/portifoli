"use client";

import { useEffect, useRef } from "react";

/**
 * One-shot glitch reveal hook.
 *
 * Attach the returned `sectionRef` to (or near) the section element.
 * Mark each child you want to animate with:
 *   data-glitch-reveal=""
 *   data-glitch-delay="300"          (ms, default 0)
 *   data-glitch-type="image"         (optional — uses image variant keyframe)
 *
 * When the section first crosses the threshold the hook swaps hidden classes
 * for active classes directly on the DOM nodes (no React re-render) and
 * immediately disconnects the observer so it never fires again.
 */
export function useGlitchReveal(threshold = 0.15) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        observer.disconnect();

        const targets = section.querySelectorAll<HTMLElement>("[data-glitch-reveal]");
        targets.forEach((el) => {
          const delay = parseInt(el.dataset.glitchDelay ?? "0", 10);
          const isImage = el.dataset.glitchType === "image";

          setTimeout(() => {
            if (isImage) {
              el.classList.remove("glitch-hidden-img");
              el.classList.add("glitch-reveal-img-active");
            } else {
              el.classList.remove("glitch-hidden");
              el.classList.add("glitch-reveal-active");
            }
          }, delay);
        });
      },
      { threshold }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [threshold]);

  return { sectionRef };
}
