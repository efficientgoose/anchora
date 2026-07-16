import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const progressIndicatorVariants = cva("h-full rounded-full transition-[width] [transition-duration:var(--motion-standard)]", {
  variants: {
    tone: {
      neutral: "bg-text-secondary",
      accent: "bg-brand-gold",
      success: "bg-status-success",
      warning: "bg-status-warning",
      danger: "bg-status-danger",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export interface ProgressProps extends VariantProps<typeof progressIndicatorVariants> {
  value: number;
  label?: string;
  className?: string;
  indicatorClassName?: string;
}

export function Progress({ value, label, tone, className, indicatorClassName }: ProgressProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clampedValue}
      className={cn("h-1.5 overflow-hidden rounded-full bg-surface-muted", className)}
    >
      <div className={cn(progressIndicatorVariants({ tone }), indicatorClassName)} style={{ width: `${clampedValue}%` }} />
    </div>
  );
}

export { progressIndicatorVariants };
