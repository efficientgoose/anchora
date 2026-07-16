import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border text-sm font-medium transition-colors duration-200 outline-none focus-visible:ring-[3px] focus-visible:ring-indigo-500/15 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4",
  {
    variants: {
      variant: {
        default: "border-indigo-600 bg-indigo-600 text-white shadow-[0_1px_2px_rgba(15,23,42,.08)] hover:border-indigo-700 hover:bg-indigo-700",
        secondary: "border-slate-200 bg-white text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,.04)] hover:border-slate-300 hover:bg-slate-50",
        ghost: "border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        outline: "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700",
        danger: "border-red-600 bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        default: "h-[38px] px-4",
        sm: "h-8 rounded-md px-3 text-[13px]",
        lg: "h-[46px] rounded-[10px] px-[22px] text-[15px]",
        icon: "size-[38px] px-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
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
