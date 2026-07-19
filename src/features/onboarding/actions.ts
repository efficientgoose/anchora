"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface CreateOrganizationState {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: { consultancyName?: string };
}

const organizationSchema = z.object({
  consultancyName: z
    .string()
    .trim()
    .min(2, "Enter a consultancy name.")
    .max(100, "Keep the consultancy name under 100 characters."),
});

export async function createOrganizationAction(
  _previousState: CreateOrganizationState,
  formData: FormData,
): Promise<CreateOrganizationState> {
  const parsed = organizationSchema.safeParse({ consultancyName: formData.get("consultancyName") });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted field and try again.",
      fieldErrors: { consultancyName: z.flattenError(parsed.error).fieldErrors.consultancyName?.[0] },
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { status: "error", message: "Workspace setup is not configured for this environment." };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) redirect("/login?next=%2Fonboarding");

  const { data, error } = await supabase.rpc("create_owner_organization", {
    p_name: parsed.data.consultancyName,
  });

  if (error || !Array.isArray(data) || data.length !== 1) {
    console.error("[onboarding:create-organization]", { code: error?.code ?? "unexpected_result" });
    return { status: "error", message: "We could not create your workspace. Try again shortly." };
  }

  redirect("/students");
}
