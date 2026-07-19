"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;
export const SheetTitle = Dialog.Title;
export const SheetDescription = Dialog.Description;

export function SheetContent({
  className,
  children,
  closeLabel = "Close dialog",
  side = "left",
  ...props
}: React.ComponentProps<typeof Dialog.Content> & {
  closeLabel?: string;
  side?: "left" | "right";
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-brand-ink/45 backdrop-blur-[2px] data-[state=closed]:animate-[fadeOut_var(--motion-instant)_ease-out] data-[state=open]:animate-[fadeIn_var(--motion-instant)_ease-out]" />
      <Dialog.Content
        className={cn(
          "fixed inset-y-0 z-50 bg-surface text-text-primary shadow-overlay outline-none",
          side === "left"
            ? "left-0 w-[280px] border-r border-border-default data-[state=closed]:animate-[slideOut_var(--motion-fast)_ease-in] data-[state=open]:animate-[slideIn_var(--motion-standard)_ease-out]"
            : "right-0 w-full border-l border-border-default data-[state=closed]:animate-[slideOutRight_var(--motion-fast)_ease-in] data-[state=open]:animate-[slideInRight_var(--motion-standard)_ease-out] sm:max-w-[460px]",
          className,
        )}
        {...props}
      >
        {children}
        <Dialog.Close className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-control text-text-muted outline-none transition hover:bg-surface-muted hover:text-text-primary focus-visible:ring-[3px] focus-visible:ring-brand-gold/30" aria-label={closeLabel}><X aria-hidden="true" className="size-4" /></Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
