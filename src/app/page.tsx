import AboutMe from "@/components/sections/AboutMe";
import Contact from "@/components/sections/Contact";
import CleanSection from "@/components/clean/CleanSection";
import ProjectCard from "@/components/clean/ProjectCard";
import SecurityList from "@/components/clean/SecurityList";
import { PROJECTS } from "@/lib/projects";
import { PUBLISHED_WRITEUPS } from "@/lib/ctfData";
import { WILD_ROUTE } from "@/lib/routes";

// Clean mode — same site as /digidump except Projects and CTF, which are
// swapped for readable versions. See docs/SPEC.md.
export default function Home() {
  return (
    <>
      <AboutMe avatarHref={WILD_ROUTE} />

      <CleanSection id="projects" title="projects">
        <div className="grid gap-5 md:grid-cols-2 md:gap-6">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </CleanSection>

      {PUBLISHED_WRITEUPS.length > 0 && (
        <CleanSection id="ctf" title="ctf">
          <SecurityList writeups={PUBLISHED_WRITEUPS} />
        </CleanSection>
      )}

      <Contact />
    </>
  );
}
