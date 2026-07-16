import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-control border font-medium outline-none transition-colors [transition-duration:var(--motion-fast)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-gold/35 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "border-brand-ink bg-brand-ink text-text-inverse shadow-subtle hover:border-text-secondary hover:bg-text-secondary",
        secondary: "border-border-default bg-surface text-text-secondary shadow-subtle hover:border-border-strong hover:bg-surface-muted hover:text-text-primary",
        outline: "border-border-strong bg-transparent text-text-primary hover:border-brand-ink hover:bg-accent-soft",
        ghost: "border-transparent bg-transparent text-text-secondary hover:bg-surface-muted hover:text-text-primary",
        destructive: "border-status-danger bg-status-danger text-text-inverse shadow-subtle hover:border-brand-red hover:bg-brand-red",
      },
      size: {
        sm: "h-8 px-3 text-[13px] leading-5 [&_svg]:size-4",
        md: "h-10 px-4 text-sm leading-[22px] [&_svg]:size-4",
        lg: "h-12 px-5 text-[15px] leading-6 [&_svg]:size-[18px]",
        "icon-sm": "size-8 px-0 [&_svg]:size-4",
        "icon-md": "size-10 px-0 [&_svg]:size-5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
