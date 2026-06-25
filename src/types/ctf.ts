export type CTFDifficulty = "easy" | "medium" | "hard";
export type CTFCategory =
  | "web" | "crypto" | "forensics" | "pwn" | "rev"
  | "osint" | "misc" | "network" | "ai";

export interface CTFWriteup {
  id: string;
  challengeName: string;
  ctfName: string;
  platform: string;
  category: CTFCategory;
  difficulty: CTFDifficulty;
  solveDate: string;
  techniques: string[];
  summary: string;
  writeupUrl?: string;
  flag?: string;
  flagRedacted?: boolean;
}
