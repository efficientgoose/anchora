"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";

interface DataNotice { id: number; kind: "info" | "error"; message: string }

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 15_000, refetchOnWindowFocus: false }, mutations: { retry: false } } }));
  const [notice, setNotice] = React.useState<DataNotice | null>(null);

  React.useEffect(() => {
    const handle = (event: Event) => {
      const detail = (event as CustomEvent<Omit<DataNotice, "id">>).detail;
      setNotice({ ...detail, id: Date.now() });
    };
    window.addEventListener("anchora:data-notice", handle);
    return () => window.removeEventListener("anchora:data-notice", handle);
  }, []);

  React.useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {notice && (
        <div className="fixed inset-x-4 bottom-4 z-[200] ml-auto max-w-sm sm:inset-x-auto sm:bottom-5 sm:right-5">
          <Notice tone={notice.kind === "error" ? "danger" : "info"} role={notice.kind === "error" ? "alert" : "status"} className="items-center bg-surface shadow-overlay">
            <span className="flex items-center gap-2">
              <span className="min-w-0 flex-1">{notice.message}</span>
              <Button type="button" variant="ghost" size="icon-sm" className="-mr-2" onClick={() => setNotice(null)} aria-label="Dismiss message"><X /></Button>
            </span>
          </Notice>
        </div>
      )}
    </QueryClientProvider>
  );
}
