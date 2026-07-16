"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
      <section className="flex items-center justify-center px-6 py-12 sm:p-8">
        <div className="w-full max-w-[380px] page-enter">
          <BrandMark className="mb-[30px]" />
          <h1 className="text-[26px] font-bold tracking-[-.025em]">Welcome back</h1>
          <p className="mt-1.5 text-sm text-slate-500">Sign in to your consultant workspace.</p>
          <form className="mt-6" onSubmit={submit}>
            <label className="mb-4 block"><span className="mb-2 block text-[13px] font-medium text-slate-700">Work email</span><Input type="email" placeholder="you@consultancy.de" required autoComplete="email" /></label>
            <label className="block"><span className="mb-2 flex items-center justify-between text-[13px] font-medium text-slate-700">Password <button type="button" className="font-normal text-brand-charcoal hover:underline">Forgot?</button></span><Input type="password" placeholder="••••••••" required autoComplete="current-password" /></label>
            <label className="my-[18px] flex cursor-pointer items-center gap-2 text-[13px] text-slate-600"><Checkbox checked={remember} onCheckedChange={(value) => setRemember(value === true)} />Keep me signed in</label>
            <Button className="w-full" size="lg" disabled={pending}>{pending ? "Signing In…" : "Sign In"}</Button>
          </form>
          <div className="mt-5 text-center text-[13px] text-slate-400">New to Anchora? <button className="font-medium text-brand-charcoal hover:underline">Request access</button></div>
        </div>
      </section>
      <section className="relative hidden overflow-hidden bg-brand-charcoal p-14 text-slate-200 lg:flex lg:flex-col lg:justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_80%_15%,rgba(79,70,229,.35)_0%,transparent_70%)]" />
        <div className="relative z-10 max-w-[410px] page-enter [animation-delay:100ms]">
          <div className="mb-[18px] text-sm font-semibold text-brand-gold">“We haven&apos;t missed a Uni-Assist deadline since.”</div>
          <blockquote className="text-[22px] font-semibold leading-[1.42] tracking-[-.015em] text-white">Anchora gave our consultants back the hours they used to spend reconstructing where each student stood.</blockquote>
          <div className="mt-6 flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-brand-gold text-sm font-semibold text-brand-charcoal">PN</span><div><div className="text-sm font-semibold text-white">Priya Nair</div><div className="text-[13px] text-slate-400">Senior Consultant, Berlin</div></div></div>
        </div>
      </section>
    </main>
  );
}
