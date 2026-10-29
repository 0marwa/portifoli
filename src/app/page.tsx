import Link from "next/link";
import CleanNav from "@/components/clean/CleanNav";
import Hero from "@/components/clean/Hero";
import CleanSection from "@/components/clean/CleanSection";
import ProjectCard from "@/components/clean/ProjectCard";
import SecurityList from "@/components/clean/SecurityList";
import ContactBlock from "@/components/clean/ContactBlock";
import { PROJECTS } from "@/lib/projects";
import { PROFILE } from "@/lib/profile";
import { CTF_WRITEUPS } from "@/lib/ctfData";
import { WILD_ROUTE } from "@/lib/routes";

// Clean mode — the employer-facing landing page. No particles, no scroll
// hijacking, no wild-mode code. See docs/SPEC.md §4.
export default function Home() {
  const writeups = CTF_WRITEUPS.filter((w) => !w.draft);
  const hasSecurity = writeups.length > 0;

  const navLinks = [
    { label: "projects", href: "#projects" },
    ...(hasSecurity ? [{ label: "security", href: "#security" }] : []),
    { label: "contact", href: "#contact" },
  ];

  let n = 0;
  const nextIndex = () => String(++n).padStart(2, "0");

  return (
    <>
      <a
        href="#projects"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-[#f0ebe0] focus:px-3 focus:py-2 focus:text-[#0d0d0d]"
      >
        Skip to projects
      </a>

      <CleanNav links={navLinks} />

      <main>
        <Hero />

        <CleanSection id="projects" index={nextIndex()} title="projects">
          <div className="grid gap-5 md:grid-cols-2 md:gap-6">
            {PROJECTS.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </CleanSection>

        {hasSecurity && (
          <CleanSection id="security" index={nextIndex()} title="security">
            <SecurityList writeups={writeups} />
          </CleanSection>
        )}

        <CleanSection id="contact" index={nextIndex()} title="contact">
          <ContactBlock />
        </CleanSection>
      </main>

      <footer className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 border-t border-white/10 px-4 py-8 text-sm opacity-60 sm:px-6">
        <p>© {new Date().getFullYear()} {PROFILE.name}</p>
        <Link href={WILD_ROUTE} className="transition-colors hover:text-[#f0b0c4]">
          ✦ digidump
        </Link>
      </footer>
    </>
  );
}
