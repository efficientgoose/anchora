"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown } from "lucide-react";
import type { TaskStatus } from "@/domain/models";
import { cn } from "@/lib/cn";
import { statusMeta } from "./risk-ui";

const order: TaskStatus[] = ["not_started", "in_progress", "blocked", "done"];

export function TaskStatusMenu({ value, onChange, disabled }: { value: TaskStatus; onChange: (value: TaskStatus) => void; disabled?: boolean }) {
  const current = statusMeta[value];
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger disabled={disabled} className={cn("inline-flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-[13px] font-medium outline-none transition focus:ring-[3px] focus:ring-indigo-500/10 disabled:opacity-60", current.bg, current.text, current.border)}>
        <span className={cn("size-1.5 rounded-full", current.dot)} />{current.label}<ChevronDown className="size-3" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={5} className="z-[100] min-w-[162px] rounded-[10px] border border-slate-200 bg-white p-1.5 shadow-[0_10px_30px_-8px_rgba(15,23,42,.22)]">
          {order.map((status) => { const meta = statusMeta[status]; return (
            <DropdownMenu.Item key={status} onSelect={() => onChange(status)} className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-slate-700 outline-none data-[highlighted]:bg-slate-100">
              <span className={cn("size-2 rounded-full", meta.dot)} />{meta.label}<span className="flex-1" />{value === status && <Check className="size-3.5 text-indigo-600" />}
            </DropdownMenu.Item>
          ); })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
