import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function BrandMark({ compact = false, className, href = "/" }: { compact?: boolean; className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 text-slate-950", className)} aria-label="Anchora home">
      <span className={cn("relative flex shrink-0 items-center justify-center overflow-hidden", compact ? "size-6" : "size-8")}>
        <Image
          src="/anchora-logo.png"
          alt=""
          width={1254}
          height={1254}
          unoptimized
          aria-hidden="true"
          className="size-full scale-[1.42] object-contain"
        />
      </span>
      <span className={cn("font-semibold tracking-[-.02em]", compact ? "text-[13px]" : "text-[18px]")}>Anchora</span>
    </Link>
  );
}
