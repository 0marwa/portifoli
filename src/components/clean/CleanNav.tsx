import { PROFILE } from "@/lib/profile";

interface CleanNavProps {
  links: { label: string; href: string }[];
}

// Sticky top bar — plain anchors, native smooth scroll (html.scroll-smooth).
export default function CleanNav({ links }: CleanNavProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0d0d0d]/85 backdrop-blur-md">
      <nav
        aria-label="Main"
        className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6"
      >
        <a href="#me" className="font-acidic text-xl leading-none">
          {PROFILE.firstName.toLowerCase()}
        </a>

        <div className="flex items-center gap-4 text-sm sm:gap-6">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100"
            >
              {link.label}
            </a>
          ))}
          {PROFILE.cvPath && (
            <a
              href={PROFILE.cvPath}
              download
              className="rounded-full border border-[#f0b0c4]/50 px-3 py-1 text-[#f0b0c4] transition-colors hover:bg-[#f0b0c4]/10"
            >
              CV
            </a>
          )}
        </div>
      </nav>
    </header>
  );
}
