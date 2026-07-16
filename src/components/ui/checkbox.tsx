"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root className={cn("flex size-4 items-center justify-center rounded border border-slate-300 bg-white outline-none focus:ring-[3px] focus:ring-brand-gold/30 data-[state=checked]:border-brand-charcoal data-[state=checked]:bg-brand-charcoal", className)} {...props}>
      <CheckboxPrimitive.Indicator><Check className="size-3 text-white" /></CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
