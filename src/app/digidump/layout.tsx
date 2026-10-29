import type { Metadata } from "next";

// Wild mode shares the root shell (particles, navbar) — only the sections differ.
export const metadata: Metadata = {
  title: "Marwa | digidump",
  description: "The stylish, experimental side of Marwa's portfolio.",
};

export default function DigidumpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
