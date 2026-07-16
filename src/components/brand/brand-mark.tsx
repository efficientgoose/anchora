import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function BrandIcon({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn("relative flex shrink-0 items-center justify-center overflow-hidden", compact ? "size-6" : "size-8", className)}>
      <Image
        src="/anchora-logo.png"
        alt=""
        width={32}
        height={32}
        sizes="32px"
        aria-hidden="true"
        className="size-full scale-[1.42] object-contain"
      />
    </span>
  );
}

export function BrandMark({ compact = false, showName = true, className, href = "/" }: { compact?: boolean; showName?: boolean; className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 text-brand-charcoal", className)} aria-label="Anchora home">
      <BrandIcon compact={compact} />
      {showName && <span className={cn("font-semibold tracking-[-.02em]", compact ? "text-[13px]" : "text-[18px]")}>Anchora</span>}
    </Link>
  );
}
