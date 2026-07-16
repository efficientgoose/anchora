import { cn } from "@/lib/cn";

export function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-soft text-xs font-semibold text-brand-ink", className)} aria-hidden="true">
      {initials}
    </span>
  );
}
