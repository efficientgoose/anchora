"use client";

import * as React from "react";
import { FormField, type FormFieldProps } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

type Feedback = NonNullable<FormFieldProps["feedback"]>;

export interface PasswordFieldsProps {
  disabled?: boolean;
  passwordLabel?: string;
  confirmPasswordLabel?: string;
  passwordPlaceholder?: string;
  confirmPasswordPlaceholder?: string;
  passwordError?: string;
  confirmPasswordError?: string;
  className?: string;
  onValidityChange: (valid: boolean) => void;
}

const neutralPasswordFeedback: Feedback = { tone: "neutral", message: "Use at least 8 characters." };
const neutralMatchFeedback: Feedback = { tone: "neutral", message: "Passwords must match." };

export function PasswordFields({
  disabled = false,
  passwordLabel = "Password",
  confirmPasswordLabel = "Confirm password",
  passwordPlaceholder = "Create a password",
  confirmPasswordPlaceholder = "Repeat your password",
  passwordError,
  confirmPasswordError,
  className,
  onValidityChange,
}: PasswordFieldsProps) {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordTouched, setPasswordTouched] = React.useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = React.useState(false);

  const passwordValid = password.length >= 8;
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  React.useEffect(() => {
    onValidityChange(passwordValid && passwordsMatch);
  }, [onValidityChange, passwordValid, passwordsMatch]);

  const passwordFeedback: Feedback = !passwordTouched
    ? neutralPasswordFeedback
    : passwordValid
      ? { tone: "success", message: "Password has at least 8 characters." }
      : { tone: "danger", message: "Use at least 8 characters." };

  const matchFeedback: Feedback = !confirmPasswordTouched
    ? neutralMatchFeedback
    : passwordsMatch
      ? { tone: "success", message: "Passwords match." }
      : { tone: "danger", message: "Passwords do not match." };

  return (
    <div className={cn("space-y-4", className)}>
      <FormField
        label={passwordLabel}
        required
        error={passwordTouched ? undefined : passwordError}
        feedback={passwordFeedback}
      >
        <Input
          name="password"
          type="password"
          placeholder={passwordPlaceholder}
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(event) => {
            setPasswordTouched(true);
            setPassword(event.target.value);
          }}
          disabled={disabled}
        />
      </FormField>
      <FormField
        label={confirmPasswordLabel}
        required
        error={confirmPasswordTouched ? undefined : confirmPasswordError}
        feedback={matchFeedback}
      >
        <Input
          name="confirmPassword"
          type="password"
          placeholder={confirmPasswordPlaceholder}
          required
          minLength={8}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPasswordTouched(true);
            setConfirmPassword(event.target.value);
          }}
          disabled={disabled}
        />
      </FormField>
    </div>
  );
}
