import * as React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";

type FieldControlProps = {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
};

export interface FormFieldProps {
  label: string;
  children: React.ReactElement<FieldControlProps>;
  id?: string;
  hint?: string;
  error?: string;
  feedback?: {
    message: string;
    tone: "neutral" | "danger" | "success";
  };
  required?: boolean;
  className?: string;
}

export function FormField({ label, children, id, hint, error, feedback, required, className }: FormFieldProps) {
  const generatedId = React.useId();
  const controlId = id ?? `field-${generatedId.replaceAll(":", "")}`;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const activeFeedback = error ? undefined : feedback;
  const feedbackId = activeFeedback ? `${controlId}-feedback` : undefined;
  const describedBy = [children.props["aria-describedby"], hintId, feedbackId, errorId].filter(Boolean).join(" ") || undefined;
  const invalid = Boolean(error || activeFeedback?.tone === "danger" || children.props["aria-invalid"]);

  const control = React.cloneElement(children, {
    id: controlId,
    "aria-describedby": describedBy,
    "aria-invalid": invalid,
  });

  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={controlId} className="mb-2 block text-[13px] font-semibold leading-5 text-text-secondary">
        {label}
        {required && <><span aria-hidden="true" className="ml-1 text-status-danger">*</span><span className="sr-only"> (required)</span></>}
      </label>
      {control}
      {hint && <p id={hintId} className="mt-1.5 text-xs leading-4 text-text-muted">{hint}</p>}
      {activeFeedback && (
        <p
          id={feedbackId}
          aria-live="polite"
          aria-atomic="true"
          className={cn(
            "mt-1.5 flex items-start gap-1.5 text-xs leading-4 transition-colors [transition-duration:var(--motion-fast)]",
            activeFeedback.tone === "danger" && "font-medium text-status-danger",
            activeFeedback.tone === "success" && "font-medium text-status-success",
            activeFeedback.tone === "neutral" && "text-text-muted",
          )}
        >
          {activeFeedback.tone === "danger" && <AlertCircle aria-hidden="true" className="mt-px size-3.5 shrink-0" />}
          {activeFeedback.tone === "success" && <CheckCircle2 aria-hidden="true" className="mt-px size-3.5 shrink-0" />}
          {activeFeedback.message}
        </p>
      )}
      {error && <p id={errorId} role="alert" className="mt-1.5 flex items-start gap-1.5 text-xs font-medium leading-4 text-status-danger"><AlertCircle aria-hidden="true" className="mt-px size-3.5 shrink-0" />{error}</p>}
    </div>
  );
}
