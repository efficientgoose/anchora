import * as React from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("min-w-0 rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,.04)]", className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("border-b border-slate-100 px-6 py-5", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-6", className)} {...props} />;
}
