import type { RiskLevel, TaskStatus } from "@/domain/models";
import { cn } from "@/lib/cn";

export const riskMeta: Record<RiskLevel, { label: string; dot: string; text: string; bg: string; border: string }> = {
  overdue: { label: "Overdue", dot: "bg-red-600", text: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  at_risk: { label: "At Risk", dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  on_track: { label: "On Track", dot: "bg-green-600", text: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
};

export const statusMeta: Record<TaskStatus, { label: string; dot: string; text: string; bg: string; border: string }> = {
  not_started: { label: "Not Started", dot: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" },
  in_progress: { label: "In Progress", dot: "bg-brand-charcoal", text: "text-brand-charcoal", bg: "bg-brand-gold/15", border: "border-brand-gold/40" },
  blocked: { label: "Blocked", dot: "bg-red-600", text: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  done: { label: "Done", dot: "bg-green-600", text: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
};

export function RiskBadge({ risk, className }: { risk: RiskLevel; className?: string }) {
  const meta = riskMeta[risk];
  return <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold", meta.text, meta.bg, meta.border, className)}><span className={cn("size-1.5 rounded-full", meta.dot)} />{meta.label}</span>;
}
