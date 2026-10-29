"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLink } from "@/types";
import { PUBLISHED_WRITEUPS } from "@/lib/ctfData";
import { WILD_ROUTE } from "@/lib/routes";

const NAV_LINKS: NavLink[] = [
  { label: "Me", href: "about" },
  { label: "Projects", href: "projects" },
  { label: "CTF", href: "ctf" },
  { label: "Contact", href: "contact" },
];

/**
 * Fixed top-right navbar.
 * Links use smooth-scroll via native CSS scroll-behavior on <html>.
 * Replace the font className with your chosen grungy font once added.
 */
export default function Navbar() {
  const isWild = usePathname() === WILD_ROUTE;
  // Clean mode hides CTF until a real (non-draft) writeup exists
  const links = isWild || PUBLISHED_WRITEUPS.length > 0
    ? NAV_LINKS
    : NAV_LINKS.filter((link) => link.href !== "ctf");

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    const el = document.getElementById(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 right-0 z-50 flex items-center gap-4 whitespace-nowrap px-4 py-5 sm:gap-6 sm:px-8">
      {links.map((link) => (
        <a
          key={link.href}
          href={`#${link.href}`}
          onClick={(e) => handleClick(e, link.href)}
          style={{ fontFamily: "var(--font-acidic), sans-serif" }}
          className="text-sm uppercase tracking-widest text-current opacity-80 transition-opacity hover:opacity-100"
        >
          {link.label}
        </a>
      ))}
      {!isWild && (
        <Link
          href={WILD_ROUTE}
          aria-label="digidump"
          style={{ fontFamily: "var(--font-acidic), sans-serif" }}
          className="text-sm uppercase tracking-widest text-[#f0b0c4] opacity-80 transition-opacity hover:opacity-100"
        >
          ✦<span className="hidden sm:inline"> digidump</span>
        </Link>
      )}
    </nav>
  );
}
