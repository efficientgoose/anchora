"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Quote } from "lucide-react";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

export function LoginPage() {
  const router = useRouter();
  const [remember, setRemember] = React.useState(true);
  const [pending, setPending] = React.useState(false);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    window.setTimeout(() => router.push("/students"), 260);
  }

  return (
    <main className="grid min-h-screen bg-canvas lg:grid-cols-[minmax(0,1fr)_minmax(480px,.9fr)]">
      <section className="relative flex items-center justify-center bg-surface px-6 py-12 sm:p-8">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-brand-gold" />
        <div className="w-full max-w-[390px] page-enter">
          <BrandMark className="mb-9" />
          <div className="type-micro text-brand-gold-strong">Consultant workspace</div>
          <h1 className="mt-2 text-[28px] font-bold leading-9 tracking-[-.03em]">Welcome back</h1>
          <p className="mt-1.5 text-sm leading-[22px] text-text-muted">Sign in to see every active student journey.</p>

          <form className="mt-7" onSubmit={submit}>
            <div className="space-y-5">
              <FormField label="Work email" required><Input type="email" placeholder="you@consultancy.de" required autoComplete="email" /></FormField>
              <FormField label="Password" required><Input type="password" placeholder="••••••••" required autoComplete="current-password" /></FormField>
            </div>
            <div className="my-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5"><Checkbox id="remember-session" checked={remember} onCheckedChange={(value) => setRemember(value === true)} /><label htmlFor="remember-session" className="text-[13px] leading-5 text-text-secondary">Keep me signed in</label></div>
              <button type="button" className="min-h-8 rounded-sm px-1 text-[13px] font-medium leading-5 text-text-primary hover:underline">Forgot password?</button>
            </div>
            <Button className="w-full" size="lg" disabled={pending}>{pending ? "Signing in…" : <>Sign in <ArrowRight /></>}</Button>
          </form>
          <div className="mt-6 text-center text-[13px] leading-5 text-text-muted">New to Anchora? <button type="button" className="min-h-8 rounded-sm font-semibold text-text-primary hover:underline">Request access</button></div>
        </div>
      </section>

      <section className="relative hidden overflow-hidden bg-surface-inverse p-14 text-text-inverse lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden="true" className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(255,255,255,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.055)_1px,transparent_1px)] [background-size:52px_52px]" />
        <div aria-hidden="true" className="absolute -right-28 -top-28 size-[420px] rounded-full border-[80px] border-brand-gold/10" />
        <div className="relative z-10 flex items-center gap-3"><span className="h-px w-10 bg-brand-gold" /><span className="type-micro text-brand-gold">Application control tower</span></div>

        <div className="relative z-10 max-w-[440px] page-enter [animation-delay:100ms]">
          <Quote aria-hidden="true" className="mb-5 size-8 text-brand-gold" />
          <blockquote className="text-[24px] font-semibold leading-[1.42] tracking-[-.02em] text-text-inverse">Anchora gave our consultants back the hours they used to spend reconstructing where each student stood.</blockquote>
          <div className="mt-7 flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-full bg-brand-gold text-sm font-bold text-brand-ink">PN</span><div><div className="text-sm font-semibold text-text-inverse">Priya Nair</div><div className="text-[13px] leading-5 text-border-strong">Senior consultant, Berlin</div></div></div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-5 border-t border-text-inverse/15 pt-5">
          <div><div className="tabular-nums text-xl font-bold">3s</div><div className="mt-1 text-xs leading-4 text-border-strong">to spot risk</div></div>
          <div><div className="tabular-nums text-xl font-bold">0</div><div className="mt-1 text-xs leading-4 text-border-strong">manual trackers</div></div>
          <div><div className="tabular-nums text-xl font-bold">100%</div><div className="mt-1 text-xs leading-4 text-border-strong">deadline clarity</div></div>
        </div>
      </section>
    </main>
  );
}
