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
      <Dialog.Overlay className="fixed inset-0 z-50 bg-brand-charcoal/35 backdrop-blur-[1px] data-[state=closed]:animate-[fadeOut_.15s_ease-out] data-[state=open]:animate-[fadeIn_.15s_ease-out]" />
      <Dialog.Content className={cn("fixed inset-y-0 left-0 z-50 w-[280px] border-r border-slate-200 bg-white shadow-xl outline-none data-[state=closed]:animate-[slideOut_.2s_ease-in] data-[state=open]:animate-[slideIn_.25s_ease-out]", className)} {...props}>
        <Dialog.Title className="sr-only">Navigation</Dialog.Title>
        {children}
        <Dialog.Close className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close navigation"><X className="size-4" /></Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
