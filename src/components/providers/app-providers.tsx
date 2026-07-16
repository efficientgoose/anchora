"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

interface Notice { id: number; kind: "info" | "error"; message: string }

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 15_000, refetchOnWindowFocus: false }, mutations: { retry: false } } }));
  const [notice, setNotice] = React.useState<Notice | null>(null);

  React.useEffect(() => {
    const handle = (event: Event) => {
      const detail = (event as CustomEvent<Omit<Notice, "id">>).detail;
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
        <div role="status" className="fixed bottom-5 right-5 z-[200] flex max-w-sm items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-[0_16px_40px_-12px_rgba(15,23,42,.28)]">
          {notice.kind === "error" ? <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-indigo-600" />}
          <span className="leading-5">{notice.message}</span>
          <button onClick={() => setNotice(null)} className="rounded p-0.5 text-slate-400 hover:bg-slate-100" aria-label="Dismiss message"><X className="size-3.5" /></button>
        </div>
      )}
    </QueryClientProvider>
  );
}
