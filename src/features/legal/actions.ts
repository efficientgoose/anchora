"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveWorkspaceContext } from "@/lib/workspace/context";
import { getStudentDataLaunchStatus, STUDENT_LEGAL_DOCUMENT_VERSION } from "@/features/students/server-data";

export interface LegalActionState {
  status: "idle" | "disabled" | "success" | "validation_error" | "access_denied" | "error";
}

const documentVersionSchema = z.literal(STUDENT_LEGAL_DOCUMENT_VERSION);
const acceptedAtSchema = z.string().datetime({ offset: true });
const individualAcceptanceSchema = z.object({
  documentVersion: documentVersionSchema,
  acceptTerms: z.literal("on"),
  acknowledgePrivacy: z.literal("on"),
});
const dpaAcceptanceSchema = z.object({
  documentVersion: documentVersionSchema,
  acceptDpaAuthority: z.literal("on"),
});

async function authenticatedWorkspace() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const workspace = await resolveWorkspaceContext(supabase, data.user);
  return workspace.status === "ready" ? { supabase, context: workspace.context } : null;
}

function revalidateLegalRoutes() {
  revalidatePath("/");
  revalidatePath("/legal/accept");
  revalidatePath("/legal/dpa");
  revalidatePath("/students");
  revalidatePath("/students/new");
  revalidatePath("/intakes");
  revalidatePath("/students/[studentId]", "page");
  revalidatePath("/students/[studentId]/preview", "page");
}

function rpcState(error: { code?: string; message?: string }): LegalActionState {
  return error.code === "42501" || error.message === "organization_access_denied" || error.message === "authentication_required" ? { status: "access_denied" } : { status: "error" };
}

export async function acceptLegalDocumentsAction(_previousState: LegalActionState, formData: FormData): Promise<LegalActionState> {
  if (!getStudentDataLaunchStatus().enabled) return { status: "disabled" };
  const acceptance = individualAcceptanceSchema.safeParse({
    documentVersion: formData.get("documentVersion"),
    acceptTerms: formData.get("acceptTerms"),
    acknowledgePrivacy: formData.get("acknowledgePrivacy"),
  });
  if (!acceptance.success) return { status: "validation_error" };
  const workspace = await authenticatedWorkspace();
  if (!workspace) return { status: "access_denied" };
  const { data, error } = await workspace.supabase.rpc("accept_legal_documents", {
    p_organization_id: workspace.context.organization.id,
    p_document_version: acceptance.data.documentVersion,
  });
  if (error) return rpcState(error);
  if (!acceptedAtSchema.safeParse(data).success) return { status: "error" };
  revalidateLegalRoutes();
  return { status: "success" };
}

export async function acceptOrganizationDpaAction(_previousState: LegalActionState, formData: FormData): Promise<LegalActionState> {
  if (!getStudentDataLaunchStatus().enabled) return { status: "disabled" };
  const acceptance = dpaAcceptanceSchema.safeParse({
    documentVersion: formData.get("documentVersion"),
    acceptDpaAuthority: formData.get("acceptDpaAuthority"),
  });
  if (!acceptance.success) return { status: "validation_error" };
  const workspace = await authenticatedWorkspace();
  if (!workspace) return { status: "access_denied" };
  const { data, error } = await workspace.supabase.rpc("accept_organization_dpa", {
    p_organization_id: workspace.context.organization.id,
    p_document_version: acceptance.data.documentVersion,
  });
  if (error) return rpcState(error);
  if (!acceptedAtSchema.safeParse(data).success) return { status: "error" };
  revalidateLegalRoutes();
  return { status: "success" };
}
