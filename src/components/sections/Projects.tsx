"use client";

import { useState, useRef, useCallback } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import type { Project } from "@/types";

/**
 * ─── Projects ─────────────────────────────────────────────────────────────────
 *
 * Horizontal gallery driven by native CSS scroll-snap.
 * An IntersectionObserver tracks the active slide for the dot indicators.
 * Dots are clickable and scroll to their respective slide.
 *
 * TODO:
 *   1. Replace PROJECTS placeholder data with your real projects.
 *   2. Add project screenshots to /public/images/projects/.
 *   3. Apply your grungy font + border/texture styles.
 */

const PROJECTS: Project[] = [
  {
    id: "project-1",
    title: "Project One",               // TODO
    description: "Short description of what this project does and why it matters.", // TODO
    tags: ["React", "Next.js"],         // TODO
    image: "/images/projects/p1.png",   // TODO — put screenshot in /public/images/projects/
    link: "https://github.com/",        // TODO
  },
  {
    id: "project-2",
    title: "Project Two",               // TODO
    description: "Short description.",  // TODO
    tags: ["TypeScript", "Node"],       // TODO
    image: "/images/projects/p2.png",   // TODO
    link: "https://github.com/",        // TODO
  },
  {
    id: "project-3",
    title: "Project Three",             // TODO
    description: "Short description.",  // TODO
    tags: ["Design", "Figma"],          // TODO
    image: "/images/projects/p3.png",   // TODO
    link: "https://github.com/",        // TODO
  },
  // Add more projects here ↓
];

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="flex h-full w-screen shrink-0 flex-col items-center justify-center gap-8 px-12 py-24 md:flex-row md:gap-16">

      {/* screenshot */}
      <div className="relative h-56 w-full max-w-md shrink-0 overflow-hidden rounded-md border-2 border-current md:h-72">
        {/* TODO: uncomment once real screenshots are in /public */}
        {/* <Image src={project.image} alt={project.title} fill className="object-cover" /> */}
        <div className="flex h-full w-full items-center justify-center opacity-20 text-sm">
          {project.image}
        </div>
      </div>

      {/* info */}
      <div className="max-w-sm space-y-4">
        <h2 className="text-3xl font-bold">{project.title}</h2>
        <p className="leading-relaxed opacity-80">{project.description}</p>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-current px-2 py-0.5 text-xs uppercase tracking-wider"
            >
              {tag}
            </span>
          ))}
        </div>
        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border-b border-current pb-0.5 text-sm transition-opacity hover:opacity-60"
          >
            View project →
          </a>
        )}
      </div>
    </div>
  );
}

export default function Projects() {
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);

  const scrollToSlide = useCallback((index: number) => {
    setActiveSlide(index);
  }, []);

  return (
    <SectionWrapper id="projects">
      {/* Clickable dot indicators */}
      <div className="pointer-events-auto absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {PROJECTS.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToSlide(i)}
            aria-label={`Go to project ${i + 1}`}
            className={`block h-1.5 rounded-full bg-current transition-all duration-300 ${
              i === activeSlide
                ? "w-8 opacity-90"
                : "w-6 opacity-30 hover:opacity-50"
            }`}
          />
        ))}
      </div>

      {/* Slide viewport — overflow-hidden, no scroll container */}
      <div className="h-screen w-full overflow-hidden">
        {/* Slide track — moves via CSS transform, no scroll layer */}
        <div
          ref={containerRef}
          className="flex h-full"
          style={{
            transform: `translateX(-${activeSlide * 100}vw)`,
            transition: "transform 0.5s ease-in-out",
            width: `${PROJECTS.length * 100}vw`,
          }}
        >
          {PROJECTS.map((project, index) => (
            <div
              key={project.id}
              ref={(el) => { slideRefs.current[index] = el; }}
              className="h-full w-screen shrink-0"
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
