import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/cn";

export function EmptyState({ icon: Icon, title, description, action, className }: { icon: LucideIcon; title: string; description?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      <span className="flex size-12 items-center justify-center rounded-full border border-border-default bg-surface-muted text-text-muted"><Icon aria-hidden="true" className="size-6" /></span>
      <h2 className="mt-4 text-base font-semibold leading-6 text-text-primary">{title}</h2>
      {description && <p className="mt-1 max-w-md text-[13px] leading-5 text-text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
