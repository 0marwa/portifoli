import Image from "next/image";
import Link from "next/link";
import { PROFILE } from "@/lib/profile";
import { WILD_ROUTE } from "@/lib/routes";

export default function Hero() {
  return (
    <section
      id="me"
      className="mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-5xl scroll-mt-14 flex-col items-center justify-center px-4 py-16 text-center sm:px-6"
    >
      {/* Avatar — the door to wild mode (explosion lands in phase 4) */}
      <div className="relative">
        <Link
          href={WILD_ROUTE}
          aria-label="Enter the digidump — the experimental version of this site"
          className="avatar-trigger group relative block h-44 w-44 rounded-full focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#f0b0c4] sm:h-56 sm:w-56"
        >
          <span
            aria-hidden="true"
            className="absolute -inset-[20%] rounded-full"
            style={{ background: "radial-gradient(circle, #000 25%, transparent 70%)" }}
          />
          <Image
            src="/images/avatar.png"
            alt=""
            fill
            priority
            sizes="(min-width: 640px) 224px, 176px"
            className="avatar-idle object-contain transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105 motion-reduce:transition-none"
            style={{ filter: "invert(1)" }}
          />
        </Link>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-14 -top-1 rotate-12 font-acidic text-xs opacity-45 sm:-right-20"
        >
          don&apos;t click me
        </span>
      </div>

      <h1 className="mt-8 font-acidic text-5xl leading-none sm:text-6xl">{PROFILE.name}</h1>
      <p className="mt-4 text-base opacity-80 sm:text-lg">
        {PROFILE.role} · {PROFILE.location}
      </p>
      <p className="mt-2 max-w-md text-balance text-sm opacity-55">{PROFILE.intro}</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
        <a
          href="#projects"
          className="rounded-full bg-[#f0ebe0] px-5 py-2 font-medium text-[#0d0d0d] transition-opacity hover:opacity-85"
        >
          See projects
        </a>
        {PROFILE.cvPath && (
          <a
            href={PROFILE.cvPath}
            download
            className="rounded-full border border-white/25 px-5 py-2 transition-colors hover:border-white/60"
          >
            Download CV
          </a>
        )}
        <a
          href="#contact"
          className="rounded-full border border-white/25 px-5 py-2 transition-colors hover:border-white/60"
        >
          Contact
        </a>
      </div>
    </section>
  );
}
