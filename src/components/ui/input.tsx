import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const inputVariants = cva(
  "w-full rounded-control border border-border-default bg-surface text-text-primary outline-none transition placeholder:text-text-muted [transition-duration:var(--motion-fast)] hover:border-border-strong focus:border-brand-ink focus:ring-[3px] focus:ring-brand-gold/25 aria-invalid:border-status-danger aria-invalid:ring-danger-border disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted",
  {
    variants: {
      size: {
        sm: "h-8 px-2.5 text-[13px] leading-5",
        md: "h-10 px-3 text-sm leading-[22px]",
        lg: "h-12 px-3.5 text-base leading-[26px]",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface InputProps extends Omit<React.ComponentProps<"input">, "size">, VariantProps<typeof inputVariants> {}

export function Input({ className, type, size, ...props }: InputProps) {
  return <input type={type} className={cn(inputVariants({ size }), className)} {...props} />;
}

export { inputVariants };
