"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const selectTriggerVariants = cva(
  "flex min-w-0 w-full items-center justify-between gap-2 overflow-hidden rounded-control border border-border-default bg-surface text-text-secondary outline-none transition [transition-duration:var(--motion-fast)] hover:border-border-strong focus:border-brand-ink focus:ring-[3px] focus:ring-brand-gold/25 aria-invalid:border-status-danger aria-invalid:ring-danger-border data-[placeholder]:text-text-muted disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted",
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

export interface SelectOption { value: string; label: string; shortLabel?: string }

export interface SelectProps extends VariantProps<typeof selectTriggerVariants> {
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  ariaLabel: string;
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  disabled?: boolean;
}

export function Select({ value, onValueChange, options, placeholder, className, ariaLabel, size, id, disabled, ...ariaProps }: SelectProps) {
  const selected = options.find((option) => option.value === value);
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger id={id} aria-label={ariaLabel} className={cn(selectTriggerVariants({ size }), className)} {...ariaProps}>
        <span className="min-w-0 flex-1 truncate text-left">
          {selected ? <><span className={selected.shortLabel ? "hidden sm:inline" : undefined}>{selected.label}</span>{selected.shortLabel && <span className="sm:hidden">{selected.shortLabel}</span>}</> : placeholder}
        </span>
        <SelectPrimitive.Icon><ChevronDown className="size-4 text-text-muted" /></SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content position="popper" sideOffset={6} collisionPadding={12} className="z-[100] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-sm border border-border-default bg-surface p-1.5 text-text-secondary shadow-popover">
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item key={option.value} value={option.value} className="relative flex min-h-8 cursor-pointer select-none items-center rounded-sm px-2.5 pr-8 text-[13px] leading-5 outline-none data-[highlighted]:bg-surface-muted data-[highlighted]:text-text-primary">
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2"><Check className="size-4 text-brand-ink" /></SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export { selectTriggerVariants };
