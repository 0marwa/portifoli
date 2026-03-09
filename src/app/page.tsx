import PageShell from "@/components/layout/PageShell";
import AboutMe from "@/components/sections/AboutMe";
import Projects from "@/components/sections/Projects";
import ArtGallery from "@/components/sections/ArtGallery";
import PhotoGallery from "@/components/sections/PhotoGallery";
import Contact from "@/components/sections/Contact";

/**
 * Main page — single scrollable canvas.
 * PageShell (client component) handles:
 *   - Dynamic background per section
 *   - Navbar
 *   - Scroll-to-top button
 */
export default function Home() {
  return (
    <PageShell>
      <AboutMe />
      <Projects />
      <ArtGallery />
      <PhotoGallery />
      <Contact />
    </PageShell>
  );
}
