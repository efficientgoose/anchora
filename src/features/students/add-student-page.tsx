"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Check, ChevronRight, Plus, RotateCcw } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  const mutation = useCreateStudent(); const [created, setCreated] = React.useState<Student | null>(null);
  const { register, control, watch, setValue, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", phone: "", targetIntake: "", assignedConsultantId: "", targetUniversities: [] } });
  const selected = watch("targetUniversities");
  function toggleUniversity(university: string) { setValue("targetUniversities", selected.includes(university) ? selected.filter((item) => item !== university) : [...selected, university], { shouldValidate: true, shouldDirty: true }); }
  const submit = handleSubmit(async (values) => { const student = await mutation.mutateAsync(values); setCreated(student); });
  function addAnother() { reset(); setCreated(null); }

  return (
    <div className="mx-auto max-w-[950px] p-4 sm:p-6 lg:p-8 page-enter">
      <nav className="mb-4 flex items-center gap-2 text-[13px] text-slate-400"><Link href="/students" className="text-slate-500 hover:text-indigo-600">Students</Link><span>/</span><span className="font-medium text-slate-700">Add Student</span></nav>
      {created ? (
        <Card className="flex min-h-[460px] flex-col items-center justify-center p-8 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-green-50 text-green-600"><Check className="size-7" /></span>
          <h1 className="mt-5 text-2xl font-semibold tracking-[-.02em]">{created.name.split(" ")[0]} is ready to go</h1>
          <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">{created.name}&apos;s checklist has been generated — {created.tasks.length} tasks across global requirements and {created.targetUniversities.length} {created.targetUniversities.length === 1 ? "university" : "universities"}.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3"><Button asChild><Link href={`/students/${created.id}`}>View Student <ChevronRight /></Link></Button><Button variant="secondary" onClick={addAnother}><RotateCcw /> Add Another</Button></div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-7"><h1 className="text-[22px] font-semibold tracking-[-.02em]">Add New Student</h1><p className="mt-1 text-sm text-slate-500">A full checklist — APS, IELTS, GRE, SOP, LORs, Uni-Assist, visa and more — is generated automatically on submit.</p></div>
          <form onSubmit={submit} className="space-y-5 p-5 sm:p-7" noValidate>
            <Field label="Full Name" required error={errors.name?.message}><Input {...register("name")} placeholder="e.g. Rahul Verma" /></Field>
            <div className="grid gap-5 sm:grid-cols-2"><Field label="Email" required error={errors.email?.message}><Input {...register("email")} type="email" placeholder="name@email.com" /></Field><Field label="Phone"><Input {...register("phone")} placeholder="+91 …" /></Field></div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Target Intake" required error={errors.targetIntake?.message}><Controller control={control} name="targetIntake" render={({ field }) => <Select ariaLabel="Target intake" value={field.value || undefined} onValueChange={field.onChange} placeholder="Select intake…" options={INTAKES.map((value) => ({value,label:value}))} />} /></Field>
              <Field label="Assigned Consultant" required error={errors.assignedConsultantId?.message}><Controller control={control} name="assignedConsultantId" render={({ field }) => <Select ariaLabel="Assigned consultant" value={field.value || undefined} onValueChange={field.onChange} placeholder="Select consultant…" options={DEMO_STAFF.map((member) => ({value:member.id,label:member.name}))} />} /></Field>
            </div>
            <fieldset><legend className="text-[13px] font-medium text-slate-700">Target Universities <span className="text-red-600">*</span> <span className="font-normal text-slate-400">— select one or more</span></legend><div className="mt-2.5 flex flex-wrap gap-2">{UNIVERSITIES.map((university) => { const active = selected.includes(university); return <button type="button" aria-pressed={active} onClick={() => toggleUniversity(university)} key={university} className={cn("rounded-full border px-3.5 py-2 text-[13px] font-medium transition", active ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50")}>{active && <Check className="mr-1 inline size-3.5" />}{university}</button>; })}</div>{errors.targetUniversities && <p className="mt-2 text-xs text-red-600">{errors.targetUniversities.message}</p>}</fieldset>
            {mutation.isError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">The student could not be created. Please try again.</p>}
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-5"><Button asChild type="button" variant="ghost"><Link href="/students">Cancel</Link></Button><Button type="submit" disabled={mutation.isPending}><Plus />{mutation.isPending ? "Creating…" : "Create Student & Checklist"}</Button></div>
          </form>
        </Card>
      )}
    </div>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-[13px] font-medium text-slate-700">{label} {required && <span className="text-red-600">*</span>}</span>{children}{error && <span className="mt-1.5 block text-xs text-red-600">{error}</span>}</label>;
}
