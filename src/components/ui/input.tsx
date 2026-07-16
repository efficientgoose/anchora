import * as React from "react";
import { cn } from "@/lib/cn";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-[38px] w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-brand-charcoal outline-none transition placeholder:text-slate-400 focus:border-brand-charcoal focus:ring-[3px] focus:ring-brand-gold/25 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
        className,
      )}
      {...props}
    />
  );
}
