"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;

export function SheetContent({ className, children, ...props }: React.ComponentProps<typeof Dialog.Content>) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-brand-ink/45 backdrop-blur-[2px] data-[state=closed]:animate-[fadeOut_var(--motion-instant)_ease-out] data-[state=open]:animate-[fadeIn_var(--motion-instant)_ease-out]" />
      <Dialog.Content className={cn("fixed inset-y-0 left-0 z-50 w-[280px] border-r border-border-default bg-surface text-text-primary shadow-overlay outline-none data-[state=closed]:animate-[slideOut_var(--motion-fast)_ease-in] data-[state=open]:animate-[slideIn_var(--motion-standard)_ease-out]", className)} {...props}>
        <Dialog.Title className="sr-only">Workspace navigation</Dialog.Title>
        {children}
        <Dialog.Close className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-control text-text-muted outline-none transition hover:bg-surface-muted hover:text-text-primary focus-visible:ring-[3px] focus-visible:ring-brand-gold/30" aria-label="Close navigation"><X className="size-4" /></Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
