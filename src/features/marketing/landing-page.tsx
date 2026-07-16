import Link from "next/link";
import { ArrowRight, Check, Gauge, ListChecks, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";

const previewRows = [
  { initials: "VS", name: "Vivaan Singh", next: "Blocked Account · 6 days overdue", label: "Overdue", border: "border-l-red-600", badge: "border-red-200 bg-red-50 text-red-700" },
  { initials: "AS", name: "Aarav Sharma", next: "LOR 2 · due today", label: "Overdue", border: "border-l-red-600", badge: "border-red-200 bg-red-50 text-red-700" },
  { initials: "SI", name: "Saanvi Iyer", next: "IELTS · in 5 days", label: "At Risk", border: "border-l-amber-500", badge: "border-amber-200 bg-amber-50 text-amber-700" },
  { initials: "DP", name: "Diya Patel", next: "SOP · in 60 days", label: "On Track", border: "border-l-green-600", badge: "border-green-200 bg-green-50 text-green-700" },
];

const features = [
  { icon: Gauge, title: "Risk-sorted dashboard", body: "Your whole caseload ranked worst-first. Overdue and at-risk students surface to the top so nothing slips." },
  { icon: ListChecks, title: "Auto-built checklists", body: "Add a student and Anchora generates every requirement — APS, tests, Uni-Assist per university, visa — with live deadlines." },
  { icon: ShieldCheck, title: "Student portal", body: "A clean, read-only view students can check anytime. They always know their next step, so your inbox stays quiet." },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-brand-charcoal">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1140px] items-center px-5 sm:px-7">
          <BrandMark />
          <nav className="ml-11 hidden items-center gap-7 text-sm text-slate-600 md:flex" aria-label="Main navigation">
            <a className="transition hover:text-brand-charcoal" href="#product">Product</a>
            <a className="transition hover:text-brand-charcoal" href="#how">How it works</a>
            <a className="transition hover:text-brand-charcoal" href="#why">Why Anchora</a>
          </nav>
          <div className="flex-1" />
          <Button asChild variant="ghost" className="hidden sm:inline-flex"><Link href="/login">Log in</Link></Button>
          <Button asChild><Link href="/login">Get Started</Link></Button>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-[1140px] items-center gap-14 px-5 py-16 sm:px-7 lg:grid-cols-2 lg:py-[76px]">
          <div className="page-enter">
            <div className="mb-[22px] inline-flex items-center gap-2 rounded-full border border-brand-gold/35 bg-brand-gold/10 px-3 py-1.5 text-[12.5px] font-semibold text-brand-charcoal">
              <span className="size-1.5 rounded-full bg-brand-gold" />Built for study-abroad consultancies
            </div>
            <h1 className="max-w-[520px] text-[42px] font-bold leading-[1.06] tracking-[-.035em] text-brand-charcoal sm:text-5xl">Every applicant on track for Germany.</h1>
            <p className="mt-5 max-w-[480px] text-[17px] leading-[1.62] text-slate-600">Anchora replaces the WhatsApp threads and tangled spreadsheets. One workspace where consultants see who needs attention today — and students always know their next step.</p>
            <div className="mt-[30px] flex flex-wrap items-center gap-3">
              <Button asChild size="lg"><Link href="/login">Get Started <ArrowRight /></Link></Button>
              <Button asChild variant="secondary" size="lg"><a href="#how">See how it works</a></Button>
            </div>
            <div className="mt-[22px] flex flex-wrap gap-x-[18px] gap-y-2 text-[13px] text-slate-400">
              {["No credit card", "Onboard in a day", "GDPR-ready"].map((item) => <span key={item} className="flex items-center gap-1"><Check className="size-3.5" />{item}</span>)}
            </div>
          </div>

          <div className="relative page-enter [animation-delay:100ms]">
            <div className="absolute -inset-6 -z-10 bg-[radial-gradient(60%_60%_at_70%_20%,#eef2ff_0%,transparent_70%)]" />
            <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_24px_48px_-24px_rgba(15,23,42,.25)]">
              <div className="flex h-[42px] items-center gap-[7px] border-b border-slate-100 bg-[#fbfcfe] px-3.5">
                <span className="size-[9px] rounded-full bg-red-300" /><span className="size-[9px] rounded-full bg-amber-300" /><span className="size-[9px] rounded-full bg-green-300" />
                <span className="ml-2.5 text-xs font-medium text-slate-400">Students · 8 active · 6 need attention</span>
              </div>
              <div className="flex flex-col gap-[9px] p-4">
                {previewRows.map((row) => (
                  <div key={row.name} className={`flex items-center gap-3 rounded-[10px] border border-slate-100 border-l-[3px] bg-[#fbfcfe] px-3 py-2.5 ${row.border}`}>
                    <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-brand-gold/15 text-[11px] font-semibold text-brand-charcoal">{row.initials}</span>
                    <div className="min-w-0 flex-1"><div className="text-[13px] font-semibold">{row.name}</div><div className="truncate text-[11.5px] text-slate-400">{row.next}</div></div>
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${row.badge}`}>{row.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="why" className="border-y border-slate-100 bg-[#fbfcfe]">
          <div className="mx-auto grid max-w-[1140px] grid-cols-2 gap-6 px-5 py-8 sm:px-7 lg:grid-cols-4">
            {[["3s", "To spot who's at risk"], ["0", "Spreadsheets to maintain"], ["100%", "Of deadlines tracked live"], ["1 day", "To move your whole caseload"]].map(([value, label]) => (
              <div key={label}><div className="text-[30px] font-bold tracking-[-.025em] text-brand-charcoal">{value}</div><div className="mt-0.5 text-[13px] text-slate-500">{label}</div></div>
            ))}
          </div>
        </section>

        <section id="product" className="mx-auto max-w-[1140px] px-5 pb-10 pt-20 sm:px-7">
          <div className="mb-11 max-w-[640px]">
            <div className="mb-3 text-[13px] font-semibold uppercase tracking-[.06em] text-brand-charcoal">Everything in one place</div>
            <h2 className="text-[34px] font-bold leading-[1.12] tracking-[-.025em]">Run the whole application, not just the reminders.</h2>
            <p className="mt-3.5 text-base leading-[1.65] text-slate-500">From APS and Uni-Assist to the visa appointment — every requirement, every deadline, every student, tracked as one clear pipeline.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <article key={title} className="rounded-[14px] border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_-20px_rgba(15,23,42,.3)]">
                <span className="mb-4 flex size-[42px] items-center justify-center rounded-[11px] bg-brand-gold/15 text-brand-charcoal"><Icon className="size-5" /></span>
                <h3 className="text-[17px] font-semibold tracking-[-.01em]">{title}</h3><p className="mt-2 text-sm leading-[1.65] text-slate-500">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how" className="mx-auto max-w-[1140px] px-5 pb-20 pt-14 sm:px-7">
          <div className="grid items-center gap-12 overflow-hidden rounded-[20px] bg-brand-charcoal px-7 py-10 text-slate-200 sm:p-12 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <div className="mb-3.5 text-[13px] font-semibold uppercase tracking-[.06em] text-brand-gold">The old way vs Anchora</div>
              <h2 className="text-3xl font-bold leading-[1.15] tracking-[-.025em] text-white">Stop stitching updates together by hand.</h2>
              <p className="mt-4 text-[15px] leading-[1.65] text-slate-400">A student pings on WhatsApp, a deadline lives in one consultant&apos;s sheet, a document sits in an inbox. Anchora makes the status obvious to everyone — no chasing.</p>
              <Button asChild size="lg" className="mt-6"><Link href="/login">Get Started</Link></Button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-4"><div className="mb-2.5 text-xs font-semibold uppercase tracking-[.05em] text-red-400">Before</div><div className="text-sm leading-[1.9] text-slate-300">WhatsApp threads · Excel per intake · Shared inboxes · Missed deadlines</div></div>
              <div className="rounded-xl border border-brand-gold bg-zinc-800 p-4"><div className="mb-2.5 text-xs font-semibold uppercase tracking-[.05em] text-brand-gold">With Anchora</div><div className="text-sm leading-[1.9] text-slate-200">One dashboard · Risk-sorted caseload · Student portal · Auto checklists</div></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100"><div className="mx-auto flex max-w-[1140px] items-center gap-3 px-5 py-7 text-[13px] text-slate-400 sm:px-7"><BrandMark compact /><span>© 2026 Anchora</span><div className="flex-1" /><a href="#product" className="hidden hover:text-slate-600 sm:block">Product</a><Link href="/login" className="hover:text-slate-600">Log in</Link></div></footer>
    </div>
  );
}
