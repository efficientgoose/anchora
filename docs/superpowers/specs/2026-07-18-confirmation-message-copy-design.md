# Confirmation message copy design

## Goal

Make the confirmation-pending message more direct by removing the phrase "If this address can be registered".

## Approved copy

`ConfirmationPending` will display:

> A secure confirmation link is on its way to **{masked email}**.

The existing masked-email presentation remains unchanged.

## Scope

- Change only the confirmation-pending sentence.
- Keep the resend button, its existing cooldown, Supabase actions, and privacy-safe server responses unchanged.
- Do not add test classes or test methods.

## Verification

- Run TypeScript type-checking and ESLint.
- Run the production build.
- Confirm the confirmation-pending UI renders the approved sentence with the masked email.
