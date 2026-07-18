"use client";

import * as React from "react";
import { ArrowRight, Quote } from "lucide-react";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import { signInAction, type SignInState } from "./actions";

const initialSignInState: SignInState = { status: "idle" };

export function LoginPage({ nextPath, configurationMissing = false }: { nextPath: string; configurationMissing?: boolean }) {
  const [state, formAction, pending] = React.useActionState(signInAction, initialSignInState);

  return (
    <main className="grid min-h-screen bg-canvas lg:grid-cols-[minmax(0,1fr)_minmax(480px,.9fr)]">
      <section className="relative flex items-center justify-center bg-surface px-6 py-12 sm:p-8">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-brand-gold" />
        <div className="w-full max-w-[390px] page-enter">
          <BrandMark className="mb-9" />
          <div className="type-micro text-brand-gold-strong">Consultant workspace</div>
          <h1 className="mt-2 text-[28px] font-bold leading-9 tracking-[-.03em]">Welcome back</h1>
          <p className="mt-1.5 text-sm leading-[22px] text-text-muted">Sign in to see every active student journey.</p>

          {configurationMissing && <Notice tone="warning" className="mt-6" title="Sign-in is not configured">Add the Supabase environment settings before using this workspace.</Notice>}
          {state.status === "error" && state.message && <Notice key={state.message} tone="danger" className="mt-6" role="alert">{state.message}</Notice>}

          <form className="mt-7" action={formAction}>
            <input type="hidden" name="next" value={nextPath} />
            <div className="space-y-5">
              <FormField label="Work email" required error={state.fieldErrors?.email}><Input name="email" type="email" placeholder="you@consultancy.de" required autoComplete="username" defaultValue={state.email} disabled={pending || configurationMissing} /></FormField>
              <FormField label="Password" required error={state.fieldErrors?.password}><Input name="password" type="password" placeholder="••••••••" required autoComplete="current-password" disabled={pending || configurationMissing} /></FormField>
            </div>
            <p className="my-5 text-[13px] leading-5 text-text-muted">Access is managed by your workspace owner.</p>
            <Button className="w-full" size="lg" disabled={pending || configurationMissing}>{pending ? "Signing in…" : <>Sign in <ArrowRight /></>}</Button>
          </form>
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
