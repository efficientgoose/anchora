# Authentication foundation

Anchora now uses Supabase email and password authentication for workspace access. This first release is intentionally limited to one manually managed owner account.

The student records shown in the app are still synthetic and stored in the browser. Do not enter real student information until the database, tenancy model, authorization rules, and audit controls are implemented.

## Configure Supabase

1. Open the Supabase project dashboard.
2. Under **Authentication > Providers > Email**, keep email and password authentication enabled.
3. Disable public user sign-ups. Accounts for this phase must be created by an administrator.
4. Under **Authentication > Users**, add the owner account and mark the email as confirmed.
5. Use a strong temporary password and change it before sharing production access.
6. Optionally add `full_name` and `title` to the owner's user metadata. Anchora falls back to the email prefix and `Workspace member` when they are absent.

Do not add a Supabase service-role key to the browser application. This release only needs the public project URL and publishable key.

## Configure environments

Copy `.env.example` to `.env.local` for local development and provide:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

Anchora currently uses one Supabase project for simplicity. Add these same two values to the hosting provider's Development, Preview, and Production environments, then redeploy so they are included in each application build.

This is appropriate while Supabase only stores the owner identity. Reconsider separate projects before real student records or destructive database migrations are introduced, because local and preview activity will otherwise affect the same backend as production.

## Activation checklist

- Visit `/login` in a private browser window and confirm the form is enabled.
- Visit `/students` while signed out and confirm the app returns to `/login`.
- Submit an incorrect password and confirm the page shows a generic error.
- Sign in with the owner account and confirm `/students` opens.
- Refresh the page and confirm the session remains active.
- Open the account menu, sign out, and confirm `/students` is protected again.
- Verify public sign-ups remain disabled in Supabase.
- Confirm only synthetic student data is present before granting access.

## Not included in this release

- Staff invitations or self-service registration
- Password reset
- Student accounts or a student portal
- Database-backed student records
- Consultancy tenancy or role-based permissions
- Audit logging

These should be shipped as separate, monitored changes after the authentication foundation is stable.
