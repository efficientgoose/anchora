"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { signInWithGoogleAction } from "./actions";

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-1.99 3.02v2.53h3.23c1.89-1.74 2.98-4.3 2.98-7.39Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.38l-3.23-2.53c-.9.6-2.04.96-3.39.96-2.6 0-4.81-1.76-5.6-4.13H3.06v2.61A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.4 13.92A6.02 6.02 0 0 1 6.08 12c0-.67.11-1.32.32-1.92V7.47H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.53l3.34-2.61Z" />
      <path fill="#EA4335" d="M12 5.95c1.47 0 2.79.5 3.83 1.5l2.87-2.88A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.94 5.47l3.34 2.61C7.19 7.71 9.4 5.95 12 5.95Z" />
    </svg>
  );
}

function GoogleSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="secondary"
      size="lg"
      className="w-full border-[#747775] bg-white text-[#1f1f1f] shadow-none hover:border-[#747775] hover:bg-[#f8fafd]"
      disabled={disabled || pending}
    >
      <GoogleMark />
      {pending ? "Opening Google…" : "Continue with Google"}
    </Button>
  );
}

export function GoogleAuthButton({ nextPath = "/students", disabled = false }: { nextPath?: string; disabled?: boolean }) {
  return (
    <div>
      <form action={signInWithGoogleAction}>
        <input type="hidden" name="next" value={nextPath} />
        <GoogleSubmitButton disabled={disabled} />
      </form>
      <div className="my-5 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-border-default" />
        <span className="text-[11px] font-medium uppercase tracking-[.11em] text-text-muted">or continue with email</span>
        <span className="h-px flex-1 bg-border-default" />
      </div>
    </div>
  );
}
