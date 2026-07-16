"use client";

import * as React from "react";
import { AlertCircle, ArrowRight, BookOpen, CheckCircle2, ChevronRight, Clock3, Component, Eye, FileText, Gauge, LayoutGrid, Palette, Search, ShieldCheck, Sparkles, Type } from "lucide-react";
import { BrandIcon, BrandMark } from "@/components/brand/brand-mark";
import { Breadcrumbs } from "@/components/patterns/breadcrumbs";
import { PageHeader } from "@/components/patterns/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";

const foundations = [
  { name: "Brand ink", token: "brand-ink", hex: "#18181B", className: "bg-brand-ink", text: "text-text-inverse" },
  { name: "Brand gold", token: "brand-gold", hex: "#EAB308", className: "bg-brand-gold", text: "text-brand-ink" },
  { name: "Gold text", token: "brand-gold-strong", hex: "#A16207", className: "bg-brand-gold-strong", text: "text-text-inverse" },
  { name: "Brand red", token: "brand-red", hex: "#D32F2F", className: "bg-brand-red", text: "text-text-inverse" },
  { name: "Canvas", token: "canvas", hex: "#F8FAFC", className: "bg-canvas", text: "text-text-primary" },
  { name: "Surface", token: "surface", hex: "#FFFFFF", className: "bg-surface", text: "text-text-primary" },
  { name: "Muted surface", token: "surface-muted", hex: "#F1F5F9", className: "bg-surface-muted", text: "text-text-primary" },
  { name: "Strong border", token: "border-strong", hex: "#CBD5E1", className: "bg-border-strong", text: "text-text-primary" },
];

const statuses = [
  { name: "Success", text: "#15803D", surface: "#F0FDF4", border: "#BBF7D0", className: "border-success-border bg-success-soft text-status-success" },
  { name: "Warning", text: "#B45309", surface: "#FFFBEB", border: "#FDE68A", className: "border-warning-border bg-warning-soft text-status-warning" },
  { name: "Danger", text: "#B91C1C", surface: "#FEF2F2", border: "#FECACA", className: "border-danger-border bg-danger-soft text-status-danger" },
  { name: "Information", text: "#1D4ED8", surface: "#EFF6FF", border: "#BFDBFE", className: "border-info-border bg-info-soft text-status-info" },
];

const typeScale = [
  { name: "Display XL", spec: "48 / 52 · Bold", className: "type-display-xl", sample: "Every journey, controlled." },
  { name: "Display LG", spec: "40 / 44 · Bold", className: "type-display-lg", sample: "Application control tower" },
  { name: "Page title", spec: "24 / 32 · Semibold", className: "type-page-title", sample: "Students" },
  { name: "Section title", spec: "20 / 28 · Semibold", className: "type-section-title", sample: "Global requirements" },
  { name: "Component title", spec: "16 / 24 · Semibold", className: "type-component-title", sample: "Winter 2027" },
  { name: "Body LG", spec: "16 / 26 · Regular", className: "type-body-lg", sample: "Give each journey enough context to support the next decision." },
  { name: "Body MD", spec: "14 / 22 · Regular", className: "type-body-md", sample: "Consultants see who needs attention today." },
  { name: "Body SM", spec: "13 / 20 · Regular", className: "type-body-sm", sample: "Due 17 Jul 2026 · due today" },
  { name: "Micro label", spec: "11 / 16 · Semibold", className: "type-micro", sample: "Application journey" },
];

const nav = [
  ["principles", "Principles"],
  ["color", "Color"],
  ["typography", "Typography"],
  ["scales", "Supporting scales"],
  ["components", "Components"],
  ["patterns", "Product patterns"],
  ["content", "Content"],
  ["accessibility", "Accessibility"],
] as const;

function SectionHeading({ icon: Icon, eyebrow, title, description }: { icon: typeof Palette; eyebrow: string; title: string; description: string }) {
  return (
    <div className="mb-7 flex gap-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-control border border-accent-border bg-accent-soft text-brand-gold-strong"><Icon aria-hidden="true" className="size-5" /></span>
      <div><div className="type-micro text-brand-gold-strong">{eyebrow}</div><h2 className="type-section-title mt-1">{title}</h2><p className="mt-1 max-w-3xl text-sm leading-[22px] text-text-muted">{description}</p></div>
    </div>
  );
}

function SpecLabel({ children }: { children: React.ReactNode }) {
  return <div className="type-micro mb-3 text-text-muted">{children}</div>;
}

function Swatch({ item }: { item: typeof foundations[number] }) {
  return (
    <div className="overflow-hidden rounded-card border border-border-default bg-surface shadow-subtle print-avoid-break">
      <div className={`flex h-24 items-end p-3 ${item.className} ${item.text}`}><span className="type-micro opacity-80">{item.token}</span></div>
      <div className="p-3"><div className="text-[13px] font-semibold leading-5">{item.name}</div><div className="tabular-nums mt-0.5 text-xs text-text-muted">{item.hex}</div></div>
    </div>
  );
}

function DemoRiskTile({ risk, count, copy }: { risk: "overdue" | "at_risk" | "on_track"; count: number; copy: string }) {
  return <Card className="editorial-rule" padding="sm"><div className="flex items-center justify-between"><StatusBadge risk={risk} /><span className="tabular-nums text-2xl font-bold">{count}</span></div><p className="mt-3 text-xs leading-4 text-text-muted">{copy}</p></Card>;
}

export function DesignSystemPage() {
  const [intake, setIntake] = React.useState("winter-2027");
  const [checked, setChecked] = React.useState(true);

  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <a href="#design-system-content" className="skip-link">Skip to design system</a>
      <header className="print-hidden sticky top-0 z-40 border-b border-border-default bg-surface/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center px-5 sm:px-8"><BrandMark /><Badge tone="accent" className="ml-3">Design System 1.0</Badge><div className="flex-1" /><Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex"><a href="#components">Browse components <ArrowRight /></a></Button></div>
      </header>

      <div className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)] overflow-x-hidden lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="print-hidden hidden border-r border-border-default px-5 py-8 lg:block">
          <nav aria-label="Design system sections" className="sticky top-24 space-y-1">{nav.map(([href, label], index) => <a key={href} href={`#${href}`} className="flex min-h-9 items-center gap-3 rounded-control px-3 text-[13px] font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"><span className="tabular-nums w-4 text-[10px] text-text-muted">{String(index + 1).padStart(2, "0")}</span>{label}</a>)}</nav>
        </aside>

        <main id="design-system-content" tabIndex={-1} className="min-w-0 max-w-full overflow-x-hidden outline-none">
          <section id="principles" className="relative overflow-hidden bg-surface-inverse px-5 py-16 text-text-inverse sm:px-10 sm:py-20 lg:px-16 lg:py-24">
            <div aria-hidden="true" className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:56px_56px]" />
            <div aria-hidden="true" className="absolute -right-20 -top-24 size-[360px] rounded-full border-[72px] border-brand-gold/10" />
            <div className="relative max-w-[900px]">
              <div className="flex items-center gap-3"><BrandIcon className="size-10" /><span className="type-micro text-brand-gold">Anchora Design System · 1.0</span></div>
              <h1 className="mt-8 max-w-[760px] text-[44px] font-bold leading-[1.05] tracking-[-.045em] sm:text-6xl">Precision for every student journey.</h1>
              <p className="mt-6 max-w-[700px] text-base leading-[1.7] text-border-strong">A practical design language for Anchora&apos;s application control tower — built to make urgency visible, progress legible, and complex operations feel calm.</p>
              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                <div className="border-t border-brand-gold pt-4"><div className="type-micro text-brand-gold">01 · Precise</div><p className="mt-2 text-sm leading-[22px] text-border-strong">Every label, date, and status supports an operational decision.</p></div>
                <div className="border-t border-brand-gold pt-4"><div className="type-micro text-brand-gold">02 · Calm</div><p className="mt-2 text-sm leading-[22px] text-border-strong">Urgency is factual and visible without making the workspace feel alarming.</p></div>
                <div className="border-t border-brand-gold pt-4"><div className="type-micro text-brand-gold">03 · Accountable</div><p className="mt-2 text-sm leading-[22px] text-border-strong">Students and consultants share clarity while official control stays explicit.</p></div>
              </div>
            </div>
          </section>

          <div className="space-y-0 bg-surface">
            <section id="color" className="scroll-mt-20 px-5 py-14 sm:px-10 lg:px-16 lg:py-16 print-break-before">
              <SectionHeading icon={Palette} eyebrow="Foundation 01" title="Color" description="Ink carries authority, white space creates calm, gold marks focus, and red remains a controlled signal. Feature code uses semantic roles rather than palette names." />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{foundations.map((item) => <Swatch key={item.token} item={item} />)}</div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{statuses.map((status) => <div key={status.name} className={`rounded-card border p-4 ${status.className} print-avoid-break`}><div className="font-semibold">{status.name}</div><dl className="tabular-nums mt-3 space-y-1 text-xs"><div className="flex justify-between gap-3"><dt>Text</dt><dd>{status.text}</dd></div><div className="flex justify-between gap-3"><dt>Surface</dt><dd>{status.surface}</dd></div><div className="flex justify-between gap-3"><dt>Border</dt><dd>{status.border}</dd></div></dl></div>)}</div>
              <Notice tone="warning" className="mt-8" title="Gold is a focus color">Use bright gold decoratively or with brand ink. Use the darker gold text token for copy on white surfaces.</Notice>
            </section>

            <section id="typography" className="scroll-mt-20 border-t border-border-subtle bg-canvas px-5 py-14 sm:px-10 lg:px-16 lg:py-16 print-break-before">
              <SectionHeading icon={Type} eyebrow="Foundation 02" title="Typography" description="Anchora uses Inter only. Hierarchy comes from disciplined scale, weight, rhythm, and tabular numerals — not extra font families." />
              <Card className="ds-type-scale overflow-hidden">{typeScale.map((type) => <div key={type.name} className="grid gap-2 border-b border-border-subtle px-5 py-5 last:border-b-0 sm:grid-cols-[150px_1fr] sm:px-6"><div><div className="text-[13px] font-semibold">{type.name}</div><div className="tabular-nums mt-0.5 text-xs text-text-muted">{type.spec}</div></div><div className={`${type.className} min-w-0 overflow-hidden`}>{type.sample}</div></div>)}</Card>
              <div className="mt-6 grid gap-4 sm:grid-cols-2"><Card padding="md"><SpecLabel>Dates and counts</SpecLabel><div className="tabular-nums text-[28px] font-semibold tracking-[-.025em]">17 Jul 2026 · 08 / 12</div><p className="mt-2 text-sm text-text-muted">Use tabular numerals wherever values are compared vertically or updated in place.</p></Card><Card padding="md"><SpecLabel>Sentence case</SpecLabel><div className="flex flex-wrap gap-2"><StatusBadge risk="at_risk" /><StatusBadge status="in_progress" /><StatusBadge status="not_started" /></div><p className="mt-3 text-sm text-text-muted">Use sentence case for product labels; reserve uppercase for compact structural headings.</p></Card></div>
            </section>

            <section id="scales" className="scroll-mt-20 border-t border-border-subtle px-5 py-14 sm:px-10 lg:px-16 lg:py-16 print-break-before">
              <SectionHeading icon={LayoutGrid} eyebrow="Foundation 03" title="Supporting scales" description="A four-pixel spacing grid and limited radii, elevation, motion, and icon sizes keep Anchora dense enough for operations without feeling compressed." />
              <div className="ds-print-two-col grid gap-6 lg:grid-cols-2">
                <Card padding="md"><SpecLabel>Spacing · 4px base</SpecLabel><div className="space-y-3">{[["04",4],["08",8],["12",12],["16",16],["24",24],["32",32],["48",48],["64",64]].map(([label, size]) => <div key={label} className="flex items-center gap-4"><span className="tabular-nums w-7 text-xs text-text-muted">{label}</span><span className="h-3 rounded-full bg-brand-gold" style={{width: size as number}} /><span className="text-xs text-text-muted">{size}px</span></div>)}</div></Card>
                <Card padding="md"><SpecLabel>Radius</SpecLabel><div className="grid grid-cols-3 gap-4">{[["4", "rounded-xs"],["6", "rounded-sm"],["8", "rounded-control"],["12", "rounded-card"],["16", "rounded-panel"],["Full", "rounded-full"]].map(([label, radius]) => <div key={label} className="text-center"><div className={`mx-auto size-14 border border-border-strong bg-surface-muted ${radius}`} /><div className="mt-2 text-xs text-text-muted">{label}</div></div>)}</div></Card>
                <Card padding="md"><SpecLabel>Elevation</SpecLabel><div className="grid grid-cols-3 gap-4"><div className="rounded-card border border-border-default bg-surface p-4 text-center text-xs">Flat</div><div className="rounded-card border border-border-default bg-surface p-4 text-center text-xs shadow-subtle">Subtle</div><div className="rounded-card border border-border-default bg-surface p-4 text-center text-xs shadow-popover">Popover</div></div></Card>
                <Card padding="md"><SpecLabel>Motion and icons</SpecLabel><div className="grid grid-cols-4 gap-3 text-center">{[["120","Instant"],["180","Fast"],["280","Standard"],["350","Deliberate"]].map(([value,label]) => <div key={value}><div className="tabular-nums text-lg font-semibold">{value}</div><div className="text-[11px] text-text-muted">{label}</div></div>)}</div><div className="mt-6 flex items-end justify-around border-t border-border-subtle pt-5 text-center text-xs text-text-muted"><span><Search className="mx-auto size-4 text-text-primary" />16 control</span><span><Gauge className="mx-auto size-5 text-text-primary" />20 nav</span><span><BookOpen className="mx-auto size-8 text-text-primary" />32 empty</span></div></Card>
              </div>
            </section>

            <section id="components" className="scroll-mt-20 border-t border-border-subtle bg-canvas px-5 py-14 sm:px-10 lg:px-16 lg:py-16 print-break-before">
              <SectionHeading icon={Component} eyebrow="System 01" title="Components" description="Components encode states, focus behavior, targets, and semantic tone so feature teams assemble consistent interfaces instead of restyling controls." />
              <div className="space-y-6">
                <Card className="overflow-hidden print-avoid-break"><CardHeader><h3 className="type-component-title">Buttons</h3><p className="mt-1 text-[13px] text-text-muted">One clear primary action per region.</p></CardHeader><CardContent><div className="flex flex-wrap items-center gap-3"><Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="outline">Outline</Button><Button variant="ghost">Ghost</Button><Button variant="destructive">Destructive</Button><Button disabled>Disabled</Button><Button size="icon-md" aria-label="Continue"><ChevronRight /></Button></div><div className="mt-5 flex flex-wrap items-end gap-3"><Button size="sm">Small</Button><Button size="md">Medium</Button><Button size="lg">Large</Button></div></CardContent></Card>
                <div className="ds-print-two-col grid gap-6 lg:grid-cols-2">
                  <Card className="overflow-hidden print-avoid-break"><CardHeader><h3 className="type-component-title">Badges and status</h3></CardHeader><CardContent><div className="flex flex-wrap gap-2"><Badge>Neutral</Badge><Badge tone="accent">Accent</Badge><Badge tone="info">Information</Badge><Badge tone="success">Success</Badge><Badge tone="warning">Warning</Badge><Badge tone="danger">Danger</Badge></div><div className="mt-5 flex flex-wrap gap-2"><StatusBadge risk="overdue" /><StatusBadge risk="at_risk" /><StatusBadge risk="on_track" /><StatusBadge status="not_started" /><StatusBadge status="in_progress" /><StatusBadge status="blocked" /><StatusBadge status="done" /></div></CardContent></Card>
                  <Card className="overflow-hidden print-avoid-break"><CardHeader><h3 className="type-component-title">Progress and identity</h3></CardHeader><CardContent><div className="flex items-center gap-3"><Avatar initials="PN" className="size-10" /><div><div className="text-sm font-semibold">Priya Nair</div><div className="text-xs text-text-muted">Senior consultant</div></div></div><div className="mt-6 space-y-4"><Progress value={72} label="Neutral progress" /><Progress value={52} tone="accent" label="Accent progress" /><Progress value={100} tone="success" label="Complete progress" /></div></CardContent></Card>
                </div>
                <div className="ds-print-two-col grid gap-6 lg:grid-cols-2">
                  <Card className="overflow-hidden print-avoid-break"><CardHeader><h3 className="type-component-title">Form controls</h3></CardHeader><CardContent className="space-y-4"><FormField label="Student name" required><Input placeholder="e.g. Rahul Verma" /></FormField><FormField label="Target intake"><Select ariaLabel="Target intake example" value={intake} onValueChange={setIntake} options={[{value:"winter-2027",label:"Winter 2027"},{value:"summer-2028",label:"Summer 2028"}]} /></FormField><FormField label="Work email" error="Enter a valid email address"><Input defaultValue="name@" /></FormField><div className="flex items-center gap-2.5"><Checkbox id="show-complete" checked={checked} onCheckedChange={(value) => setChecked(value === true)} /><label htmlFor="show-complete" className="text-[13px]">Show completed tasks</label></div></CardContent></Card>
                  <Card className="overflow-hidden print-avoid-break"><CardHeader><h3 className="type-component-title">Feedback states</h3></CardHeader><CardContent className="space-y-3"><Notice tone="info" title="Information">The portal is read-only for students.</Notice><Notice tone="success" title="Saved">The task status is up to date.</Notice><Notice tone="warning" title="Deadline approaching">This item is due within seven days.</Notice><Notice tone="danger" title="Status not saved">Try the update again.</Notice></CardContent></Card>
                </div>
                <div className="ds-print-two-col grid gap-6 lg:grid-cols-2">
                  <Card className="overflow-hidden print-avoid-break"><CardHeader><h3 className="type-component-title">Loading</h3></CardHeader><CardContent className="space-y-3"><Skeleton className="h-5 w-1/3" /><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></CardContent></Card>
                  <Card className="overflow-hidden print-avoid-break"><EmptyState icon={FileText} title="No documents yet" description="Uploaded documents will appear here when this capability is introduced." action={<Button variant="secondary" size="sm">Return to journey</Button>} /></Card>
                </div>
              </div>
            </section>

            <section id="patterns" className="scroll-mt-20 border-t border-border-subtle px-5 py-14 sm:px-10 lg:px-16 lg:py-16 print-break-before">
              <SectionHeading icon={Gauge} eyebrow="System 02" title="Operational patterns" description="Patterns translate the foundations into Anchora&apos;s recurring work: scanning risk, filtering a caseload, reading a journey, and acting on deadlines." />
              <Card className="overflow-hidden print-avoid-break"><CardContent><Breadcrumbs items={[{label:"Students",href:"#patterns"},{label:"Aarav Sharma"}]} /><PageHeader className="mt-5" eyebrow="Student journey" title="Aarav Sharma" description="Winter 2027 · Priya Nair" action={<Button variant="secondary" size="sm">View portal</Button>} /></CardContent></Card>
              <div className="mt-5 grid gap-4 sm:grid-cols-3"><DemoRiskTile risk="overdue" count={2} copy="A task is past due — act today" /><DemoRiskTile risk="at_risk" count={3} copy="A task is due within seven days" /><DemoRiskTile risk="on_track" count={11} copy="No urgent deadline right now" /></div>
              <Card className="mt-5 overflow-hidden print-avoid-break"><div className="flex flex-wrap items-center gap-2 border-b border-border-subtle p-3"><div className="relative min-w-[220px] flex-1"><Search aria-hidden="true" className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" /><Input size="sm" className="pl-8" placeholder="Search students…" aria-label="Search pattern example" /></div><Button variant="secondary" size="sm">All risk</Button><Button variant="secondary" size="sm">All consultants</Button></div><div className="overflow-x-auto"><div className="min-w-[600px]"><div className="grid grid-cols-[100px_1fr_170px_112px] gap-3 bg-surface-muted/50 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[.065em] text-text-muted"><span>RISK</span><span>STUDENT</span><span>NEXT DEADLINE</span><span>PROGRESS</span></div><div className="grid grid-cols-[100px_1fr_170px_112px] items-center gap-3 border-l-[3px] border-status-danger px-4 py-3"><StatusBadge risk="overdue" /><div className="flex items-center gap-2.5"><Avatar initials="AS" /><div><div className="text-[13px] font-semibold">Aarav Sharma</div><div className="text-xs text-text-muted">aarav@example.com</div></div></div><div><div className="text-[13px] font-medium">LOR 2</div><div className="tabular-nums text-xs text-status-danger">17 Jul 2026 · due today</div></div><div className="flex items-center gap-2"><span className="tabular-nums text-xs">6 / 12</span><Progress value={50} className="w-12" label="Example progress" /></div></div></div></div></Card>
              <Notice className="mt-5" tone="info" title="Responsive rule">Operational tables become stacked cards below the medium breakpoint. Content priority and actions remain unchanged.</Notice>
            </section>

            <section id="content" className="scroll-mt-20 border-t border-border-subtle bg-canvas px-5 py-14 sm:px-10 lg:px-16 lg:py-16 print-break-before">
              <SectionHeading icon={BookOpen} eyebrow="Guidance 01" title="Content and terminology" description="Anchora sounds calm, exact, and helpful. It names the state, shows the relevant date, and gives a specific recovery path." />
              <div className="ds-print-two-col grid gap-5 lg:grid-cols-2">
                <Card padding="md" className="border-success-border print-avoid-break"><div className="flex items-center gap-2 font-semibold text-status-success"><CheckCircle2 className="size-4" />Do</div><ul className="mt-4 space-y-3 text-sm leading-[22px] text-text-secondary"><li>“Status not saved. Try the update again.”</li><li>“17 Jul 2026 · due today”</li><li>“Contact Priya Nair, your assigned consultant.”</li><li>Use consultant consistently.</li></ul></Card>
                <Card padding="md" className="border-danger-border print-avoid-break"><div className="flex items-center gap-2 font-semibold text-status-danger"><AlertCircle className="size-4" />Do not</div><ul className="mt-4 space-y-3 text-sm leading-[22px] text-text-secondary"><li>“Oops! Something went wrong.”</li><li>“Urgent!!!” without an exact date</li><li>“Talk to someone for help.”</li><li>Mix consultant and counsellor.</li></ul></Card>
              </div>
              <Card className="mt-5 overflow-hidden print-avoid-break"><CardHeader><h3 className="type-component-title">Approved lifecycle labels</h3></CardHeader><CardContent><div className="flex flex-wrap gap-2"><StatusBadge risk="overdue" /><StatusBadge risk="at_risk" /><StatusBadge risk="on_track" /><StatusBadge status="not_started" /><StatusBadge status="in_progress" /><StatusBadge status="blocked" /><StatusBadge status="done" /></div></CardContent></Card>
            </section>

            <section id="accessibility" className="scroll-mt-20 border-t border-border-subtle px-5 py-14 sm:px-10 lg:px-16 lg:py-16 print-break-before">
              <SectionHeading icon={ShieldCheck} eyebrow="Guidance 02" title="Accessibility baseline" description="WCAG 2.2 AA is the product baseline. Accessibility is part of the component contract, not a finishing pass." />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  [Eye, "Contrast", "Normal text reaches 4.5:1; large text and interface graphics reach 3:1."],
                  [Clock3, "No color-only status", "Every state combines semantic color with text and an icon."],
                  [LayoutGrid, "Keyboard and focus", "Logical order, visible focus, skip links, and no keyboard traps."],
                  [Component, "Target size", "Interactive targets meet the 24 by 24 pixel WCAG minimum; primary controls are larger."],
                  [Sparkles, "Reduced motion", "Motion collapses for users who request reduced movement."],
                  [FileText, "Forms and errors", "Labels, required state, descriptions, and recovery messages are programmatically connected."],
                ].map(([Icon, title, body]) => { const ItemIcon = Icon as typeof Eye; return <Card key={title as string} padding="md" className="print-avoid-break"><ItemIcon aria-hidden="true" className="size-5 text-brand-gold-strong" /><h3 className="mt-4 font-semibold">{title as string}</h3><p className="mt-2 text-[13px] leading-5 text-text-muted">{body as string}</p></Card>; })}
              </div>
              <Card tone="inverse" padding="lg" className="mt-6 print-avoid-break"><div className="type-micro text-brand-gold">Quality gate</div><h3 className="type-section-title mt-2">Can someone understand and operate this without sight, color, precision pointing, or motion?</h3><p className="mt-3 max-w-3xl text-sm leading-[22px] text-border-strong">Verify keyboard access, VoiceOver reading order, 200% zoom, target size, focus visibility, reduced motion, and semantic landmarks on every new pattern.</p></Card>

              <div className="ds-data-viz mt-8 border-t border-border-default pt-8">
                <SpecLabel>Data visualization guidance</SpecLabel>
                <p className="max-w-3xl text-sm leading-[22px] text-text-muted">Use ink for the primary series, gold for a selected or comparative series, and semantic colors only when the data itself represents success, warning, danger, or information. Label every series directly and never depend on hue alone.</p>
                <div className="mt-5 flex h-28 items-end gap-3" aria-label="Example data visualization palette"><div className="w-16 bg-brand-ink" style={{height:"88%"}}><span className="sr-only">Primary series</span></div><div className="w-16 bg-brand-gold" style={{height:"64%"}}><span className="sr-only">Comparison series</span></div><div className="w-16 bg-status-success" style={{height:"48%"}}><span className="sr-only">Success series</span></div><div className="w-16 bg-status-warning" style={{height:"38%"}}><span className="sr-only">Warning series</span></div><div className="w-16 bg-status-danger" style={{height:"26%"}}><span className="sr-only">Danger series</span></div></div>
                <div className="mt-3 grid max-w-md grid-cols-3 gap-3 text-xs text-text-muted"><span>Ink · primary</span><span>Gold · comparison</span><span>Semantic · meaning</span></div>
                <div className="ds-print-two-col mt-6 grid gap-4 lg:grid-cols-2">
                  <Card padding="md" className="print-avoid-break"><div className="flex items-center gap-2 font-semibold text-status-success"><CheckCircle2 aria-hidden="true" className="size-4" />Use</div><ul className="mt-3 space-y-1.5 text-[13px] leading-5 text-text-secondary"><li>Direct labels beside the data.</li><li>Consistent baselines and ordering.</li><li>One highlighted comparison at a time.</li></ul></Card>
                  <Card padding="md" className="print-avoid-break"><div className="flex items-center gap-2 font-semibold text-status-danger"><AlertCircle aria-hidden="true" className="size-4" />Avoid</div><ul className="mt-3 space-y-1.5 text-[13px] leading-5 text-text-secondary"><li>Status colors used decoratively.</li><li>Meaning communicated by hue alone.</li><li>More series than the decision requires.</li></ul></Card>
                </div>
              </div>
            </section>

            <footer className="border-t border-border-default bg-surface-inverse px-5 py-10 text-text-inverse sm:px-10 lg:px-16"><div className="flex flex-wrap items-center gap-4"><BrandMark className="text-text-inverse" /><span className="type-micro text-brand-gold">Design System 1.0</span><div className="flex-1" /><span className="text-xs text-border-strong">Anchora · Application control tower</span></div></footer>
          </div>
        </main>
      </div>
    </div>
  );
}
