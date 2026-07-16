"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown } from "lucide-react";
import { taskStatusVisuals } from "@/components/ui/status-badge";
import type { TaskStatus } from "@/domain/models";
import { cn } from "@/lib/cn";

const order: TaskStatus[] = ["not_started", "in_progress", "blocked", "done"];

export function TaskStatusMenu({ value, onChange, disabled }: { value: TaskStatus; onChange: (value: TaskStatus) => void; disabled?: boolean }) {
  const current = taskStatusVisuals[value];
  const CurrentIcon = current.icon;
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger disabled={disabled} className={cn("inline-flex min-h-8 items-center gap-1.5 rounded-sm border px-2 text-xs font-semibold leading-4 outline-none transition [transition-duration:var(--motion-fast)] focus-visible:ring-[3px] focus-visible:ring-brand-gold/30 disabled:opacity-60", current.softClass, current.textClass, current.borderClass)}>
        <CurrentIcon aria-hidden="true" className="size-3.5" />{current.label}<ChevronDown aria-hidden="true" className="size-3" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={6} collisionPadding={12} className="z-[100] min-w-[172px] rounded-sm border border-border-default bg-surface p-1.5 text-text-secondary shadow-popover">
          {order.map((status) => {
            const visual = taskStatusVisuals[status];
            const Icon = visual.icon;
            return (
              <DropdownMenu.Item key={status} onSelect={() => onChange(status)} className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-2 text-[13px] font-medium outline-none data-[highlighted]:bg-surface-muted data-[highlighted]:text-text-primary">
                <Icon aria-hidden="true" className={cn("size-4", visual.textClass)} />{visual.label}<span className="flex-1" />{value === status && <Check aria-label="Current status" className="size-4 text-brand-ink" />}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
