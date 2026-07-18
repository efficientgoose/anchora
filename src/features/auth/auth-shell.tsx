import Link from "next/link";
import type { ReactNode } from "react";
import { Check, Compass, FileCheck2, GraduationCap, Landmark, Plane } from "lucide-react";
import { BrandMark } from "@/components/brand/brand-mark";

const journey = [
  { label: "Student profile", detail: "Ready", icon: GraduationCap, complete: true },
  { label: "Documents", detail: "In review", icon: FileCheck2, complete: true },
  { label: "Applications", detail: "Next", icon: Landmark, current: true },
  { label: "Visa & arrival", detail: "Planned", icon: Plane },
];

export function AuthShell({ eyebrow, title, description, children, footer }: { eyebrow: string; title: string; description: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <main className="grid min-h-screen grid-cols-[minmax(0,1fr)] bg-canvas lg:grid-cols-[minmax(0,1fr)_minmax(500px,.9fr)]">
      <section className="relative flex min-w-0 items-center justify-center bg-surface px-5 py-12 sm:px-8 lg:py-16">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-brand-gold" />
        <div className="min-w-0 w-full max-w-[420px] page-enter">
          <BrandMark className="mb-9" />
          <div className="type-micro text-brand-gold-strong">{eyebrow}</div>
          <h1 className="mt-2 text-[30px] font-bold leading-[1.18] tracking-[-.035em] text-brand-ink">{title}</h1>
          <p className="mt-2 max-w-[390px] text-sm leading-[22px] text-text-muted">{description}</p>
          <div className="mt-7">{children}</div>
          {footer && <div className="mt-7 border-t border-border-subtle pt-5 text-center text-[13px] leading-5 text-text-muted">{footer}</div>}
          <nav aria-label="Legal" className="mt-4 flex items-center justify-center gap-4 text-[11px] leading-5 text-text-muted">
            <Link href="/privacy" className="underline decoration-border-strong underline-offset-4 hover:text-text-primary hover:decoration-brand-gold">Privacy</Link>
            <Link href="/terms" className="underline decoration-border-strong underline-offset-4 hover:text-text-primary hover:decoration-brand-gold">Terms</Link>
          </nav>
        </div>
      </section>

      <aside className="relative hidden overflow-hidden bg-surface-inverse p-12 text-text-inverse lg:flex lg:flex-col xl:p-14">
        <div aria-hidden="true" className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.055)_1px,transparent_1px)] [background-size:52px_52px]" />
        <div aria-hidden="true" className="absolute -right-36 -top-32 size-[440px] rounded-full border-[86px] border-brand-gold/10" />
        <div className="relative z-10 flex items-center gap-3">
          <span className="h-px w-10 bg-brand-gold" />
          <span className="type-micro text-brand-gold">One student journey</span>
        </div>

        <div className="relative z-10 my-auto page-enter [animation-delay:100ms]">
          <div className="mb-8 max-w-[460px]">
            <Compass aria-hidden="true" className="mb-4 size-8 text-brand-gold" />
            <h2 className="text-[26px] font-semibold leading-[1.3] tracking-[-.025em]">From first conversation to campus arrival.</h2>
            <p className="mt-3 text-sm leading-6 text-border-strong">A shared control tower for every deadline, document, decision, and next step.</p>
          </div>

          <div className="max-w-[470px] rounded-panel border border-text-inverse/15 bg-text-inverse/[.055] p-5 shadow-overlay backdrop-blur-sm">
            <div className="mb-5 flex items-center justify-between border-b border-text-inverse/10 pb-4">
              <div>
                <div className="type-micro text-border-strong">Journey snapshot</div>
                <div className="mt-1 text-sm font-semibold">Fall 2027 · Germany</div>
              </div>
              <span className="rounded-full border border-brand-gold/40 bg-brand-gold/10 px-2.5 py-1 text-[11px] font-semibold text-brand-gold">On track</span>
            </div>
            <ol className="space-y-1">
              {journey.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={item.label} className="relative flex min-h-14 items-center gap-3 rounded-card px-3 py-2.5">
                    {index < journey.length - 1 && <span aria-hidden="true" className="absolute left-[29px] top-11 h-6 w-px bg-text-inverse/15" />}
                    <span className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border ${item.current ? "border-brand-gold bg-brand-gold text-brand-ink" : item.complete ? "border-text-inverse/25 bg-text-inverse/10 text-brand-gold" : "border-text-inverse/15 bg-surface-inverse text-border-strong"}`}>
                      {item.complete ? <Check aria-hidden="true" className="size-4" /> : <Icon aria-hidden="true" className="size-4" />}
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-medium">{item.label}</span>
                    <span className={`text-xs ${item.current ? "font-semibold text-brand-gold" : "text-border-strong"}`}>{item.detail}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-text-inverse/15 pt-5 text-xs leading-5 text-border-strong">
          <span>Clarity for consultants</span>
          <span className="size-1 rounded-full bg-brand-gold" />
          <span>Visibility for students</span>
          <span className="size-1 rounded-full bg-brand-gold" />
          <span>One source of truth</span>
        </div>
      </aside>
    </main>
  );
}
