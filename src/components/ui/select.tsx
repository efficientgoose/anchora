"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SelectOption { value: string; label: string; shortLabel?: string }

export function Select({ value, onValueChange, options, placeholder, className, ariaLabel }: {
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  ariaLabel: string;
}) {
  const selected = options.find((option) => option.value === value);
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger aria-label={ariaLabel} className={cn("flex h-[38px] min-w-0 w-full items-center justify-between gap-2 overflow-hidden rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-brand-charcoal focus:ring-[3px] focus:ring-brand-gold/25 data-[placeholder]:text-slate-400", className)}>
        <span className="min-w-0 flex-1 truncate text-left">
          {selected ? <><span className={selected.shortLabel ? "hidden sm:inline" : undefined}>{selected.label}</span>{selected.shortLabel && <span className="sm:hidden">{selected.shortLabel}</span>}</> : placeholder}
        </span>
        <SelectPrimitive.Icon><ChevronDown className="size-3.5 text-slate-400" /></SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content position="popper" sideOffset={5} className="z-[100] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-[10px] border border-slate-200 bg-white p-1.5 shadow-[0_10px_30px_-8px_rgba(15,23,42,.2)]">
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item key={option.value} value={option.value} className="relative flex h-8 cursor-pointer select-none items-center rounded-md px-2.5 pr-8 text-[13px] text-slate-700 outline-none data-[highlighted]:bg-slate-100">
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2"><Check className="size-3.5 text-brand-charcoal" /></SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
