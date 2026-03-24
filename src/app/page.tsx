import AboutMe from "@/components/sections/AboutMe";
import Projects from "@/components/sections/Projects";
import ArtGallery from "@/components/sections/ArtGallery";
import PhotoGallery from "@/components/sections/PhotoGallery";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <AboutMe />
      <Projects />
      <ArtGallery />
      <PhotoGallery />
      <Contact />
    </>
  );
}
