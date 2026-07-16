"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn("flex size-5 shrink-0 items-center justify-center rounded-sm border border-border-strong bg-surface text-text-inverse outline-none transition [transition-duration:var(--motion-fast)] hover:border-brand-ink focus-visible:ring-[3px] focus-visible:ring-brand-gold/30 data-[state=checked]:border-brand-ink data-[state=checked]:bg-brand-ink disabled:opacity-50", className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator><Check className="size-3.5" /></CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
