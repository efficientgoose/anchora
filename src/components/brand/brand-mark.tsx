import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function BrandIcon({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn("relative flex shrink-0 items-center justify-center overflow-hidden", compact ? "size-6" : "size-8", className)}>
      <Image
        src="/anchora-logo.svg"
        alt=""
        width={32}
        height={32}
        sizes="32px"
        aria-hidden="true"
        unoptimized
        className="size-full scale-[1.42] object-contain"
      />
    </span>
  );
}

export function BrandMark({ compact = false, showName = true, subtitle, className, href = "/" }: { compact?: boolean; showName?: boolean; subtitle?: string; className?: string; href?: string }) {
  const showSubtitle = showName && Boolean(subtitle);

  return (
    <Link
      href={href}
      className={cn(
        "link-hover-gold min-w-0 max-w-full rounded-sm text-brand-ink",
        showSubtitle
          ? "inline-grid grid-cols-[auto_minmax(0,1fr)] grid-rows-[1.25rem_1rem] items-center gap-x-2"
          : "inline-flex items-center gap-2",
        className,
      )}
      aria-label="Anchora home"
    >
      <BrandIcon compact={compact} className={showSubtitle ? "row-span-2" : undefined} />
      {showName && <span className={cn("font-semibold tracking-[-.025em]", compact ? "text-[13px]" : "text-[18px]", showSubtitle && "self-end leading-5")}>Anchora</span>}
      {showSubtitle && <span className="min-w-0 self-start truncate text-[13px] font-medium leading-4 text-text-secondary" title={subtitle}>{subtitle}</span>}
    </Link>
  );
}
