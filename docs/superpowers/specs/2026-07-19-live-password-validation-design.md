# Live Password Validation Design

## Goal

Give users immediate, consistent feedback while creating or resetting a password, and replace the shared input glow with a quieter focus treatment.

## Behavior

- Signup and password-reset forms use the same password-field component.
- Feedback starts neutral and changes only after the relevant field is edited.
- Passwords shorter than eight characters show red feedback and an invalid border; valid lengths show green feedback.
- Mismatched confirmations show red feedback and an invalid border; exact matches show green feedback.
- Changing either value recomputes both rules immediately.
- Submit buttons remain disabled until both rules pass, in addition to their existing pending and configuration conditions.
- Existing Zod validation remains the server-side fallback.

## Presentation and Accessibility

- Reuse Anchora's existing danger and success tokens with alert and check icons, so color is not the only signal.
- Associate feedback with each input through `aria-describedby` and expose invalid state with `aria-invalid`.
- Announce feedback changes through a polite live region without moving focus.
- Remove the gold glow from the shared text input and retain a crisp `brand-ink` focus border for keyboard visibility.

## Verification

No test classes or test methods will be created. Verification consists of typecheck, lint, production build, and manual browser checks of both password flows and keyboard focus behavior.
