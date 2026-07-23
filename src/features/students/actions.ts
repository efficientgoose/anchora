"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getStudentDataLaunchStatus } from "@/features/students/server-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveWorkspaceContext } from "@/lib/workspace/context";

interface DatabaseError {
  code?: string;
  message?: string;
}

export interface StudentActionState {
  status: "idle" | "disabled" | "created" | "duplicate" | "success" | "validation_error" | "legal_required" | "access_denied" | "not_found" | "student_archived" | "error";
  studentId?: string;
  taskId?: string;
  fieldErrors?: Partial<Record<"fullName" | "email" | "phone" | "intakeSeason" | "intakeYear" | "adultConfirmed" | "permissionConfirmed" | "assignedConsultantId" | "status" | "planningTargetDate", string>>;
  exportData?: StudentExport;
}

export interface StudentExport {
  student: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    intakeSeason: "summer" | "winter";
    intakeYear: number;
    lifecycleStatus: "active" | "archived";
    createdAt: string;
  };
  journey: Array<{
    stageKey: string;
    title: string;
    displayOrder: number;
    tasks: Array<{
      taskKey: string;
      title: string;
      displayOrder: number;
      status: "not_started" | "in_progress" | "blocked" | "completed";
      planningTargetDate: string;
    }>;
  }>;
}

const uuidSchema = z.string().uuid();
const optionalPhoneSchema = z.string().trim().max(32).transform((value) => value || null).refine((value) => value === null || value.length >= 7, "Enter a valid phone number.");
const booleanSchema = z.preprocess((value) => value === "true" || value === "on", z.literal(true));
const studentFormSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the student's full name.").max(160, "Keep the name under 160 characters."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(320),
  phone: optionalPhoneSchema,
  intakeSeason: z.enum(["summer", "winter"], { message: "Choose a valid intake season." }),
  intakeYear: z.coerce.number().int().min(2020, "Choose an intake year from 2020 onward.").max(2100, "Choose an intake year through 2100."),
});
const createStudentSchema = studentFormSchema.extend({
  adultConfirmed: booleanSchema,
  permissionConfirmed: booleanSchema,
}).superRefine((value, context) => {
  const currentYear = new Date().getUTCFullYear();
  if (value.intakeYear < currentYear || value.intakeYear > currentYear + 5) {
    context.addIssue({
      code: "custom",
      path: ["intakeYear"],
      message: `Choose an intake year from ${currentYear} through ${currentYear + 5}.`,
    });
  }
});
const editStudentSchema = studentFormSchema.extend({
  studentId: uuidSchema,
  assignedConsultantId: uuidSchema,
});
const taskSchema = z.object({
  taskId: uuidSchema,
  status: z.enum(["not_started", "in_progress", "blocked", "completed"]),
  planningTargetDate: z.union([z.string().date(), z.literal("")]).transform((value) => value || null),
});
const studentIdSchema = z.object({ studentId: uuidSchema });
const studentExportSchema = z.object({
  student: z.object({
    id: uuidSchema,
    fullName: z.string(),
    email: z.string().email(),
    phone: z.string().nullable(),
    intakeSeason: z.enum(["summer", "winter"]),
    intakeYear: z.number().int(),
    lifecycleStatus: z.enum(["active", "archived"]),
    createdAt: z.string().datetime({ offset: true }),
  }),
  journey: z.array(z.object({
    stageKey: z.string(),
    title: z.string(),
    displayOrder: z.number().int(),
    tasks: z.array(z.object({
      taskKey: z.string(),
      title: z.string(),
      displayOrder: z.number().int(),
      status: z.enum(["not_started", "in_progress", "blocked", "completed"]),
      planningTargetDate: z.string().date(),
    })),
  })),
});
const createResultSchema = z.array(z.object({ student_id: uuidSchema, created: z.boolean() })).length(1);
const uuidResultSchema = uuidSchema;
const taskResultSchema = z.array(z.object({ task_id: uuidSchema, student_id: uuidSchema })).length(1);
const voidResultSchema = z.null().nullable();

function formValues(formData: FormData, keys: readonly string[]) {
  return Object.fromEntries(keys.map((key) => [key, formData.get(key)]));
}

function fieldErrors(error: z.ZodError): StudentActionState["fieldErrors"] {
  const known = new Set(["fullName", "email", "phone", "intakeSeason", "intakeYear", "adultConfirmed", "permissionConfirmed", "assignedConsultantId", "status", "planningTargetDate"]);
  return Object.fromEntries(error.issues.flatMap((issue) => {
    const field = issue.path[0];
    return typeof field === "string" && known.has(field) ? [[field, issue.message]] : [];
  }));
}

function databaseState(error: DatabaseError): StudentActionState {
  if (error.message === "legal_acceptance_required") return { status: "legal_required" };
  if (error.message === "student_not_found" || error.message === "journey_task_not_found") return { status: "not_found" };
  if (error.message === "student_archived") return { status: "student_archived" };
  if (error.code === "42501" || error.message === "organization_access_denied" || error.message === "authentication_required") return { status: "access_denied" };
  if (error.message === "invalid_assigned_consultant") return { status: "validation_error", fieldErrors: { assignedConsultantId: "Choose a current workspace member." } };
  if (error.code === "23505" || error.message === "duplicate_student_email") return { status: "validation_error", fieldErrors: { email: "A student with this email already exists in this workspace." } };
  if (error.message?.startsWith("invalid_") || error.message === "adult_and_permission_required") return { status: "validation_error" };
  return { status: "error" };
}

function revalidateStudentRoutes(studentId?: string) {
  revalidatePath("/students");
  revalidatePath("/students/new");
  revalidatePath("/intakes");
  revalidatePath("/students/[studentId]", "page");
  revalidatePath("/students/[studentId]/preview", "page");
  if (studentId) {
    revalidatePath(`/students/${studentId}`);
    revalidatePath(`/students/${studentId}/preview`);
  }
}

async function authenticatedWorkspace() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const workspace = await resolveWorkspaceContext(supabase, data.user);
  return workspace.status === "ready" ? { supabase, context: workspace.context } : null;
}

export async function createStudentAction(_previousState: StudentActionState, formData: FormData): Promise<StudentActionState> {
  if (!getStudentDataLaunchStatus().enabled) return { status: "disabled" };
  const parsed = createStudentSchema.safeParse(formValues(formData, ["fullName", "email", "phone", "intakeSeason", "intakeYear", "adultConfirmed", "permissionConfirmed"]));
  if (!parsed.success) return { status: "validation_error", fieldErrors: fieldErrors(parsed.error) };
  const workspace = await authenticatedWorkspace();
  if (!workspace) return { status: "access_denied" };
  const { data, error } = await workspace.supabase.rpc("create_student_with_journey", {
    p_organization_id: workspace.context.organization.id,
    p_full_name: parsed.data.fullName,
    p_email: parsed.data.email,
    p_phone: parsed.data.phone,
    p_intake_season: parsed.data.intakeSeason,
    p_intake_year: parsed.data.intakeYear,
    p_adult_confirmed: parsed.data.adultConfirmed,
    p_permission_confirmed: parsed.data.permissionConfirmed,
  });
  if (error) return databaseState(error);
  const result = createResultSchema.safeParse(data);
  if (!result.success) return { status: "error" };
  const created = result.data[0];
  revalidateStudentRoutes(created.student_id);
  return { status: created.created ? "created" : "duplicate", studentId: created.student_id };
}

export async function updateStudentAction(_previousState: StudentActionState, formData: FormData): Promise<StudentActionState> {
  if (!getStudentDataLaunchStatus().enabled) return { status: "disabled" };
  const parsed = editStudentSchema.safeParse(formValues(formData, ["studentId", "fullName", "email", "phone", "intakeSeason", "intakeYear", "assignedConsultantId"]));
  if (!parsed.success) return { status: "validation_error", fieldErrors: fieldErrors(parsed.error) };
  const workspace = await authenticatedWorkspace();
  if (!workspace) return { status: "access_denied" };
  const { data, error } = await workspace.supabase.rpc("update_student_profile", {
    p_student_id: parsed.data.studentId,
    p_full_name: parsed.data.fullName,
    p_email: parsed.data.email,
    p_phone: parsed.data.phone,
    p_intake_season: parsed.data.intakeSeason,
    p_intake_year: parsed.data.intakeYear,
    p_assigned_consultant_id: parsed.data.assignedConsultantId,
  });
  if (error) return databaseState(error);
  const result = uuidResultSchema.safeParse(data);
  if (!result.success) return { status: "error" };
  revalidateStudentRoutes(result.data);
  return { status: "success", studentId: result.data };
}

export async function updateJourneyTaskAction(_previousState: StudentActionState, formData: FormData): Promise<StudentActionState> {
  if (!getStudentDataLaunchStatus().enabled) return { status: "disabled" };
  const parsed = taskSchema.safeParse(formValues(formData, ["taskId", "status", "planningTargetDate"]));
  if (!parsed.success) return { status: "validation_error", fieldErrors: fieldErrors(parsed.error) };
  const workspace = await authenticatedWorkspace();
  if (!workspace) return { status: "access_denied" };
  const { data, error } = await workspace.supabase.rpc("update_journey_task", {
    p_task_id: parsed.data.taskId,
    p_status: parsed.data.status,
    p_planning_target_date: parsed.data.planningTargetDate,
  });
  if (error) return databaseState(error);
  const result = taskResultSchema.safeParse(data);
  if (!result.success) return { status: "error" };
  const task = result.data[0];
  revalidateStudentRoutes(task.student_id);
  return { status: "success", studentId: task.student_id, taskId: task.task_id };
}

async function lifecycleAction(formData: FormData, rpc: "archive_student" | "restore_student"): Promise<StudentActionState> {
  if (!getStudentDataLaunchStatus().enabled) return { status: "disabled" };
  const parsed = studentIdSchema.safeParse(formValues(formData, ["studentId"]));
  if (!parsed.success) return { status: "validation_error" };
  const workspace = await authenticatedWorkspace();
  if (!workspace) return { status: "access_denied" };
  const { data, error } = await workspace.supabase.rpc(rpc, { p_student_id: parsed.data.studentId });
  if (error) return databaseState(error);
  const result = uuidResultSchema.safeParse(data);
  if (!result.success) return { status: "error" };
  revalidateStudentRoutes(result.data);
  return { status: "success", studentId: result.data };
}

export async function archiveStudentAction(_previousState: StudentActionState, formData: FormData) { return lifecycleAction(formData, "archive_student"); }
export async function restoreStudentAction(_previousState: StudentActionState, formData: FormData) { return lifecycleAction(formData, "restore_student"); }

export async function exportStudentAction(_previousState: StudentActionState, formData: FormData): Promise<StudentActionState> {
  if (!getStudentDataLaunchStatus().enabled) return { status: "disabled" };
  const parsed = studentIdSchema.safeParse(formValues(formData, ["studentId"]));
  if (!parsed.success) return { status: "validation_error" };
  const workspace = await authenticatedWorkspace();
  if (!workspace) return { status: "access_denied" };
  const { data, error } = await workspace.supabase.rpc("export_student_record", { p_student_id: parsed.data.studentId });
  if (error) return databaseState(error);
  const result = studentExportSchema.safeParse(data);
  if (!result.success) return { status: "error" };
  return { status: "success", studentId: result.data.student.id, exportData: result.data };
}

export async function eraseStudentAction(_previousState: StudentActionState, formData: FormData): Promise<StudentActionState> {
  if (!getStudentDataLaunchStatus().enabled) return { status: "disabled" };
  const parsed = studentIdSchema.safeParse(formValues(formData, ["studentId"]));
  if (!parsed.success) return { status: "validation_error" };
  const workspace = await authenticatedWorkspace();
  if (!workspace) return { status: "access_denied" };
  const { data, error } = await workspace.supabase.rpc("erase_student", { p_student_id: parsed.data.studentId });
  if (error) return databaseState(error);
  if (!voidResultSchema.safeParse(data).success) return { status: "error" };
  revalidateStudentRoutes(parsed.data.studentId);
  return { status: "success", studentId: parsed.data.studentId };
}
