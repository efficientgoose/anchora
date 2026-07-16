"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Check, CheckCircle2, ChevronRight, Plus, RotateCcw } from "lucide-react";
import { z } from "zod";
import { Breadcrumbs } from "@/components/patterns/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import { Select } from "@/components/ui/select";
import { DEMO_STAFF, INTAKES, UNIVERSITIES } from "@/domain/constants";
import type { Student } from "@/domain/models";
import { cn } from "@/lib/cn";
import { useCreateStudent } from "./data";

const schema = z.object({
  name: z.string().trim().min(2, "Enter the student’s full name"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string(),
  targetIntake: z.string().min(1, "Select an intake"),
  assignedConsultantId: z.string().min(1, "Select a consultant"),
  targetUniversities: z.array(z.string()).min(1, "Select at least one university"),
});
type FormValues = z.infer<typeof schema>;

export function AddStudentPage() {
  const mutation = useCreateStudent();
  const [created, setCreated] = React.useState<Student | null>(null);
  const { register, control, watch, setValue, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", phone: "", targetIntake: "", assignedConsultantId: "", targetUniversities: [] } });
  const selected = watch("targetUniversities");

  function toggleUniversity(university: string) {
    setValue("targetUniversities", selected.includes(university) ? selected.filter((item) => item !== university) : [...selected, university], { shouldValidate: true, shouldDirty: true });
  }

  const submit = handleSubmit(async (values) => {
    const student = await mutation.mutateAsync(values);
    setCreated(student);
  });

  function addAnother() {
    reset();
    setCreated(null);
  }

  return (
    <div className="mx-auto max-w-[950px] p-4 sm:p-6 lg:p-8 page-enter">
      <div className="mb-4"><Breadcrumbs items={[{ label: "Students", href: "/students" }, { label: "Add student" }]} /></div>
      {created ? (
        <Card className="editorial-rule flex min-h-[460px] flex-col items-center justify-center p-8 text-center">
          <span className="flex size-14 items-center justify-center rounded-full border border-success-border bg-success-soft text-status-success"><CheckCircle2 aria-hidden="true" className="size-7" /></span>
          <h1 className="type-page-title mt-5">{created.name.split(" ")[0]} is ready to go</h1>
          <p className="mt-2 max-w-lg text-sm leading-[22px] text-text-muted">{created.name}&apos;s checklist has been generated — <span className="tabular-nums">{created.tasks.length}</span> tasks across global requirements and <span className="tabular-nums">{created.targetUniversities.length}</span> {created.targetUniversities.length === 1 ? "university" : "universities"}.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3"><Button asChild><Link href={`/students/${created.id}`}>View student <ChevronRight /></Link></Button><Button variant="secondary" onClick={addAnother}><RotateCcw /> Add another</Button></div>
        </Card>
      ) : (
        <Card className="overflow-hidden border-t-[3px] border-t-brand-gold">
          <CardHeader className="bg-surface-muted/35"><h1 className="text-[22px] font-semibold leading-7 tracking-[-.02em]">Add new student</h1><p className="mt-1 text-sm leading-[22px] text-text-muted">A full checklist — APS, IELTS, GRE, SOP, LORs, Uni-Assist, visa, and more — is generated automatically on submit.</p></CardHeader>
          <form onSubmit={submit} className="space-y-5 p-5 sm:p-7" noValidate>
            <FormField label="Full name" required error={errors.name?.message}><Input {...register("name")} placeholder="e.g. Rahul Verma" autoComplete="name" /></FormField>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Email" required error={errors.email?.message}><Input {...register("email")} type="email" placeholder="name@email.com" autoComplete="email" /></FormField>
              <FormField label="Phone" hint="Include the country code."><Input {...register("phone")} type="tel" placeholder="+91 …" autoComplete="tel" /></FormField>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Target intake" required error={errors.targetIntake?.message}><Controller control={control} name="targetIntake" render={({ field }) => <Select ariaLabel="Target intake" value={field.value || undefined} onValueChange={field.onChange} placeholder="Select intake…" options={INTAKES.map((value) => ({value,label:value}))} />} /></FormField>
              <FormField label="Assigned consultant" required error={errors.assignedConsultantId?.message}><Controller control={control} name="assignedConsultantId" render={({ field }) => <Select ariaLabel="Assigned consultant" value={field.value || undefined} onValueChange={field.onChange} placeholder="Select consultant…" options={DEMO_STAFF.map((member) => ({value:member.id,label:member.name}))} />} /></FormField>
            </div>

            <fieldset aria-describedby={errors.targetUniversities ? "universities-error" : "universities-hint"}>
              <legend className="text-[13px] font-semibold leading-5 text-text-secondary">Target universities <span aria-hidden="true" className="text-status-danger">*</span><span className="sr-only"> (required)</span></legend>
              <p id="universities-hint" className="mt-0.5 text-xs leading-4 text-text-muted">Select one or more universities.</p>
              <div className="mt-3 flex flex-wrap gap-2">{UNIVERSITIES.map((university) => {
                const active = selected.includes(university);
                return <button type="button" aria-pressed={active} onClick={() => toggleUniversity(university)} key={university} className={cn("inline-flex min-h-8 items-center rounded-full border px-3 py-1.5 text-xs font-medium leading-4 outline-none transition [transition-duration:var(--motion-fast)] focus-visible:ring-[3px] focus-visible:ring-brand-gold/30", active ? "border-accent-border bg-accent-soft text-brand-ink" : "border-border-default bg-surface text-text-secondary hover:border-border-strong hover:bg-surface-muted")}>{active && <Check aria-hidden="true" className="mr-1.5 size-3.5" />}{university}</button>;
              })}</div>
              {errors.targetUniversities && <p id="universities-error" role="alert" className="mt-2 text-xs font-medium leading-4 text-status-danger">{errors.targetUniversities.message}</p>}
            </fieldset>

            {mutation.isError && <Notice tone="danger" title="Student not created">The student could not be created. Try again.</Notice>}
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border-subtle pt-5"><Button asChild type="button" variant="ghost"><Link href="/students">Cancel</Link></Button><Button type="submit" disabled={mutation.isPending}><Plus />{mutation.isPending ? "Creating…" : "Create student & checklist"}</Button></div>
          </form>
        </Card>
      )}
    </div>
  );
}
