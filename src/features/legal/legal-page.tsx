import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand/brand-mark";

export interface LegalSection {
  title: string;
  paragraphs?: string[];
  items?: string[];
}

export function LegalPage({ title, summary, sections }: { title: string; summary: string; sections: LegalSection[] }) {
  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <a href="#legal-content" className="skip-link">Skip to content</a>
      <div aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-[3px] bg-brand-gold" />
      <header className="border-b border-border-subtle bg-surface">
        <div className="mx-auto flex h-16 max-w-[1040px] items-center px-5 sm:px-7">
          <BrandMark />
          <div className="flex-1" />
          <Link href="/" className="link-hover-gold inline-flex shrink-0 items-center gap-2 text-sm font-medium text-text-secondary">
            <ArrowLeft aria-hidden="true" className="size-4" />
            <span className="hidden sm:inline">Back to Anchora</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </header>

      <main id="legal-content" tabIndex={-1} className="outline-none">
        <section className="border-b border-border-subtle bg-surface">
          <div className="mx-auto max-w-[860px] px-5 py-14 sm:px-7 sm:py-16">
            <div className="mb-5 flex size-11 items-center justify-center rounded-control border border-accent-border bg-accent-soft text-brand-gold-strong"><ShieldCheck aria-hidden="true" className="size-5" /></div>
            <div className="type-micro text-brand-gold-strong">Anchora · Early access</div>
            <h1 className="mt-3 text-[38px] font-bold leading-[1.1] tracking-[-.035em] text-brand-ink sm:text-[44px]">{title}</h1>
            <p className="mt-4 max-w-[680px] text-base leading-7 text-text-secondary">{summary}</p>
            <p className="mt-5 text-xs font-medium uppercase tracking-[.08em] text-text-muted">Effective July 18, 2026</p>
          </div>
        </section>

        <div className="mx-auto grid max-w-[1040px] gap-10 px-5 py-12 sm:px-7 lg:grid-cols-[190px_minmax(0,1fr)] lg:py-16">
          <aside className="hidden lg:block">
            <nav aria-label={`${title} sections`} className="sticky top-8 border-l border-border-default pl-5">
              <div className="type-micro mb-3 text-text-muted">On this page</div>
              <ol className="space-y-2.5 text-xs leading-5 text-text-secondary">
                {sections.map((section, index) => <li key={section.title}><a href={`#section-${index + 1}`} className="link-hover-gold">{section.title}</a></li>)}
              </ol>
            </nav>
          </aside>

          <article className="min-w-0 max-w-[680px]">
            <div className="mb-10 rounded-card border border-warning-border bg-warning-soft p-4 text-sm leading-6 text-status-warning">
              Anchora is in early access. The current workspace contains synthetic, browser-local student records. Do not enter real student or client information yet.
            </div>
            <div className="space-y-11">
              {sections.map((section, index) => (
                <section key={section.title} id={`section-${index + 1}`} className="scroll-mt-8">
                  <div className="mb-3 flex items-baseline gap-3">
                    <span className="tabular-nums text-xs font-semibold text-brand-gold-strong">{String(index + 1).padStart(2, "0")}</span>
                    <h2 className="text-xl font-semibold leading-7 tracking-[-.018em] text-brand-ink">{section.title}</h2>
                  </div>
                  <div className="space-y-3 pl-8 text-[15px] leading-7 text-text-secondary">
                    {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    {section.items && <ul className="list-disc space-y-2 pl-5 marker:text-brand-gold-strong">{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}
                  </div>
                </section>
              ))}
            </div>
          </article>
        </div>
      </main>

      <footer className="border-t border-border-subtle bg-surface">
        <div className="mx-auto flex max-w-[1040px] flex-wrap items-center gap-x-5 gap-y-2 px-5 py-7 text-xs leading-5 text-text-muted sm:px-7">
          <BrandMark compact />
          <span>© 2026 Anchora</span>
          <div className="flex-1" />
          <Link href="/privacy" className="link-hover-gold">Privacy</Link>
          <Link href="/terms" className="link-hover-gold">Terms</Link>
          <a href="mailto:hello@tryanchora.com" className="link-hover-gold">hello@tryanchora.com</a>
        </div>
      </footer>
    </div>
  );
}
