import Link from "next/link";
import { ArrowRight, Check, Gauge, ListChecks, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { RiskLevel } from "@/domain/models";
import { cn } from "@/lib/cn";

const previewRows: Array<{ initials: string; name: string; next: string; risk: RiskLevel }> = [
  { initials: "VS", name: "Vivaan Singh", next: "Blocked Account · 6 days overdue", risk: "overdue" },
  { initials: "AS", name: "Aarav Sharma", next: "LOR 2 · due today", risk: "overdue" },
  { initials: "SI", name: "Saanvi Iyer", next: "IELTS · in 5 days", risk: "at_risk" },
  { initials: "DP", name: "Diya Patel", next: "SOP · in 60 days", risk: "on_track" },
];

const features = [
  { icon: Gauge, title: "Risk-sorted dashboard", body: "Your caseload is ranked worst-first. Overdue and at-risk students surface immediately, so the day starts with the right work." },
  { icon: ListChecks, title: "Auto-built checklists", body: "Add a student and Anchora generates each requirement — APS, tests, Uni-Assist, visa — with live deadlines." },
  { icon: ShieldCheck, title: "Student visibility", body: "Students get a calm read-only view of their journey and next step, while consultants retain control of official status." },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-[3px] bg-brand-gold" />
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1140px] items-center px-5 sm:px-7">
          <BrandMark />
          <nav className="ml-11 hidden items-center gap-7 text-sm text-text-secondary md:flex" aria-label="Main navigation">
            <a className="rounded-sm transition-colors hover:text-text-primary" href="#product">Product</a>
            <a className="rounded-sm transition-colors hover:text-text-primary" href="#how">How it works</a>
            <a className="rounded-sm transition-colors hover:text-text-primary" href="#why">Why Anchora</a>
          </nav>
          <div className="flex-1" />
          <Button asChild variant="ghost" className="hidden sm:inline-flex"><Link href="/login">Log in</Link></Button>
          <Button asChild><Link href="/signup">Get started</Link></Button>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="outline-none">
        <section className="relative overflow-hidden">
          <div aria-hidden="true" className="absolute inset-0 opacity-60 [background-image:linear-gradient(var(--border-subtle)_1px,transparent_1px),linear-gradient(90deg,var(--border-subtle)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_86%)]" />
          <div className="relative mx-auto grid max-w-[1140px] items-center gap-14 px-5 py-16 sm:px-7 lg:grid-cols-[.95fr_1.05fr] lg:py-24">
            <div className="page-enter">
              <div className="mb-6 inline-flex min-h-8 items-center gap-2 rounded-full border border-accent-border bg-accent-soft px-3 text-xs font-semibold text-brand-ink"><span aria-hidden="true" className="size-1.5 rounded-full bg-brand-gold-strong" />Built for study-abroad consultancies</div>
              <h1 className="max-w-[540px] text-[42px] font-bold leading-[1.06] tracking-[-.04em] text-brand-ink sm:text-5xl">Every student journey, under control.</h1>
              <p className="mt-5 max-w-[500px] text-[17px] leading-[1.62] text-text-secondary">Anchora replaces WhatsApp threads and tangled spreadsheets with one precise workspace. Consultants see who needs attention today, and students always know their next step.</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg"><Link href="/signup">Get started <ArrowRight /></Link></Button>
                <Button asChild variant="secondary" size="lg"><a href="#how">See how it works</a></Button>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px] leading-5 text-text-muted">
                {["No credit card", "Onboard in a day", "Early-access workspace"].map((item) => <span key={item} className="flex items-center gap-1.5"><Check aria-hidden="true" className="size-3.5 text-status-success" />{item}</span>)}
              </div>
            </div>

            <div className="relative page-enter [animation-delay:100ms]">
              <div aria-hidden="true" className="absolute -inset-5 -z-10 rounded-[24px] border border-accent-border bg-accent-soft/45" />
              <div className="overflow-hidden rounded-panel border border-border-default bg-surface shadow-overlay">
                <div className="flex h-11 items-center border-b border-border-subtle bg-surface-muted/60 px-4">
                  <span className="type-micro text-text-muted">Application control tower</span>
                  <span className="ml-auto text-xs text-text-muted"><span className="tabular-nums">8</span> active · <span className="tabular-nums">6</span> need attention</span>
                </div>
                <div className="flex flex-col gap-2.5 p-4 sm:p-5">
                  {previewRows.map((row) => (
                    <div key={row.name} className={cn("relative flex items-center gap-3 overflow-hidden rounded-card border border-border-subtle bg-surface px-3 py-3 shadow-subtle before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:content-['']", row.risk === "overdue" ? "before:bg-status-danger" : row.risk === "at_risk" ? "before:bg-status-warning" : "before:bg-status-success")}>
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-soft text-[11px] font-semibold text-brand-ink">{row.initials}</span>
                      <div className="min-w-0 flex-1"><div className="text-[13px] font-semibold leading-5">{row.name}</div><div className="truncate text-[11.5px] leading-4 text-text-muted">{row.next}</div></div>
                      <StatusBadge risk={row.risk} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="why" className="border-y border-border-subtle bg-canvas">
          <div className="mx-auto grid max-w-[1140px] grid-cols-2 gap-x-6 gap-y-8 px-5 py-9 sm:px-7 lg:grid-cols-4">
            {[["3s", "To spot who is at risk"], ["0", "Spreadsheets to maintain"], ["100%", "Of deadlines tracked live"], ["1 day", "To move your caseload"]].map(([value, label]) => (
              <div key={label} className="border-l-[3px] border-brand-gold pl-4"><div className="tabular-nums text-[30px] font-bold leading-9 tracking-[-.03em] text-brand-ink">{value}</div><div className="mt-0.5 text-[13px] leading-5 text-text-muted">{label}</div></div>
            ))}
          </div>
        </section>

        <section id="product" className="mx-auto max-w-[1140px] px-5 pb-10 pt-20 sm:px-7">
          <div className="mb-11 max-w-[660px]">
            <div className="type-micro mb-3 text-brand-gold-strong">Everything in one place</div>
            <h2 className="text-[34px] font-bold leading-[1.12] tracking-[-.03em]">Run the whole application, not just the reminders.</h2>
            <p className="mt-3.5 text-base leading-[1.625] text-text-secondary">From APS and Uni-Assist to the visa appointment — every requirement, deadline, and student is tracked as one clear journey.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {features.map(({ icon: Icon, title, body }, index) => (
              <article key={title} className="group relative overflow-hidden rounded-card border border-border-default bg-surface p-6 shadow-subtle transition [transition-duration:var(--motion-standard)] hover:-translate-y-1 hover:border-border-strong hover:shadow-popover">
                <span aria-hidden="true" className="absolute right-5 top-4 text-[42px] font-bold leading-none text-border-subtle">0{index + 1}</span>
                <span className="mb-5 flex size-11 items-center justify-center rounded-control border border-accent-border bg-accent-soft text-brand-gold-strong"><Icon aria-hidden="true" className="size-5" /></span>
                <h3 className="text-[17px] font-semibold leading-6 tracking-[-.01em]">{title}</h3><p className="mt-2 text-sm leading-[1.65] text-text-muted">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how" className="mx-auto max-w-[1140px] px-5 pb-20 pt-14 sm:px-7">
          <div className="relative grid items-center gap-12 overflow-hidden rounded-[20px] bg-surface-inverse px-7 py-10 text-text-inverse sm:p-12 lg:grid-cols-[1.1fr_1fr]">
            <div aria-hidden="true" className="absolute inset-y-0 left-0 w-[5px] bg-brand-gold" />
            <div className="relative">
              <div className="type-micro mb-3.5 text-brand-gold">The old way versus Anchora</div>
              <h2 className="text-3xl font-bold leading-[1.15] tracking-[-.03em]">Stop stitching updates together by hand.</h2>
              <p className="mt-4 text-[15px] leading-[1.65] text-border-strong">A student pings on WhatsApp, a deadline lives in one consultant&apos;s sheet, and a document sits in an inbox. Anchora makes the status visible to everyone.</p>
              <Button asChild size="lg" className="mt-6 border-brand-gold bg-brand-gold text-brand-ink hover:border-accent-border hover:bg-accent-border"><Link href="/signup">Get started</Link></Button>
            </div>
            <div className="relative flex flex-col gap-3">
              <div className="rounded-card border border-text-inverse/15 bg-text-inverse/5 p-4"><div className="type-micro mb-2.5 text-danger-border">Before</div><div className="text-sm leading-[1.9] text-border-strong">WhatsApp threads · Excel per intake · Shared inboxes · Missed deadlines</div></div>
              <div className="rounded-card border border-brand-gold bg-brand-gold/10 p-4"><div className="type-micro mb-2.5 text-brand-gold">With Anchora</div><div className="text-sm leading-[1.9] text-text-inverse">One dashboard · Risk-sorted caseload · Student portal · Auto-built checklists</div></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border-subtle"><div className="mx-auto flex max-w-[1140px] flex-wrap items-center gap-x-4 gap-y-2 px-5 py-7 text-[13px] leading-5 text-text-muted sm:px-7"><BrandMark compact /><span>© 2026 Anchora</span><div className="flex-1" /><a href="#product" className="hidden rounded-sm hover:text-text-primary sm:block">Product</a><Link href="/privacy" className="rounded-sm hover:text-text-primary">Privacy</Link><Link href="/terms" className="rounded-sm hover:text-text-primary">Terms</Link><Link href="/login" className="rounded-sm hover:text-text-primary">Log in</Link></div></footer>
    </div>
  );
}
