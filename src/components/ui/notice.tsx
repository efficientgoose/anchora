import * as React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const noticeVariants = cva("flex items-start gap-3 rounded-card border p-4 text-sm leading-[22px]", {
  variants: {
    tone: {
      info: "border-info-border bg-info-soft text-status-info",
      success: "border-success-border bg-success-soft text-status-success",
      warning: "border-warning-border bg-warning-soft text-status-warning",
      danger: "border-danger-border bg-danger-soft text-status-danger",
    },
  },
  defaultVariants: { tone: "info" },
});

const icons = { info: Info, success: CheckCircle2, warning: AlertTriangle, danger: AlertCircle };

export interface NoticeProps extends React.ComponentProps<"div">, VariantProps<typeof noticeVariants> {
  title?: string;
}

export function Notice({ tone = "info", title, className, children, role, ...props }: NoticeProps) {
  const Icon = icons[tone ?? "info"];
  return (
    <div role={role ?? (tone === "danger" ? "alert" : "status")} className={cn(noticeVariants({ tone }), className)} {...props}>
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">{title && <div className="font-semibold text-current">{title}</div>}<div className={cn(title && "mt-0.5")}>{children}</div></div>
    </div>
  );
}

export { noticeVariants };
