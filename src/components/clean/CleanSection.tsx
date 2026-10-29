import SectionWrapper from "@/components/ui/SectionWrapper";
import type { SectionId } from "@/types";

interface CleanSectionProps {
  id: SectionId;
  title: string;
  children: React.ReactNode;
}

// Clean-mode section shell: same SectionWrapper as wild mode, readable width.
export default function CleanSection({ id, title, children }: CleanSectionProps) {
  return (
    <SectionWrapper id={id} fullHeight={false}>
      <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 sm:py-32">
        <h2 className="font-acidic text-4xl leading-none sm:text-5xl">{title}</h2>
        <div className="mt-10">{children}</div>
      </div>
    </SectionWrapper>
  );
}
