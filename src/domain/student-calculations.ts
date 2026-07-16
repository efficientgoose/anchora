import type { ApplicationTask, RiskCounts, RiskLevel, Student } from "./models";
import type { Clock } from "./clock";

const DAY_MS = 86_400_000;

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysFromToday(isoDate: string, clock: Clock) {
  return Math.round((startOfDay(new Date(`${isoDate}T12:00:00`)).getTime() - startOfDay(clock.today()).getTime()) / DAY_MS);
}

export function taskRisk(task: ApplicationTask, clock: Clock): RiskLevel | "done" {
  if (task.status === "done") return "done";
  const days = daysFromToday(task.dueDate, clock);
  if (days < 0) return "overdue";
  if (days <= 7) return "at_risk";
  return "on_track";
}

export function studentRisk(student: Student, clock: Clock): RiskLevel {
  let result: RiskLevel = "on_track";
  for (const task of student.tasks) {
    const risk = taskRisk(task, clock);
    if (risk === "overdue") return "overdue";
    if (risk === "at_risk") result = "at_risk";
  }
  return result;
}

export function nextTask(student: Student) {
  return student.tasks
    .filter((task) => task.status !== "done")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0] ?? null;
}

export function progressFor(student: Student) {
  const done = student.tasks.filter((task) => task.status === "done").length;
  const total = student.tasks.length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function countRisks(students: Student[], clock: Clock): RiskCounts {
  return students.reduce<RiskCounts>((counts, student) => {
    const risk = studentRisk(student, clock);
    if (risk === "at_risk") counts.atRisk += 1;
    else if (risk === "overdue") counts.overdue += 1;
    else counts.onTrack += 1;
    return counts;
  }, { overdue: 0, atRisk: 0, onTrack: 0 });
}

export function relativeDateLabel(isoDate: string, clock: Clock) {
  const days = daysFromToday(isoDate, clock);
  if (days < -1) return `${Math.abs(days)} days overdue`;
  if (days === -1) return "1 day overdue";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `in ${days} days`;
}

export function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${isoDate}T12:00:00`));
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}
