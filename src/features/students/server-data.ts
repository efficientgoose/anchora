import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type {
  JourneyStage,
  JourneyTask,
  LegalAccess,
  StaffRole,
  StudentAssignee,
  StudentDataOverview,
  StudentIntakeGroup,
  StudentRecord,
  StudentSummary,
  StudentWorkspace,
} from "@/domain/models";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveWorkspaceContext, type WorkspaceContext } from "@/lib/workspace/context";

export const STUDENT_LEGAL_DOCUMENT_VERSION = "2026-07-student-data-v1";

export interface StudentDataLaunchStatus {
  enabled: boolean;
  reason: "enabled" | "disabled";
}

export function getStudentDataLaunchStatus(): StudentDataLaunchStatus {
  return {
    enabled: process.env.REAL_STUDENT_DATA_ENABLED === "true",
    reason: process.env.REAL_STUDENT_DATA_ENABLED === "true" ? "enabled" : "disabled",
  };
}

export const REAL_STUDENT_DATA_ENABLED = getStudentDataLaunchStatus().enabled;

export type StudentDataLoadResult<T> =
  | { status: "ready"; data: T; context: WorkspaceContext }
  | { status: "disabled" }
  | { status: "unauthenticated" }
  | { status: "unassigned" }
  | { status: "legal_required"; legalAccess: LegalAccess; context: WorkspaceContext }
  | { status: "not_found"; context?: WorkspaceContext }
  | { status: "error"; code: string };

const uuidSchema = z.string().uuid();
const timestampSchema = z.string().datetime({ offset: true });
const dateSchema = z.string().date();
const staffRoleSchema = z.enum(["owner", "admin", "member", "consultant"]).transform<StaffRole>((role) => role === "consultant" ? "member" : role);
const studentRowSchema = z.object({
  id: uuidSchema,
  organization_id: uuidSchema,
  full_name: z.string().trim().min(2).max(160),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().min(7).max(32).nullable(),
  intake_season: z.enum(["summer", "winter"]),
  intake_year: z.number().int().min(2020).max(2100),
  residence_country_code: z.literal("IN"),
  destination_country_code: z.literal("DE"),
  adult_confirmed: z.boolean(),
  permission_confirmed: z.boolean(),
  journey_template_version: z.number().int().positive(),
  assigned_consultant_id: uuidSchema,
  lifecycle_status: z.enum(["active", "archived"]),
  created_by: uuidSchema,
  created_at: timestampSchema,
  updated_at: timestampSchema,
  archived_at: timestampSchema.nullable(),
  archived_by: uuidSchema.nullable(),
});
const studentSummaryRowSchema = z.object({
  id: uuidSchema,
  full_name: z.string().trim().min(2).max(160),
  email: z.string().trim().toLowerCase().email(),
  intake_season: z.enum(["summer", "winter"]),
  intake_year: z.number().int().min(2020).max(2100),
  assigned_consultant_id: uuidSchema,
  lifecycle_status: z.enum(["active", "archived"]),
  created_at: timestampSchema,
});
const stageRowSchema = z.object({
  id: uuidSchema,
  student_id: uuidSchema,
  stage_key: z.enum(["onboarded", "prepared_eligibility_aps", "prepared_tests_documents", "applied", "cleared", "enrolled"]),
  title: z.string().trim().min(2).max(100),
  display_order: z.number().int().min(1).max(6),
  created_at: timestampSchema,
});
const taskRowSchema = z.object({
  id: uuidSchema,
  stage_id: uuidSchema,
  task_key: z.string().regex(/^[a-z][a-z0-9_]{2,80}$/),
  title: z.string().trim().min(2).max(140),
  display_order: z.number().int().min(1).max(20),
  status: z.enum(["not_started", "in_progress", "blocked", "completed"]),
  planning_target_date: dateSchema,
  template_target_date: dateSchema,
  target_is_template: z.boolean(),
  started_at: timestampSchema.nullable(),
  completed_at: timestampSchema.nullable(),
  updated_at: timestampSchema,
});
const assigneeRowSchema = z.object({
  user_id: uuidSchema,
  full_name: z.string().trim().min(1),
  role: staffRoleSchema,
});
const legalAcceptanceRowSchema = z.object({
  document_kind: z.enum(["terms", "privacy"]),
  document_version: z.string().trim().min(1).max(100),
  accepted_at: timestampSchema,
});
const dpaAcceptanceRowSchema = z.object({
  document_version: z.string().trim().min(1).max(100),
  accepted_at: timestampSchema,
});

function studentFromRow(row: z.infer<typeof studentRowSchema>): StudentRecord {
  return {
    id: row.id,
    organizationId: row.organization_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    intakeSeason: row.intake_season,
    intakeYear: row.intake_year,
    residenceCountryCode: row.residence_country_code,
    destinationCountryCode: row.destination_country_code,
    adultConfirmed: row.adult_confirmed,
    permissionConfirmed: row.permission_confirmed,
    journeyTemplateVersion: row.journey_template_version,
    assignedConsultantId: row.assigned_consultant_id,
    lifecycleStatus: row.lifecycle_status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
    archivedBy: row.archived_by,
  };
}

function summaryFromRow(row: z.infer<typeof studentSummaryRowSchema>): StudentSummary {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    intakeSeason: row.intake_season,
    intakeYear: row.intake_year,
    assignedConsultantId: row.assigned_consultant_id,
    lifecycleStatus: row.lifecycle_status,
    createdAt: row.created_at,
  };
}

function stageFromRow(row: z.infer<typeof stageRowSchema>): JourneyStage {
  return { id: row.id, studentId: row.student_id, stageKey: row.stage_key, title: row.title, displayOrder: row.display_order, createdAt: row.created_at };
}

function taskFromRow(row: z.infer<typeof taskRowSchema>): JourneyTask {
  return {
    id: row.id,
    stageId: row.stage_id,
    taskKey: row.task_key,
    title: row.title,
    displayOrder: row.display_order,
    status: row.status,
    planningTargetDate: row.planning_target_date,
    templateTargetDate: row.template_target_date,
    targetIsTemplate: row.target_is_template,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    updatedAt: row.updated_at,
  };
}

function assigneeFromRow(row: z.infer<typeof assigneeRowSchema>): StudentAssignee {
  return { id: row.user_id, fullName: row.full_name, role: row.role };
}

async function authenticatedWorkspace(): Promise<
  | { status: "ready"; supabase: SupabaseClient; context: WorkspaceContext }
  | { status: "disabled" | "unauthenticated" | "unassigned" | "error"; code?: string }
> {
  if (!REAL_STUDENT_DATA_ENABLED) return { status: "disabled" };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "disabled" };
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { status: "unauthenticated" };
  const workspace = await resolveWorkspaceContext(supabase, data.user);
  if (workspace.status === "ready") return { status: "ready", supabase, context: workspace.context };
  if (workspace.status === "unassigned") return { status: "unassigned" };
  return { status: "error", code: workspace.code };
}

function resultFromContext<T>(result: Exclude<Awaited<ReturnType<typeof authenticatedWorkspace>>, { status: "ready" }>): StudentDataLoadResult<T> {
  if (result.status === "error") return { status: "error", code: result.code ?? "workspace_lookup_failed" };
  return { status: result.status };
}

async function legalAccessFor(supabase: SupabaseClient, context: WorkspaceContext): Promise<{ legalAccess: LegalAccess } | { error: string }> {
  const [individualResult, dpaResult] = await Promise.all([
    supabase.from("legal_acceptances").select("document_kind, document_version, accepted_at").eq("document_version", STUDENT_LEGAL_DOCUMENT_VERSION),
    supabase.from("organization_dpa_acceptances").select("document_version, accepted_at").eq("organization_id", context.organization.id).eq("document_version", STUDENT_LEGAL_DOCUMENT_VERSION).maybeSingle(),
  ]);
  if (individualResult.error || dpaResult.error) return { error: "legal_access_lookup_failed" };
  const individual = z.array(legalAcceptanceRowSchema).safeParse(individualResult.data ?? []);
  const dpa = z.union([dpaAcceptanceRowSchema, z.null()]).safeParse(dpaResult.data);
  if (!individual.success || !dpa.success) return { error: "invalid_legal_access_payload" };

  const acceptance = new Map(individual.data.map((item) => [item.document_kind, item]));
  const terms = acceptance.get("terms");
  const privacy = acceptance.get("privacy");
  const organizationDpaAccepted = dpa.data !== null;
  const individualAccepted = Boolean(terms && privacy);
  const ownerActionRequired = !organizationDpaAccepted && context.membership.role !== "owner";
  return {
    legalAccess: {
      documentVersion: STUDENT_LEGAL_DOCUMENT_VERSION,
      terms: { kind: "terms", version: STUDENT_LEGAL_DOCUMENT_VERSION, accepted: Boolean(terms), acceptedAt: terms?.accepted_at ?? null },
      privacy: { kind: "privacy", version: STUDENT_LEGAL_DOCUMENT_VERSION, accepted: Boolean(privacy), acceptedAt: privacy?.accepted_at ?? null },
      organizationDpaAccepted,
      organizationDpaAcceptedAt: dpa.data?.accepted_at ?? null,
      role: context.membership.role,
      ownerActionRequired,
      studentDataAccessible: individualAccepted && organizationDpaAccepted,
    },
  };
}

export async function loadLegalAccess(): Promise<StudentDataLoadResult<LegalAccess>> {
  const workspace = await authenticatedWorkspace();
  if (workspace.status !== "ready") return resultFromContext(workspace);
  const result = await legalAccessFor(workspace.supabase, workspace.context);
  if ("error" in result) return { status: "error", code: result.error };
  return { status: "ready", data: result.legalAccess, context: workspace.context };
}

async function studentDataWorkspace<T>(load: (supabase: SupabaseClient, context: WorkspaceContext) => Promise<{ data: T } | { status: "not_found" } | { error: string }>): Promise<StudentDataLoadResult<T>> {
  const workspace = await authenticatedWorkspace();
  if (workspace.status !== "ready") return resultFromContext(workspace);
  const legal = await legalAccessFor(workspace.supabase, workspace.context);
  if ("error" in legal) return { status: "error", code: legal.error };
  if (!legal.legalAccess.studentDataAccessible) return { status: "legal_required", legalAccess: legal.legalAccess, context: workspace.context };
  const result = await load(workspace.supabase, workspace.context);
  if ("error" in result) return { status: "error", code: result.error };
  if ("status" in result) return { status: "not_found", context: workspace.context };
  return { status: "ready", data: result.data, context: workspace.context };
}

async function loadAssignees(supabase: SupabaseClient): Promise<{ data: StudentAssignee[] } | { error: string }> {
  const { data, error } = await supabase.rpc("get_student_assignees");
  if (error) return { error: "assignees_lookup_failed" };
  const parsed = z.array(assigneeRowSchema).safeParse(data);
  if (!parsed.success) return { error: "invalid_assignees_payload" };
  return { data: parsed.data.map(assigneeFromRow) };
}

export async function loadStudents(): Promise<StudentDataLoadResult<StudentSummary[]>> {
  return studentDataWorkspace<StudentSummary[]>(async (supabase, context) => {
    const { data, error } = await supabase.from("students").select("id, full_name, email, intake_season, intake_year, assigned_consultant_id, lifecycle_status, created_at").eq("organization_id", context.organization.id).order("created_at", { ascending: false });
    if (error) return { error: "students_lookup_failed" };
    const parsed = z.array(studentSummaryRowSchema).safeParse(data ?? []);
    if (!parsed.success) return { error: "invalid_students_payload" };
    return { data: parsed.data.map(summaryFromRow) };
  });
}

export async function loadStudentOverview(): Promise<StudentDataLoadResult<StudentDataOverview>> {
  return studentDataWorkspace<StudentDataOverview>(async (supabase, context) => {
    const [totalResult, activeResult, archivedResult] = await Promise.all([
      supabase.from("students").select("id", { count: "exact", head: true }).eq("organization_id", context.organization.id),
      supabase.from("students").select("id", { count: "exact", head: true }).eq("organization_id", context.organization.id).eq("lifecycle_status", "active"),
      supabase.from("students").select("id", { count: "exact", head: true }).eq("organization_id", context.organization.id).eq("lifecycle_status", "archived"),
    ]);
    if (totalResult.error || activeResult.error || archivedResult.error) return { error: "student_overview_lookup_failed" };
    const counts = z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative(), z.number().int().nonnegative()]).safeParse([totalResult.count, activeResult.count, archivedResult.count]);
    if (!counts.success) return { error: "invalid_student_overview_payload" };
    return { data: { total: counts.data[0], active: counts.data[1], archived: counts.data[2] } };
  });
}

export async function loadStudentWorkspace(studentId: string): Promise<StudentDataLoadResult<StudentWorkspace>> {
  const parsedId = uuidSchema.safeParse(studentId);
  if (!parsedId.success) return { status: "not_found" };
  return studentDataWorkspace<StudentWorkspace>(async (supabase, context) => {
    const studentResult = await supabase.from("students").select("id, organization_id, full_name, email, phone, intake_season, intake_year, residence_country_code, destination_country_code, adult_confirmed, permission_confirmed, journey_template_version, assigned_consultant_id, lifecycle_status, created_by, created_at, updated_at, archived_at, archived_by").eq("id", parsedId.data).eq("organization_id", context.organization.id).maybeSingle();
    if (studentResult.error) return { error: "student_lookup_failed" };
    const parsedStudent = z.union([studentRowSchema, z.null()]).safeParse(studentResult.data);
    if (!parsedStudent.success) return { error: "invalid_student_payload" };
    if (!parsedStudent.data) return { status: "not_found" as const };

    const stagesResult = await supabase.from("journey_stages").select("id, student_id, stage_key, title, display_order, created_at").eq("student_id", parsedStudent.data.id).order("display_order");
    if (stagesResult.error) return { error: "journey_stages_lookup_failed" };
    const parsedStages = z.array(stageRowSchema).safeParse(stagesResult.data ?? []);
    if (!parsedStages.success) return { error: "invalid_journey_stages_payload" };
    const stages = parsedStages.data.map(stageFromRow);

    const tasksResult = stages.length === 0 ? { data: [], error: null } : await supabase.from("journey_tasks").select("id, stage_id, task_key, title, display_order, status, planning_target_date, template_target_date, target_is_template, started_at, completed_at, updated_at").in("stage_id", stages.map((stage) => stage.id)).order("display_order");
    if (tasksResult.error) return { error: "journey_tasks_lookup_failed" };
    const parsedTasks = z.array(taskRowSchema).safeParse(tasksResult.data ?? []);
    if (!parsedTasks.success) return { error: "invalid_journey_tasks_payload" };
    const assignees = await loadAssignees(supabase);
    if ("error" in assignees) return assignees;
    const tasks = parsedTasks.data.map(taskFromRow);
    return { data: { student: studentFromRow(parsedStudent.data), stages: stages.map((stage) => ({ ...stage, tasks: tasks.filter((task) => task.stageId === stage.id) })), assignees: assignees.data } };
  });
}

export async function loadIntakeGroups(): Promise<StudentDataLoadResult<StudentIntakeGroup[]>> {
  const students = await loadStudents();
  if (students.status !== "ready") return students;
  const groups = new Map<string, StudentIntakeGroup>();
  for (const student of students.data) {
    const key = `${student.intakeYear}:${student.intakeSeason}`;
    const existing = groups.get(key) ?? { intakeYear: student.intakeYear, intakeSeason: student.intakeSeason, students: [] };
    existing.students.push(student);
    groups.set(key, existing);
  }
  return { status: "ready", context: students.context, data: [...groups.values()].sort((left, right) => left.intakeYear - right.intakeYear || left.intakeSeason.localeCompare(right.intakeSeason)) };
}
