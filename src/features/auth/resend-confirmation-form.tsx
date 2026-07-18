"use client";

import * as React from "react";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { resendConfirmationAction, type EmailActionState } from "./actions";

const initialState: EmailActionState = { status: "idle" };

export function ResendConfirmationForm({ email, disabled = false }: { email: string; disabled?: boolean }) {
  const [state, formAction, pending] = React.useActionState(resendConfirmationAction, initialState);
  const [cooldownUntil, setCooldownUntil] = React.useState(0);
  const [now, setNow] = React.useState(0);

  React.useEffect(() => {
    if (!cooldownUntil) return;
    const interval = window.setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (currentTime >= cooldownUntil) {
        window.clearInterval(interval);
        setCooldownUntil(0);
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [cooldownUntil]);

  const secondsRemaining = cooldownUntil ? Math.max(0, Math.ceil((cooldownUntil - now) / 1000)) : 0;

  return (
    <div>
      {state.message && <Notice tone={state.status === "success" ? "success" : "danger"} className="mb-4">{state.message}</Notice>}
      <form action={formAction} onSubmit={() => { const currentTime = Date.now(); setNow(currentTime); setCooldownUntil(currentTime + 60_000); }}>
        <input type="hidden" name="email" value={email} />
        <Button type="submit" variant="secondary" className="w-full" disabled={disabled || pending || secondsRemaining > 0}>
          <RotateCw aria-hidden="true" />
          {pending ? "Sending…" : secondsRemaining > 0 ? `Send again in ${secondsRemaining}s` : "Resend confirmation email"}
        </Button>
      </form>
    </div>
  );
}
