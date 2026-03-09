"use client";

import SectionWrapper from "@/components/ui/SectionWrapper";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import type { Project } from "@/types";
import Image from "next/image";

/**
 * ─── Projects ─────────────────────────────────────────────────────────────────
 *
 * Horizontal gallery driven by vertical scroll (scroll-hijacking).
 * Each card is one full viewport width.
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
  const { containerRef } = useHorizontalScroll(PROJECTS.length);

  return (
    <SectionWrapper id="projects">
      {/* Slide counter */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {PROJECTS.map((_, i) => (
          <span
            key={i}
            className="block h-1.5 w-6 rounded-full bg-current opacity-30"
          />
        ))}
      </div>

      {/* Horizontal scroll container — overflow is hidden; JS drives scrollLeft */}
      <div
        ref={containerRef}
        className="flex h-screen w-full overflow-hidden"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {PROJECTS.map((project) => (
          <div
            key={project.id}
            style={{ scrollSnapAlign: "start" }}
            className="shrink-0"
          >
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
