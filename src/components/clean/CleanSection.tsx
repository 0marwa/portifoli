interface CleanSectionProps {
  id: string;
  index: string; // "01", "02"… — small mono number above the title
  title: string;
  children: React.ReactNode;
}

// Shared clean-mode section shell: anchored id, Acidic title, constrained width.
export default function CleanSection({ id, index, title, children }: CleanSectionProps) {
  return (
    <section id={id} className="mx-auto max-w-5xl scroll-mt-14 px-4 py-20 sm:px-6 sm:py-24">
      <p aria-hidden="true" className="font-mono text-xs tracking-widest opacity-40">
        {index}
      </p>
      <h2 className="mt-2 font-acidic text-4xl leading-none sm:text-5xl">{title}</h2>
      <div className="mt-10">{children}</div>
    </section>
  );
}
