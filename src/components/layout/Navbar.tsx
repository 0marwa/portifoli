"use client";

import Link from "next/link";
import type { NavLink } from "@/types";

const NAV_LINKS: NavLink[] = [
  { label: "About", href: "about" },
  { label: "Projects", href: "projects" },
  { label: "Art", href: "art" },
  { label: "Photos", href: "photos" },
  { label: "Contact", href: "contact" },
];

/**
 * Fixed top-right navbar.
 * Links use smooth-scroll via native CSS scroll-behavior on <html>.
 * Replace the font className with your chosen grungy font once added.
 */
export default function Navbar() {
  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    const el = document.getElementById(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 right-0 z-50 flex items-center gap-6 px-8 py-5">
      {NAV_LINKS.map((link) => (
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
    </nav>
  );
}
