import type { Project } from "@/types";

export default function ProjectCard({ project }: { project: Project }) {
  const meta = [project.context, project.role].filter(Boolean).join(" · ");

  return (
    <article className="flex flex-col rounded-xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-[#f0b0c4]/40 sm:p-6">
      <header>
        <h3 className="text-xl font-semibold tracking-tight">{project.title}</h3>
        <p className="mt-1 text-sm text-[#f0b0c4]/90">{project.pitch}</p>
        {meta && <p className="mt-3 text-xs uppercase tracking-wider opacity-50">{meta}</p>}
      </header>

      {project.outcome && (
        <p className="mt-4 self-start rounded-full border border-[#f0b0c4]/35 px-3 py-1 text-xs text-[#f0b0c4]">
          ★ {project.outcome}
        </p>
      )}

      <p className="mt-4 text-sm leading-relaxed opacity-80">{project.description}</p>

      <ul aria-label="Tech stack" className="mt-5 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <li key={tag} className="rounded-md bg-white/[0.06] px-2 py-0.5 text-xs opacity-80">
            {tag}
          </li>
        ))}
      </ul>

      {project.links.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-4 pt-6 text-sm">
          {project.links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-[#f0b0c4] hover:text-[#f0b0c4]"
            >
              {link.label} ↗
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
