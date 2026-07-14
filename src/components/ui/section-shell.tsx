import type { ReactNode } from "react";

type SectionShellProps = {
  children: ReactNode;
  className?: string;
};

export function SectionShell({ children, className = "" }: SectionShellProps) {
  return (
    <section className={`container mx-auto px-6 py-16 ${className}`}>
      {children}
    </section>
  );
}
