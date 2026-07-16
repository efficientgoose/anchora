import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const cardVariants = cva("min-w-0 rounded-card border shadow-subtle", {
  variants: {
    tone: {
      surface: "border-border-default bg-surface text-text-primary",
      subtle: "border-border-subtle bg-surface-muted text-text-primary",
      inverse: "border-brand-ink bg-surface-inverse text-text-inverse",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-5 sm:p-6",
      lg: "p-6 sm:p-8",
    },
  },
  defaultVariants: { tone: "surface", padding: "none" },
});

export interface CardProps extends React.ComponentProps<"div">, VariantProps<typeof cardVariants> {}

export function Card({ className, tone, padding, ...props }: CardProps) {
  return <div className={cn(cardVariants({ tone, padding }), className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("border-b border-border-subtle px-5 py-4 sm:px-6 sm:py-5", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-5 sm:p-6", className)} {...props} />;
}

export { cardVariants };
