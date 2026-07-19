"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Clock3, Info, LogOut, Menu, Plus, Settings, Users } from "lucide-react";
import { BrandIcon, BrandMark } from "@/components/brand/brand-mark";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { StaffRole } from "@/domain/models";
import { initials } from "@/domain/student-calculations";
import { signOutAction } from "@/features/auth/actions";
import { cn } from "@/lib/cn";

const navItems = [
  { label: "Students", href: "/students", icon: Users, enabled: true },
  { label: "Add student", href: "/students/new", icon: Plus, enabled: true },
  { divider: true },
  { label: "Intakes", href: "/intakes", icon: Clock3, enabled: true },
  { label: "Reports", href: "#", icon: BarChart3, enabled: false },
  { label: "Settings", href: "#", icon: Settings, enabled: false },
] as const;

const SIDEBAR_STORAGE_KEY = "anchora-sidebar-collapsed";
const SIDEBAR_CHANGE_EVENT = "anchora-sidebar-change";
let sidebarFallback = false;

export interface WorkspaceActor {
  name: string;
  email: string;
  role: StaffRole;
  organizationName: string;
}

const roleLabels: Record<StaffRole, string> = {
  owner: "Owner",
  admin: "Admin",
  consultant: "Consultant",
};

function readSidebarPreference() {
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  } catch {
    return sidebarFallback;
  }
}

function subscribeToSidebarPreference(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === SIDEBAR_STORAGE_KEY) onStoreChange();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(SIDEBAR_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(SIDEBAR_CHANGE_EVENT, onStoreChange);
  };
}

function writeSidebarPreference(collapsed: boolean) {
  sidebarFallback = collapsed;
  try {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  } catch {
    // The in-memory fallback still works for the current session.
  }
  window.dispatchEvent(new Event(SIDEBAR_CHANGE_EVENT));
}

function SidebarToggleIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={collapsed ? "m9 18 6-6-6-6" : "m15 18-6-6 6-6"} />
    </svg>
  );
}

function SidebarContent({ actor, collapsed = false, onToggle }: { actor: WorkspaceActor; collapsed?: boolean; onToggle?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col bg-surface">
      <div className={cn("flex h-16 shrink-0 items-center border-b border-border-subtle", collapsed ? "justify-center px-2" : "justify-between px-4")}>
        {collapsed && onToggle ? (
          <button type="button" onClick={onToggle} aria-label="Expand sidebar" title="Expand sidebar" className="group relative flex size-10 items-center justify-center rounded-control text-text-muted outline-none focus-visible:ring-[3px] focus-visible:ring-brand-gold/30">
            <BrandIcon compact className="transition [transition-duration:var(--motion-fast)] group-hover:scale-75 group-hover:opacity-0 group-focus-visible:scale-75 group-focus-visible:opacity-0" />
            <span className="absolute inset-0 flex scale-75 items-center justify-center opacity-0 transition [transition-duration:var(--motion-fast)] group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100">
              <SidebarToggleIcon collapsed />
            </span>
          </button>
        ) : (
          <div className="min-w-0">
            <BrandMark href="/students" />
            <p className="ml-10 mt-0.5 truncate text-[11px] leading-4 text-text-muted" title={actor.organizationName}>{actor.organizationName}</p>
          </div>
        )}
        {!collapsed && onToggle && (
          <Button type="button" size="icon-sm" variant="secondary" className="text-text-muted shadow-none" onClick={onToggle} aria-label="Collapse sidebar" aria-expanded="true" title="Collapse sidebar">
            <SidebarToggleIcon collapsed={false} />
          </Button>
        )}
      </div>

      <nav className={cn("flex-1 py-3", collapsed ? "px-2" : "px-2.5")} aria-label="Workspace navigation">
        {navItems.map((item, index) => {
          if ("divider" in item) return <div key={`divider-${index}`} className={cn("my-2.5 h-px bg-border-subtle", collapsed ? "mx-1" : "mx-2.5")} />;
          const active = item.enabled && (item.href === "/students" ? pathname === "/students" || (pathname !== "/students/new" && /^\/students\/[^/]+$/.test(pathname)) : pathname.startsWith(item.href));
          const Icon = item.icon;
          if (!item.enabled) return <span key={item.label} aria-disabled="true" title={`${item.label} — coming soon`} className={cn("my-0.5 flex min-h-10 cursor-default items-center rounded-control text-sm font-medium text-text-muted opacity-45", collapsed ? "justify-center px-0" : "gap-2.5 px-3")}><Icon aria-hidden="true" className="size-5" />{!collapsed && <>{item.label}<span className="sr-only"> — coming soon</span></>}</span>;
          return (
            <Link key={item.label} href={item.href} aria-label={collapsed ? item.label : undefined} aria-current={active ? "page" : undefined} title={collapsed ? item.label : undefined} className={cn("relative my-0.5 flex min-h-10 items-center rounded-control text-sm font-medium transition-colors [transition-duration:var(--motion-fast)]", collapsed ? "justify-center px-0" : "gap-2.5 px-3", active ? "bg-accent-soft text-brand-ink" : "link-hover-gold text-text-secondary hover:bg-surface-muted")}>
              {active && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-brand-gold" />}
              <Icon aria-hidden="true" className="size-5" />{!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className={cn("flex items-center border-t border-border-subtle", collapsed ? "justify-center px-1 pb-5 pt-3" : "gap-2.5 px-4 py-3")}>
        {collapsed ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button type="button" aria-label={`${actor.name} account menu`} className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-brand-gold/30"><Avatar initials={initials(actor.name)} className="size-8" /></button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content side="right" align="end" sideOffset={8} alignOffset={-24} collisionPadding={20} className="z-[100] min-w-[150px] rounded-sm border border-border-default bg-surface p-1.5 text-text-secondary shadow-popover">
                <form action={signOutAction}><DropdownMenu.Item asChild><button type="submit" className="flex min-h-9 w-full cursor-pointer items-center gap-2 rounded-sm px-2.5 py-2 text-left text-[13px] font-medium outline-none data-[highlighted]:bg-surface-muted data-[highlighted]:text-text-primary"><LogOut aria-hidden="true" className="size-4 text-text-muted" />Sign out</button></DropdownMenu.Item></form>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ) : (
          <>
            <Avatar initials={initials(actor.name)} className="size-8" />
            <div className="min-w-0 flex-1 leading-tight"><div className="truncate text-[13px] font-semibold text-text-primary">{actor.name}</div><div className="truncate text-[11px] leading-4 text-text-muted" title={actor.email}>{roleLabels[actor.role]}</div></div>
            <form action={signOutAction}><Button type="submit" size="icon-sm" variant="ghost" className="text-text-muted" aria-label="Sign out"><LogOut /></Button></form>
          </>
        )}
      </div>
    </div>
  );
}

export function AppShell({ actor, children, demoData = false }: { actor: WorkspaceActor; children: React.ReactNode; demoData?: boolean }) {
  const collapsed = React.useSyncExternalStore(subscribeToSidebarPreference, readSidebarPreference, () => false);
  const toggleSidebar = React.useCallback(() => writeSidebarPreference(!collapsed), [collapsed]);

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <aside className={cn("hidden shrink-0 overflow-hidden border-r border-border-default transition-[width] [transition-duration:var(--motion-fast)] lg:block", collapsed ? "w-[72px]" : "w-64")}><SidebarContent actor={actor} collapsed={collapsed} onToggle={toggleSidebar} /></aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center border-b border-border-default bg-surface px-4 lg:hidden">
          <Sheet><SheetTrigger asChild><Button variant="ghost" size="icon-md" className="mr-3" aria-label="Open navigation"><Menu /></Button></SheetTrigger><SheetContent><SidebarContent actor={actor} /></SheetContent></Sheet>
          <BrandMark href="/students" compact />
        </header>
        <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto outline-none">
          {demoData && (
            <div className="border-b border-accent-border bg-accent-soft/60 px-4 py-2.5 text-brand-gold-strong sm:px-6">
              <div className="mx-auto flex max-w-[1440px] items-start gap-2 text-xs leading-5">
                <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                <p>You’re viewing sample students. Changes are saved only in this browser during early access.</p>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
