import type { LucideIcon } from "lucide-react";
import { AlertCircle, Ban, CheckCircle2, CircleDashed, Clock3, Timer } from "lucide-react";
import type { RiskLevel, TaskStatus } from "@/domain/models";
import { Badge, type BadgeProps } from "@/components/ui/badge";

type StatusTone = NonNullable<BadgeProps["tone"]>;

interface StatusVisual {
  label: string;
  tone: StatusTone;
  icon: LucideIcon;
  textClass: string;
  softClass: string;
  borderClass: string;
  dotClass: string;
}

export const riskVisuals: Record<RiskLevel, StatusVisual> = {
  overdue: { label: "Overdue", tone: "danger", icon: AlertCircle, textClass: "text-status-danger", softClass: "bg-danger-soft", borderClass: "border-danger-border", dotClass: "bg-status-danger" },
  at_risk: { label: "At risk", tone: "warning", icon: Timer, textClass: "text-status-warning", softClass: "bg-warning-soft", borderClass: "border-warning-border", dotClass: "bg-status-warning" },
  on_track: { label: "On track", tone: "success", icon: CheckCircle2, textClass: "text-status-success", softClass: "bg-success-soft", borderClass: "border-success-border", dotClass: "bg-status-success" },
};

export const taskStatusVisuals: Record<TaskStatus, StatusVisual> = {
  not_started: { label: "Not started", tone: "neutral", icon: CircleDashed, textClass: "text-status-neutral", softClass: "bg-surface-muted", borderClass: "border-border-default", dotClass: "bg-status-neutral" },
  in_progress: { label: "In progress", tone: "accent", icon: Clock3, textClass: "text-brand-gold-strong", softClass: "bg-accent-soft", borderClass: "border-accent-border", dotClass: "bg-brand-gold-strong" },
  blocked: { label: "Blocked", tone: "danger", icon: Ban, textClass: "text-status-danger", softClass: "bg-danger-soft", borderClass: "border-danger-border", dotClass: "bg-status-danger" },
  done: { label: "Done", tone: "success", icon: CheckCircle2, textClass: "text-status-success", softClass: "bg-success-soft", borderClass: "border-success-border", dotClass: "bg-status-success" },
};

type StatusBadgeProps = ({ risk: RiskLevel; status?: never } | { status: TaskStatus; risk?: never }) & Omit<BadgeProps, "tone">;

export function StatusBadge({ risk, status, className, ...props }: StatusBadgeProps) {
  const visual = risk ? riskVisuals[risk] : taskStatusVisuals[status as TaskStatus];
  const Icon = visual.icon;
  return <Badge tone={visual.tone} className={className} {...props}><Icon aria-hidden="true" className="size-3.5" />{visual.label}</Badge>;
}
