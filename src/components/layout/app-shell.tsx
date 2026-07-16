"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Clock3, LogOut, Menu, Plus, Settings, Users } from "lucide-react";
import { BrandMark } from "@/components/brand/brand-mark";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ACTIVE_STAFF } from "@/domain/constants";
import { initials } from "@/domain/student-calculations";
import { cn } from "@/lib/cn";

const navItems = [
  { label: "Students", href: "/students", icon: Users, enabled: true },
  { label: "Add Student", href: "/students/new", icon: Plus, enabled: true },
  { divider: true },
  { label: "Intakes", href: "/intakes", icon: Clock3, enabled: true },
  { label: "Reports", href: "#", icon: BarChart3, enabled: false },
  { label: "Settings", href: "#", icon: Settings, enabled: false },
] as const;

function SidebarContent() {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-[60px] shrink-0 items-center border-b border-slate-100 px-5"><BrandMark href="/students" /></div>
      <nav className="flex-1 px-2.5 py-3" aria-label="Workspace navigation">
        {navItems.map((item, index) => {
          if ("divider" in item) return <div key={`divider-${index}`} className="mx-2.5 my-2.5 h-px bg-slate-100" />;
          const active = item.enabled && (item.href === "/students" ? pathname === "/students" || /^\/students\/[^/]+$/.test(pathname) : pathname.startsWith(item.href));
          const Icon = item.icon;
          if (!item.enabled) return <span key={item.label} aria-disabled="true" className="my-0.5 flex cursor-default items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-300"><Icon className="size-4" />{item.label}</span>;
          return <Link key={item.label} href={item.href} className={cn("my-0.5 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition", active ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")}><Icon className="size-4" />{item.label}</Link>;
        })}
      </nav>
      <div className="flex items-center gap-2.5 border-t border-slate-100 px-4 py-3">
        <Avatar initials={initials(ACTIVE_STAFF.name)} className="size-[30px]" />
        <div className="min-w-0 flex-1 leading-tight"><div className="truncate text-[13px] font-medium">{ACTIVE_STAFF.name}</div><div className="truncate text-[11px] text-slate-400">{ACTIVE_STAFF.title}</div></div>
        <Button asChild size="icon" variant="ghost" className="size-8 text-slate-400" aria-label="Sign out"><Link href="/"><LogOut /></Link></Button>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 lg:block"><SidebarContent /></aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[60px] shrink-0 items-center border-b border-slate-200 bg-white px-4 lg:hidden">
          <Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" className="mr-3" aria-label="Open navigation"><Menu /></Button></SheetTrigger><SheetContent><SidebarContent /></SheetContent></Sheet>
          <BrandMark href="/students" compact />
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
