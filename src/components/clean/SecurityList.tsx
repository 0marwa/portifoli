import type { CTFWriteup } from "@/types";

// Compact CTF list. Only rendered when at least one non-draft writeup exists.
export default function SecurityList({ writeups }: { writeups: CTFWriteup[] }) {
  return (
    <ul className="divide-y divide-white/10 rounded-xl border border-white/10 bg-[#0d0d0d]/85 px-5 backdrop-blur-sm">
      {writeups.map((w) => {
        const row = (
          <>
            <div className="min-w-0">
              <p className="font-medium">{w.challengeName}</p>
              <p className="mt-0.5 text-sm opacity-55">
                {w.ctfName} · {w.category} · {w.difficulty}
              </p>
            </div>
            <span className="shrink-0 font-mono text-xs opacity-45">{w.solveDate}</span>
          </>
        );
        const rowClass = "flex items-center justify-between gap-4 py-4";

        return (
          <li key={w.id}>
            {w.writeupUrl ? (
              <a
                href={w.writeupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${rowClass} transition-colors hover:text-[#f0b0c4]`}
              >
                {row}
              </a>
            ) : (
              <div className={rowClass}>{row}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
