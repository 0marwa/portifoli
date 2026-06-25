import AboutMe from "@/components/sections/AboutMe";
import Projects from "@/components/sections/Projects";
import CTFWriteups from "@/components/sections/CTFWriteups";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <AboutMe />
      <Projects />
      <CTFWriteups />
      <Contact />
    </>
  );
}
