import { PROFILE } from "@/lib/profile";
import { MailIcon, GitHubIcon, LinkedInIcon } from "@/components/ui/SocialIcons";

const LINKS = [
  { label: PROFILE.email, href: `mailto:${PROFILE.email}`, Icon: MailIcon, external: false },
  { label: `github.com/${PROFILE.github.handle}`, href: PROFILE.github.url, Icon: GitHubIcon, external: true },
  { label: `linkedin.com/in/${PROFILE.linkedin.handle}`, href: PROFILE.linkedin.url, Icon: LinkedInIcon, external: true },
];

export default function ContactBlock() {
  return (
    <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
      <ul className="flex flex-col gap-4">
        {LINKS.map(({ label, href, Icon, external }) => (
          <li key={href}>
            <a
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group inline-flex items-center gap-3 break-all text-base transition-colors hover:text-[#f0b0c4] sm:text-lg"
            >
              <Icon className="h-5 w-5 shrink-0 opacity-60 transition-opacity group-hover:opacity-100" />
              {label}
            </a>
          </li>
        ))}
      </ul>

      {PROFILE.cvPath && (
        <a
          href={PROFILE.cvPath}
          download
          className="self-start rounded-full bg-[#f0ebe0] px-6 py-2.5 text-sm font-medium text-[#0d0d0d] transition-opacity hover:opacity-85 sm:self-auto"
        >
          Download CV ↓
        </a>
      )}
    </div>
  );
}
