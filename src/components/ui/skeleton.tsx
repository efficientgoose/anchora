import * as React from "react";
import { cn } from "@/lib/cn";

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-control bg-surface-muted", className)} {...props} />;
}

export function LoadingState({ label = "Loading", children, className }: { label?: string; children: React.ReactNode; className?: string }) {
  return <div role="status" aria-label={label} className={className}><span className="sr-only">{label}</span>{children}</div>;
}
