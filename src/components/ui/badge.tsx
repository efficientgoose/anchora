import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex min-h-6 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-4",
  {
    variants: {
      tone: {
        neutral: "border-border-default bg-surface-muted text-status-neutral",
        accent: "border-accent-border bg-accent-soft text-brand-gold-strong",
        info: "border-info-border bg-info-soft text-status-info",
        success: "border-success-border bg-success-soft text-status-success",
        warning: "border-warning-border bg-warning-soft text-status-warning",
        danger: "border-danger-border bg-danger-soft text-status-danger",
      },
      appearance: {
        soft: "",
        outline: "bg-transparent",
        solid: "text-text-inverse",
      },
    },
    compoundVariants: [
      { tone: "neutral", appearance: "solid", className: "border-status-neutral bg-status-neutral" },
      { tone: "accent", appearance: "solid", className: "border-brand-gold-strong bg-brand-gold-strong" },
      { tone: "info", appearance: "solid", className: "border-status-info bg-status-info" },
      { tone: "success", appearance: "solid", className: "border-status-success bg-status-success" },
      { tone: "warning", appearance: "solid", className: "border-status-warning bg-status-warning" },
      { tone: "danger", appearance: "solid", className: "border-status-danger bg-status-danger" },
    ],
    defaultVariants: { tone: "neutral", appearance: "soft" },
  },
);

export interface BadgeProps extends React.ComponentProps<"span">, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, appearance, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, appearance }), className)} {...props} />;
}

export { badgeVariants };
