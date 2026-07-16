"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root className={cn("flex size-4 items-center justify-center rounded border border-slate-300 bg-white outline-none focus:ring-[3px] focus:ring-indigo-500/15 data-[state=checked]:border-indigo-600 data-[state=checked]:bg-indigo-600", className)} {...props}>
      <CheckboxPrimitive.Indicator><Check className="size-3 text-white" /></CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
