import * as React from "react";
import { cn } from "@/lib/cn";

export function PageHeader({ title, description, eyebrow, action, className }: { title: string; description?: React.ReactNode; eyebrow?: string; action?: React.ReactNode; className?: string }) {
  return (
    <header className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && <div className="type-micro mb-1.5 text-brand-gold-strong">{eyebrow}</div>}
        <h1 className="type-page-title text-text-primary">{title}</h1>
        {description && <div className="mt-1 text-sm leading-[22px] text-text-muted">{description}</div>}
      </div>
      {action && <div className="ml-auto shrink-0">{action}</div>}
    </header>
  );
}
