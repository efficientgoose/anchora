import * as React from "react";
import { AlertCircle } from "lucide-react";
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
  required?: boolean;
  className?: string;
}

export function FormField({ label, children, id, hint, error, required, className }: FormFieldProps) {
  const generatedId = React.useId();
  const controlId = id ?? `field-${generatedId.replaceAll(":", "")}`;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [children.props["aria-describedby"], hintId, errorId].filter(Boolean).join(" ") || undefined;

  const control = React.cloneElement(children, {
    id: controlId,
    "aria-describedby": describedBy,
    "aria-invalid": Boolean(error),
  });

  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={controlId} className="mb-2 block text-[13px] font-semibold leading-5 text-text-secondary">
        {label}
        {required && <><span aria-hidden="true" className="ml-1 text-status-danger">*</span><span className="sr-only"> (required)</span></>}
      </label>
      {control}
      {hint && <p id={hintId} className="mt-1.5 text-xs leading-4 text-text-muted">{hint}</p>}
      {error && <p id={errorId} role="alert" className="mt-1.5 flex items-start gap-1.5 text-xs font-medium leading-4 text-status-danger"><AlertCircle aria-hidden="true" className="mt-px size-3.5 shrink-0" />{error}</p>}
    </div>
  );
}
