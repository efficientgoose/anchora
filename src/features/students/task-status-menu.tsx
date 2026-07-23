"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Ban, Check, CheckCircle2, ChevronDown, CircleDashed, Clock3 } from "lucide-react";
import type { JourneyTaskStatus } from "@/domain/models";
import { cn } from "@/lib/cn";

const order: JourneyTaskStatus[] = ["not_started", "in_progress", "blocked", "completed"];

const taskStatusVisuals = {
  not_started: { label: "Not started", icon: CircleDashed, textClass: "text-status-neutral", softClass: "bg-surface-muted", borderClass: "border-border-default" },
  in_progress: { label: "In progress", icon: Clock3, textClass: "text-brand-gold-strong", softClass: "bg-accent-soft", borderClass: "border-accent-border" },
  blocked: { label: "Blocked", icon: Ban, textClass: "text-status-danger", softClass: "bg-danger-soft", borderClass: "border-danger-border" },
  completed: { label: "Completed", icon: CheckCircle2, textClass: "text-status-success", softClass: "bg-success-soft", borderClass: "border-success-border" },
} satisfies Record<JourneyTaskStatus, { label: string; icon: typeof CircleDashed; textClass: string; softClass: string; borderClass: string }>;

export function TaskStatusMenu({ value, onChange, taskTitle, disabled }: { value: JourneyTaskStatus; onChange: (value: JourneyTaskStatus) => void; taskTitle: string; disabled?: boolean }) {
  const current = taskStatusVisuals[value];
  const CurrentIcon = current.icon;
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger aria-label={`Status for ${taskTitle}: ${current.label}`} disabled={disabled} className={cn("inline-flex min-h-8 items-center gap-1.5 rounded-sm border px-2 text-xs font-semibold leading-4 outline-none transition [transition-duration:var(--motion-fast)] focus-visible:ring-[3px] focus-visible:ring-brand-gold/30 disabled:opacity-60", current.softClass, current.textClass, current.borderClass)}>
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
