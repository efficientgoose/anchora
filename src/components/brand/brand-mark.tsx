import Link from "next/link";
import { cn } from "@/lib/cn";

export function BrandMark({ compact = false, className, href = "/" }: { compact?: boolean; className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 text-slate-950", className)} aria-label="Anchora home">
      <span className={cn("flex items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-[0_1px_2px_rgba(15,23,42,.12)]", compact ? "size-[22px] rounded-md text-[11px]" : "size-[30px] text-[15px]")}>A</span>
      <span className={cn("font-semibold tracking-[-.02em]", compact ? "text-[13px]" : "text-[18px]")}>Anchora</span>
    </Link>
  );
}
