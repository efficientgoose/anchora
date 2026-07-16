"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Clock3, LogOut, Menu, Plus, Settings, Users } from "lucide-react";
import { BrandIcon, BrandMark } from "@/components/brand/brand-mark";
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

const SIDEBAR_STORAGE_KEY = "anchora-sidebar-collapsed";
const SIDEBAR_CHANGE_EVENT = "anchora-sidebar-change";
let sidebarFallback = false;

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

function SidebarContent({ collapsed = false, onToggle }: { collapsed?: boolean; onToggle?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col bg-white">
      <div className={cn("flex h-[60px] shrink-0 items-center border-b border-slate-100", collapsed ? "justify-center px-2" : "justify-between px-4")}>
        {collapsed && onToggle ? (
          <button type="button" onClick={onToggle} aria-label="Expand sidebar" title="Expand sidebar" className="group relative flex size-10 items-center justify-center rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-brand-gold/30">
            <BrandIcon compact className="transition duration-200 group-hover:scale-75 group-hover:opacity-0 group-focus-visible:scale-75 group-focus-visible:opacity-0" />
            <span className="absolute inset-0 flex scale-75 items-center justify-center text-slate-500 opacity-0 transition duration-200 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100">
              <SidebarToggleIcon collapsed />
            </span>
          </button>
        ) : (
          <BrandMark href="/students" />
        )}
        {!collapsed && onToggle && (
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-[30px] shrink-0 rounded-lg border-slate-200 bg-white text-slate-400 shadow-none [&_svg]:size-[18px]"
            onClick={onToggle}
            aria-label="Collapse sidebar"
            aria-expanded="true"
            title="Collapse sidebar"
          >
            <SidebarToggleIcon collapsed={false} />
          </Button>
        )}
      </div>
      <nav className={cn("flex-1 py-3", collapsed ? "px-2" : "px-2.5")} aria-label="Workspace navigation">
        {navItems.map((item, index) => {
          if ("divider" in item) return <div key={`divider-${index}`} className={cn("my-2.5 h-px bg-slate-100", collapsed ? "mx-1" : "mx-2.5")} />;
          const active = item.enabled && (item.href === "/students" ? pathname === "/students" || (pathname !== "/students/new" && /^\/students\/[^/]+$/.test(pathname)) : pathname.startsWith(item.href));
          const Icon = item.icon;
          if (!item.enabled) return <span key={item.label} aria-disabled="true" title={collapsed ? item.label : undefined} className={cn("my-0.5 flex cursor-default items-center rounded-lg py-2 text-sm font-medium text-slate-300", collapsed ? "justify-center px-0" : "gap-2.5 px-3")}><Icon className="size-4" />{!collapsed && item.label}</span>;
          return <Link key={item.label} href={item.href} aria-label={collapsed ? item.label : undefined} title={collapsed ? item.label : undefined} className={cn("my-0.5 flex items-center rounded-lg py-2 text-sm font-medium transition", collapsed ? "justify-center px-0" : "gap-2.5 px-3", active ? "bg-brand-gold/15 text-brand-charcoal" : "text-slate-600 hover:bg-slate-100 hover:text-brand-charcoal")}><Icon className="size-4" />{!collapsed && item.label}</Link>;
        })}
      </nav>
      <div className={cn("flex items-center border-t border-slate-100", collapsed ? "justify-center px-1 pb-5 pt-3" : "gap-2.5 px-4 py-3")}>
        {collapsed ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button type="button" aria-label={`${ACTIVE_STAFF.name} account menu`} className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-brand-gold/30">
                <Avatar initials={initials(ACTIVE_STAFF.name)} className="size-7" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content side="right" align="end" sideOffset={8} alignOffset={-24} collisionPadding={20} className="z-[100] min-w-[140px] rounded-[10px] border border-slate-200 bg-white p-1.5 shadow-[0_10px_30px_-8px_rgba(15,23,42,.22)]">
                <DropdownMenu.Item asChild>
                  <Link href="/" className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-[13px] font-medium text-slate-700 outline-none data-[highlighted]:bg-slate-100"><LogOut className="size-3.5 text-slate-400" />Sign out</Link>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ) : (
          <>
            <Avatar initials={initials(ACTIVE_STAFF.name)} className="size-[30px]" />
            <div className="min-w-0 flex-1 leading-tight"><div className="truncate text-[13px] font-medium">{ACTIVE_STAFF.name}</div><div className="truncate text-[11px] text-slate-400">{ACTIVE_STAFF.title}</div></div>
            <Button asChild size="icon" variant="ghost" className="size-8 text-slate-400" aria-label="Sign out"><Link href="/"><LogOut /></Link></Button>
          </>
        )}
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const collapsed = React.useSyncExternalStore(subscribeToSidebarPreference, readSidebarPreference, () => false);

  const toggleSidebar = React.useCallback(() => {
    writeSidebarPreference(!collapsed);
  }, [collapsed]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className={cn("hidden shrink-0 overflow-hidden border-r border-slate-200 transition-[width] duration-200 ease-out lg:block", collapsed ? "w-[72px]" : "w-60")}><SidebarContent collapsed={collapsed} onToggle={toggleSidebar} /></aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[60px] shrink-0 items-center border-b border-slate-200 bg-white px-4 lg:hidden">
          <Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" className="mr-3" aria-label="Open navigation"><Menu /></Button></SheetTrigger><SheetContent><SidebarContent /></SheetContent></Sheet>
          <BrandMark href="/students" compact />
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
