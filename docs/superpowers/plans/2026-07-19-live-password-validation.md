# Live Password Validation Implementation Plan

> **For agentic workers:** Execute inline in an isolated worktree. Do not create test classes or test methods.

**Goal:** Add shared real-time password validation to signup and password-reset forms and simplify the global text-input focus style.

**Architecture:** A focused `PasswordFields` client component owns both password values and touched state, renders shared feedback through `FormField`, and reports aggregate validity to its parent form. `FormField` gains a reusable typed feedback interface while existing server error and hint behavior remains compatible.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Lucide icons, Zod server actions.

---

### Task 1: Shared field feedback

- Extend `FormField` with neutral, danger, and success feedback.
- Keep existing hints and server errors compatible and give server errors display precedence.
- Connect feedback IDs, live announcements, icons, and `aria-invalid` to the field control.

### Task 2: Shared password fields

- Add `PasswordFields` under the auth feature.
- Track password values and whether each field has been edited.
- Render neutral, red, or green feedback from the two approved rules.
- Notify the parent when the password is at least eight characters and confirmation matches.

### Task 3: Integrate both password flows

- Replace duplicated password inputs in signup and update-password pages.
- Disable each submit button until live validation passes while preserving existing pending and configuration conditions.
- Keep the existing server action schemas unchanged.

### Task 4: Refine text-input focus

- Remove the gold focus ring from the shared `Input` component.
- Retain the dark focus border and danger border behavior.

### Task 5: Verify and deliver

- Run `npm run typecheck`, `npm run lint`, and `npm run build`.
- Manually exercise neutral, invalid, valid, mismatch, remismatch, disabled-submit, and keyboard-focus states.
- Review the diff for scope, commit the focused change, push it, and open a pull request for deployment monitoring.
