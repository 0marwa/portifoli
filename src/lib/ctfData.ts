import type { CTFWriteup } from "@/types/ctf";

export const CTF_WRITEUPS: CTFWriteup[] = [
  {
    id: "ctf-001",
    challengeName: "Challenge Name",
    ctfName: "PicoCTF 2025",
    platform: "picoctf.org",
    category: "web",
    difficulty: "easy",
    solveDate: "2025-01-01",
    techniques: ["technique_01", "technique_02"],
    summary: "Placeholder — replace with real writeup summary once CTFs are completed.",
    flagRedacted: true,
    draft: true,
  },
  {
    id: "ctf-002",
    challengeName: "Challenge Name",
    ctfName: "CTFtime Event",
    platform: "ctftime.org",
    category: "crypto",
    difficulty: "medium",
    solveDate: "2025-01-01",
    techniques: ["technique_01", "technique_02"],
    summary: "Placeholder — replace with real writeup summary once CTFs are completed.",
    flagRedacted: true,
    draft: true,
  },
  {
    id: "ctf-003",
    challengeName: "Challenge Name",
    ctfName: "Hack The Box",
    platform: "hackthebox.com",
    category: "pwn",
    difficulty: "medium",
    solveDate: "2025-01-01",
    techniques: ["technique_01", "technique_02"],
    summary: "Placeholder — replace with real writeup summary once CTFs are completed.",
    flagRedacted: true,
    draft: true,
  },
  {
    id: "ctf-004",
    challengeName: "Challenge Name",
    ctfName: "TryHackMe",
    platform: "tryhackme.com",
    category: "network",
    difficulty: "easy",
    solveDate: "2025-01-01",
    techniques: ["technique_01", "technique_02"],
    summary: "Placeholder — replace with real writeup summary once CTFs are completed.",
    flagRedacted: true,
    draft: true,
  },
];

// Non-draft writeups — the only ones clean mode shows.
export const PUBLISHED_WRITEUPS = CTF_WRITEUPS.filter((w) => !w.draft);
