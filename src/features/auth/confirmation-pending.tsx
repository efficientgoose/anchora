import Link from "next/link";
import { MailCheck } from "lucide-react";
import { ResendConfirmationForm } from "./resend-confirmation-form";

function maskEmail(email: string) {
  const [localPart, domain] = email.split("@");
  if (!domain) return email;
  const visible = localPart.length > 1 ? localPart.slice(0, 2) : localPart.slice(0, 1);
  return `${visible}${"•".repeat(Math.min(4, Math.max(2, localPart.length - visible.length)))}@${domain}`;
}

export function ConfirmationPending({ email }: { email: string }) {
  return (
    <div>
      <div className="rounded-panel border border-accent-border bg-accent-soft/55 p-5">
        <span className="flex size-11 items-center justify-center rounded-full bg-brand-gold text-brand-ink shadow-subtle">
          <MailCheck aria-hidden="true" className="size-5" />
        </span>
        <h2 className="mt-4 text-base font-semibold tracking-[-.015em]">Check your inbox</h2>
        <p className="mt-1.5 text-sm leading-[22px] text-text-secondary">If this address can be registered, a secure confirmation link is on its way to <strong className="font-semibold text-text-primary">{maskEmail(email)}</strong>.</p>
        <div className="mt-4 border-t border-accent-border/70 pt-4 text-xs leading-5 text-text-muted">
          Open the email on this device, then select <strong className="font-semibold text-text-secondary">Confirm my email</strong>. The link signs you in and opens your workspace.
        </div>
      </div>
      <div className="mt-5"><ResendConfirmationForm email={email} /></div>
      <p className="mt-5 text-center text-[13px] leading-5 text-text-muted">Already confirmed? <Link href="/login" className="link-hover-gold font-semibold text-text-primary underline decoration-border-strong underline-offset-4">Sign in</Link></p>
    </div>
  );
}
