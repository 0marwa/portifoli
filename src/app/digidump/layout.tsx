import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";

// Wild mode — particles, navbar, scroll-to-top. Only this route loads them.
export const metadata: Metadata = {
  title: "Marwa | digidump",
  description: "The stylish, experimental side of Marwa's portfolio.",
};

export default function DigidumpLayout({ children }: { children: React.ReactNode }) {
  return <PageShell>{children}</PageShell>;
}
