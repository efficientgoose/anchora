import { cn } from "@/lib/cn";

export function Progress({ value, className, indicatorClassName }: { value: number; className?: string; indicatorClassName?: string }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.max(0, Math.min(100, value))}
      className={cn("h-1.5 overflow-hidden rounded-full bg-slate-100", className)}
    >
      <div className={cn("h-full rounded-full bg-brand-charcoal/65 transition-[width] duration-300", indicatorClassName)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
