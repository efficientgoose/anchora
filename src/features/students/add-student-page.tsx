"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Check, ChevronLeft, ChevronRight, CircleAlert, Plus } from "lucide-react";
import { z } from "zod";
import { Breadcrumbs } from "@/components/patterns/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import { Select } from "@/components/ui/select";
import { createStudentAction, type StudentActionState } from "./actions";

const currentYear = new Date().getUTCFullYear();
const intakeYears = Array.from({ length: 6 }, (_, index) => currentYear + index);
const journeyStages = [
  ["Profile", ["Confirm profile and intake"]],
  ["Eligibility and APS", ["Review academic eligibility", "Prepare APS documents", "Submit APS application"]],
  ["Tests and documents", ["Plan language test", "Prepare academic documents", "Complete SOP and references"]],
  ["University applications", ["Build program shortlist"]],
  ["Offer, finance and visa", ["Review admission offer", "Arrange proof of finance", "Secure health insurance", "Submit visa application"]],
  ["Arrival", ["Plan travel and arrival", "Confirm university enrollment"]],
] as const;

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter the student's full name.").max(160, "Keep the name under 160 characters."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(320),
  phone: z.string().trim().max(32, "Keep the phone number under 32 characters.").refine((value) => !value || value.length >= 7, "Enter a valid phone number."),
  intakeSeason: z.enum(["summer", "winter"], { message: "Choose an intake season." }),
  intakeYear: z.number().int().min(currentYear, "Choose a current or future intake year.").max(currentYear + 5, "Choose an intake year from the available range."),
  adultConfirmed: z.boolean().refine((value) => value, "Confirm that the student is an adult."),
  permissionConfirmed: z.boolean().refine((value) => value, "Confirm that you have permission to add this student."),
});
type FormValues = z.infer<typeof schema>;

const initialState: StudentActionState = { status: "idle" };
const firstStepFields = ["fullName", "email", "phone", "intakeSeason", "intakeYear"] as const;

function fieldName(field: string): field is keyof FormValues {
  return ["fullName", "email", "phone", "intakeSeason", "intakeYear", "adultConfirmed", "permissionConfirmed"].includes(field);
}

function Progress({ step }: { step: 1 | 2 }) {
  return (
    <ol className="grid grid-cols-2 gap-3" aria-label="Student setup progress">
      {["Student details", "Review and confirm"].map((label, index) => {
        const number = index + 1;
        const active = number === step;
        const complete = number < step;
        return (
          <li key={label} aria-current={active ? "step" : undefined} className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium leading-4 text-text-secondary"><span className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${complete ? "border-brand-ink bg-brand-ink text-text-inverse" : active ? "border-brand-ink text-brand-ink" : "border-border-strong text-text-muted"}`}>{complete ? <Check aria-hidden="true" className="size-3" /> : number}</span><span className={active ? "text-text-primary" : undefined}>{label}</span></div>
            <div aria-hidden="true" className={`mt-2 h-px ${complete || active ? "bg-brand-ink" : "bg-border-default"}`} />
          </li>
        );
      })}
    </ol>
  );
}

export function AddStudentPage({ launchEnabled }: { launchEnabled: boolean }) {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2>(1);
  const [state, formAction, isPending] = React.useActionState(createStudentAction, initialState);
  const [handledResponse, setHandledResponse] = React.useState<StudentActionState | null>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const { register, control, getValues, handleSubmit, setError, trigger, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", phone: "", intakeSeason: undefined, intakeYear: currentYear, adultConfirmed: false, permissionConfirmed: false },
  });

  const serverFieldEntries = state.status === "validation_error" && state.fieldErrors
    ? Object.entries(state.fieldErrors).filter(([name, message]) => Boolean(message) && fieldName(name))
    : [];
  const hiddenFirstStepServerErrors = handledResponse !== state
    && serverFieldEntries.some(([name]) => firstStepFields.includes(name as typeof firstStepFields[number]));
  const effectiveStep: 1 | 2 = hiddenFirstStepServerErrors ? 1 : step;

  React.useEffect(() => {
    headingRef.current?.focus();
  }, [effectiveStep]);

  React.useEffect(() => {
    if (state.status === "created" && state.studentId) router.replace(`/students/${state.studentId}?created=1`);
  }, [router, state.status, state.studentId]);

  React.useEffect(() => {
    if (state.status !== "validation_error" || !state.fieldErrors) return;
    Object.entries(state.fieldErrors)
      .filter(([name, message]) => Boolean(message) && fieldName(name))
      .forEach(([name, message]) => setError(name as keyof FormValues, { type: "server", message }));
  }, [setError, state.fieldErrors, state.status]);

  async function advance() {
    if (await trigger(firstStepFields)) {
      setHandledResponse(state);
      setStep(2);
    }
  }

  const submit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set("fullName", values.fullName);
    formData.set("email", values.email);
    formData.set("phone", values.phone);
    formData.set("intakeSeason", values.intakeSeason);
    formData.set("intakeYear", String(values.intakeYear));
    formData.set("adultConfirmed", values.adultConfirmed ? "true" : "false");
    formData.set("permissionConfirmed", values.permissionConfirmed ? "true" : "false");
    React.startTransition(() => formAction(formData));
  });

  if (!launchEnabled) {
    return (
      <div className="mx-auto max-w-[950px] p-4 sm:p-6 lg:p-8 page-enter">
        <Breadcrumbs items={[{ label: "Students", href: "/students" }, { label: "Add student" }]} />
        <Card className="editorial-rule mt-6"><div className="mx-auto max-w-lg px-6 py-16 text-center"><CircleAlert aria-hidden="true" className="mx-auto size-7 text-text-muted" /><h1 className="type-page-title mt-4">Student setup is not enabled</h1><p className="mt-2 text-sm leading-[22px] text-text-muted">This workspace is not accepting student records yet.</p><Button asChild variant="secondary" className="mt-6"><Link href="/students">Back to students</Link></Button></div></Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[950px] p-4 sm:p-6 lg:p-8 page-enter">
      <div className="mb-5"><Breadcrumbs items={[{ label: "Students", href: "/students" }, { label: "Add student" }]} /></div>
      <Card className="overflow-hidden border-t-[3px] border-t-brand-gold">
        <CardHeader className="bg-surface-muted/35">
          <div className="max-w-2xl"><p className="type-micro text-brand-gold-strong">Germany journey</p><h1 ref={headingRef} tabIndex={-1} className="mt-1 text-[22px] font-semibold leading-7 tracking-[-.02em] outline-none">{effectiveStep === 1 ? "Add a student" : "Review before creating"}</h1><p className="mt-1 text-sm leading-[22px] text-text-muted">{effectiveStep === 1 ? "Start with the essentials. The creator is assigned automatically." : "Confirm the details and the initial planning journey for Germany."}</p></div>
          <div className="mt-6 max-w-xl"><Progress step={effectiveStep} /></div>
        </CardHeader>
        <form onSubmit={submit} noValidate className="p-5 sm:p-7">
          {effectiveStep === 1 ? (
            <div className="space-y-5">
              <FormField label="Full name" required error={errors.fullName?.message}><Input {...register("fullName")} placeholder="e.g. Rahul Verma" autoComplete="name" disabled={isPending} /></FormField>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Email" required error={errors.email?.message}><Input {...register("email")} type="email" placeholder="name@email.com" autoComplete="email" disabled={isPending} /></FormField>
                <FormField label="Phone" hint="Optional. Include the country code." error={errors.phone?.message}><Input {...register("phone")} type="tel" placeholder="+91 …" autoComplete="tel" disabled={isPending} /></FormField>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Intake" required error={errors.intakeSeason?.message}><Controller control={control} name="intakeSeason" render={({ field }) => <Select ariaLabel="Intake season" value={field.value} onValueChange={field.onChange} placeholder="Choose season…" disabled={isPending} options={[{ value: "summer", label: "Summer" }, { value: "winter", label: "Winter" }]} />} /></FormField>
                <FormField label="Year" required error={errors.intakeYear?.message}><Controller control={control} name="intakeYear" render={({ field }) => <Select ariaLabel="Intake year" value={field.value ? String(field.value) : undefined} onValueChange={(value) => field.onChange(Number(value))} disabled={isPending} options={intakeYears.map((year) => ({ value: String(year), label: String(year) }))} />} /></FormField>
              </div>
              <div className="border-t border-border-subtle pt-5"><p className="text-[13px] font-semibold leading-5 text-text-secondary">Destination</p><p className="mt-1 text-sm leading-[22px] text-text-muted"><span className="font-medium text-text-secondary">Germany</span> is set for this first journey. Your workspace creator will be assigned automatically.</p></div>
              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border-subtle pt-5"><Button asChild type="button" variant="ghost"><Link href="/students">Cancel</Link></Button><Button type="button" onClick={advance} disabled={isPending}>Continue <ChevronRight aria-hidden="true" /></Button></div>
            </div>
          ) : (
            <div className="space-y-6">
              <section aria-labelledby="student-review-title"><h2 id="student-review-title" className="type-micro text-text-muted">Student details</h2><dl className="mt-3 grid gap-4 border-y border-border-subtle py-4 text-sm sm:grid-cols-2"><div><dt className="text-text-muted">Name</dt><dd className="mt-1 font-medium text-text-primary">{getValues("fullName")}</dd></div><div><dt className="text-text-muted">Email</dt><dd className="mt-1 font-medium text-text-primary">{getValues("email")}</dd></div>{getValues("phone") && <div><dt className="text-text-muted">Phone</dt><dd className="mt-1 font-medium text-text-primary">{getValues("phone")}</dd></div>}<div><dt className="text-text-muted">Intake</dt><dd className="mt-1 font-medium text-text-primary">{getValues("intakeSeason") === "summer" ? "Summer" : "Winter"} {getValues("intakeYear")}</dd></div><div><dt className="text-text-muted">Destination</dt><dd className="mt-1 font-medium text-text-primary">Germany</dd></div></dl></section>
              <section aria-labelledby="journey-preview-title"><div className="flex flex-wrap items-baseline justify-between gap-2"><h2 id="journey-preview-title" className="text-sm font-semibold leading-5 text-text-primary">Germany journey</h2><p className="text-xs leading-4 text-text-muted">6 stages · 14 editable planning tasks</p></div><ol className="mt-3 divide-y divide-border-subtle border-y border-border-subtle">{journeyStages.map(([stage, tasks], index) => <li key={stage} className="py-3"><div className="flex gap-3"><span className="tabular-nums text-xs font-medium text-text-muted">0{index + 1}</span><div><h3 className="text-[13px] font-semibold leading-5 text-text-secondary">{stage}</h3><p className="mt-1 text-xs leading-5 text-text-muted">{tasks.join(" · ")}</p></div></div></li>)}</ol></section>
              <fieldset className="space-y-3" aria-describedby="confirmation-description">
                <legend className="text-sm font-semibold leading-5 text-text-primary">Required confirmations</legend>
                <p id="confirmation-description" className="text-xs leading-4 text-text-muted">Both confirmations are required before a student record is created.</p>
                <Controller control={control} name="adultConfirmed" render={({ field }) => (
                  <div>
                    <label htmlFor="adult-confirmed" className="flex cursor-pointer items-start gap-3 rounded-sm p-1 text-sm leading-5 text-text-secondary">
                      <Checkbox id="adult-confirmed" name={field.name} ref={field.ref} checked={field.value} onBlur={field.onBlur} onCheckedChange={(checked) => field.onChange(checked === true)} disabled={isPending} aria-invalid={Boolean(errors.adultConfirmed)} aria-describedby={errors.adultConfirmed ? "adult-confirmed-help adult-confirmed-error" : "adult-confirmed-help"} />
                      <span>I confirm this student is 18 or older.</span>
                    </label>
                    <p id="adult-confirmed-help" className="mt-1 pl-8 text-xs leading-4 text-text-muted">Required before creating the student record.</p>
                    {errors.adultConfirmed && <p id="adult-confirmed-error" role="alert" className="mt-1 pl-8 text-xs font-medium text-status-danger">{errors.adultConfirmed.message}</p>}
                  </div>
                )} />
                <Controller control={control} name="permissionConfirmed" render={({ field }) => (
                  <div>
                    <label htmlFor="permission-confirmed" className="flex cursor-pointer items-start gap-3 rounded-sm p-1 text-sm leading-5 text-text-secondary">
                      <Checkbox id="permission-confirmed" name={field.name} ref={field.ref} checked={field.value} onBlur={field.onBlur} onCheckedChange={(checked) => field.onChange(checked === true)} disabled={isPending} aria-invalid={Boolean(errors.permissionConfirmed)} aria-describedby={errors.permissionConfirmed ? "permission-confirmed-help permission-confirmed-error" : "permission-confirmed-help"} />
                      <span>I confirm I have permission to add this student&apos;s details.</span>
                    </label>
                    <p id="permission-confirmed-help" className="mt-1 pl-8 text-xs leading-4 text-text-muted">Required before creating the student record.</p>
                    {errors.permissionConfirmed && <p id="permission-confirmed-error" role="alert" className="mt-1 pl-8 text-xs font-medium text-status-danger">{errors.permissionConfirmed.message}</p>}
                  </div>
                )} />
              </fieldset>
              {state.status === "validation_error" && <Notice tone="danger" aria-live="assertive" title="Some details need attention">Use Back to review the marked fields, then continue again.</Notice>}
              {state.status === "duplicate" && state.studentId && <Notice tone="warning" aria-live="assertive" title="This student already exists">No duplicate was created. <Link className="font-semibold underline underline-offset-2" href={`/students/${state.studentId}`}>Open the existing student record</Link>.</Notice>}
              {state.status === "legal_required" && <Notice tone="warning" title="Agreement required">Complete the workspace agreement before creating a student.</Notice>}
              {(state.status === "access_denied" || state.status === "disabled" || state.status === "error") && <Notice tone="danger" aria-live="assertive" title="Student not created">The student could not be created. Return to the student list and try again when access is available.</Notice>}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-5"><Button type="button" variant="ghost" onClick={() => { setHandledResponse(state); setStep(1); }} disabled={isPending}><ChevronLeft aria-hidden="true" />Back</Button><Button type="submit" disabled={isPending}><Plus aria-hidden="true" />{isPending ? "Creating…" : "Create student"}</Button></div>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
