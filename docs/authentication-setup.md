# Anchora authentication and email rollout

Anchora supports Google sign-in, public email/password signup, mandatory email confirmation, sign-in, resend confirmation, password recovery, and Supabase administrator invitations.

The application uses Supabase SSR cookie sessions. Supabase Auth invokes the signed `send-email` Edge Function, which renders the Anchora React Email template and delivers it through Resend.

Student records in this release remain synthetic and browser-local. Do not enter real student information until database tenancy, authorization policies, audit controls, and data-protection processes are implemented.

## Production identities

| Purpose | Value |
| --- | --- |
| Canonical application URL | `https://tryanchora.com` |
| Email authentication callback | `https://tryanchora.com/auth/confirm` |
| OAuth application callback | `https://tryanchora.com/auth/callback` |
| Supabase Google callback | `https://nvkimcimfzhirbayoggn.supabase.co/auth/v1/callback` |
| Email sender | `Anchora <hello@tryanchora.com>` |
| Reply address | `hello@tryanchora.com` |
| Supabase project reference | `nvkimcimfzhirbayoggn` |
| Edge Function | `send-email` |

Resend may use `send.tryanchora.com` as a technical Return-Path for bounce handling. This does not change the user-visible sender or reply address.

## 1. Connect the application domain

1. In Vercel, add `tryanchora.com` to the Anchora project.
2. Add the DNS record Vercel provides to the `tryanchora.com` zone in Cloudflare. Use the current value from Vercel rather than copying an old example.
3. Add `www.tryanchora.com` in Vercel and redirect it to `tryanchora.com` if the `www` hostname will be shared.
4. Wait until Vercel reports a valid certificate, then verify `https://tryanchora.com` opens the application.
5. Keep `tryanchora.vercel.app` as Vercel's operational hostname, but do not use it in production authentication links.

Website records and email MX records can coexist on the same domain because they serve different DNS record types.

## 2. Receive replies with Cloudflare

1. In Cloudflare, open **Compute > Email Service > Email Routing**.
2. Add the owner's existing Gmail or Outlook address under **Destination addresses**.
3. Open Cloudflare's verification email in that inbox and verify the destination.
4. Create a routing rule for `hello@tryanchora.com` that sends to the verified destination.
5. Send a normal email to `hello@tryanchora.com` and confirm it reaches the destination inbox.

Cloudflare provides forwarding rather than a separate hosted mailbox. When manually replying from the destination inbox, the destination address may be visible unless a compatible “send as” provider is configured later.

## 3. Configure Resend sending

1. Add `tryanchora.com` under **Resend > Domains**.
2. Copy every SPF and DKIM record shown by Resend into Cloudflare DNS exactly as supplied.
3. Leave the default Return-Path at `send.tryanchora.com` unless Resend reports a conflict there.
4. Wait for both SPF and DKIM to show as verified.
5. Add a DMARC TXT record at `_dmarc.tryanchora.com`. Start in monitoring mode:

   ```text
   v=DMARC1; p=none; rua=mailto:hello@tryanchora.com
   ```

6. Disable open and click tracking for the authentication sending domain. Security links must not be rewritten.
7. Create a Resend API key restricted to sending email and keep it out of Vercel and browser environment variables.

Do not enable Resend inbound receiving on the root domain. Cloudflare Email Routing owns the root-domain inbound MX records.

## 4. Configure application environments

For local development, copy `.env.example` to `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://nvkimcimfzhirbayoggn.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SECRET_KEY=your_server_only_secret_key
```

In Vercel Production, configure:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://nvkimcimfzhirbayoggn.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
NEXT_PUBLIC_SITE_URL=https://tryanchora.com
SUPABASE_SECRET_KEY=your_server_only_secret_key
```

The Supabase publishable key is designed for public clients. The secret key powers owner-created consultant invitations and must exist only in trusted server environments. Never add a Supabase secret key or service-role key to a `NEXT_PUBLIC_` variable, browser code, logs, or screenshots.

This project intentionally uses one Supabase project. Development and preview activity therefore affects the same authentication user list and rate limits as production. Production email links always return to `tryanchora.com`.

## 5. Deploy the signed email function

Use the current Supabase CLI and discover flags with `--help` before deployment:

```bash
npx supabase login
npx supabase link --project-ref nvkimcimfzhirbayoggn
npx supabase secrets set \
  RESEND_API_KEY='re_replace_me' \
  AUTH_SITE_URL='https://tryanchora.com' \
  AUTH_EMAIL_FROM='Anchora <hello@tryanchora.com>' \
  AUTH_EMAIL_REPLY_TO='hello@tryanchora.com'
npx supabase functions deploy send-email --use-api
```

Do not enable the hook yet. First verify the function bundle deploys and inspect its logs for startup errors.

## 6. Configure the Supabase Send Email Hook

1. In Supabase, open **Authentication > Hooks**.
2. Create an HTTPS **Send Email** hook.
3. Use this function URL:

   ```text
   https://nvkimcimfzhirbayoggn.supabase.co/functions/v1/send-email
   ```

4. Generate the hook signing secret and copy it immediately.
5. Set it as an Edge Function secret, including the full `v1,whsec_` prefix:

   ```bash
   npx supabase secrets set SEND_EMAIL_HOOK_SECRET='v1,whsec_replace_me'
   ```

6. Enable the hook only after the secret is saved.
7. Trigger one controlled password-recovery email and confirm the Edge Function returns successfully before opening public signup.

The function rejects unsigned requests, logs no recipient email addresses, and returns a structured error when Resend cannot deliver. The hook replaces Supabase's built-in authentication email sender while enabled.

## 7. Configure Supabase Auth

In **Authentication > Providers > Email**:

- Enable the email provider.
- Enable email signup.
- Require email confirmation.
- Set the minimum password length to 8.
- Set **Email OTP expiration** to `86400` seconds so invitation, signup, and recovery links remain valid for 24 hours.
- Keep arbitrary password-complexity rules disabled for this release.
- Keep anonymous signup disabled.
- Keep CAPTCHA disabled for the friend-testing release.

In **Authentication > URL Configuration**:

```text
Site URL: https://tryanchora.com
Redirect URLs:
https://tryanchora.com/auth/confirm
http://localhost:3000/auth/confirm
https://tryanchora.com/auth/callback
http://localhost:3000/auth/callback
```

Do not add a broad production wildcard. Review Auth email, signup, verification, and token-refresh rate limits before inviting testers.

## 8. Configure Google sign-in

Google OAuth uses a browser redirect to Supabase and a PKCE code exchange at Anchora's `/auth/callback` route. Anchora requests only `openid`, `email`, and `profile`. It does not request Gmail, Drive, Calendar, contacts, or other Google product access, and it does not separately store Google provider tokens.

### Google Cloud

1. Create a dedicated Google Cloud project named **Anchora**.
2. Open **Google Auth Platform** and configure an external application.
3. Use Anchora's product name and logo, and set the support and developer contact address to `hello@tryanchora.com`.
4. Add these public application links:

   ```text
   Home page: https://tryanchora.com
   Privacy policy: https://tryanchora.com/privacy
   Terms of service: https://tryanchora.com/terms
   Authorized domain: tryanchora.com
   ```

5. Keep the requested scopes limited to the standard identity scopes: `openid`, `email`, and `profile`.
6. Create an **OAuth client ID** with application type **Web application**.
7. Add the authorized JavaScript origins exactly:

   ```text
   https://tryanchora.com
   http://localhost:3000
   ```

8. Add the authorized redirect URI exactly:

   ```text
   https://nvkimcimfzhirbayoggn.supabase.co/auth/v1/callback
   ```

9. Copy the client ID and client secret. The client secret belongs only in Supabase and must never be added to this repository, `.env.local`, or Vercel.

### Supabase

1. Open **Authentication > Sign In / Providers > Google**.
2. Enable Google and paste the Google client ID and client secret.
3. Save the provider, then confirm **Authentication > URL Configuration** contains both Anchora OAuth callbacks:

   ```text
   https://tryanchora.com/auth/callback
   http://localhost:3000/auth/callback
   ```

4. Keep automatic identity linking enabled. Supabase can link a Google identity to an existing account when the provider verifies the same email address. Do not implement application-side email matching or account merging.
5. Keep the Google app in testing while running the controlled checks below. Add only the owner's accounts as test users.

### Controlled activation

1. Open `/signup` and continue with a new Google account. Confirm Anchora creates the account, establishes a session, and opens `/students`.
2. Sign out, then use the same Google account from `/login`. Confirm the existing Anchora account opens without a second user record.
3. Create and confirm an email/password account, sign out, then continue with Google using the same verified email. Confirm Supabase shows one user with both email and Google identities.
4. Cancel Google consent and confirm Anchora returns to `/login` with a neutral retry message and no provider error details.
5. Start from `/login?next=/students/new`, complete Google sign-in, and confirm the safe internal destination is preserved.
6. Try a hostile `next` value such as `//example.com` and confirm Anchora falls back to `/students`.
7. Review Supabase Auth logs and Vercel function logs, then move the Google app to production and monitor the first small tester cohort before broader sharing.

The Privacy Policy and Terms of Use are early-access product drafts. Have the owner and qualified legal counsel review them before collecting real customer or student information.

## 9. User creation paths

### Google sign-in

Users can choose **Continue with Google** from `/login` or `/signup`. A first-time Google user is created automatically. A returning Google user signs in to the existing account. When Google verifies an email that already belongs to a confirmed Anchora email/password account, Supabase handles identity linking.

### Public signup

Users open `/signup`, provide their name, email, and password, then confirm the branded email. Confirmation establishes their session and opens `/students`.

### Consultancy invitation

An Anchora owner opens **Team**, enters the consultant's full name and email, and sends the invitation from the application. The database-bound flow records the target consultancy before Supabase sends the branded email. After verification, Anchora grants the Consultant role and asks the recipient to choose a password.

Do not use **Authentication > Users > Invite user** for consultancy access. Dashboard invitations do not contain Anchora's organization record and are rejected safely at confirmation.

### Direct dashboard creation

Administrators may still create a confirmed user with a password directly in Supabase. That user can sign in immediately and create a new owner consultancy through onboarding; it does not add the user to an existing consultancy. `full_name` can be stored in user metadata for display, but user metadata must never be used to grant authorization.

## 10. Deployment checkpoints

Deploy and observe one checkpoint before moving to the next:

1. **Domain foundation:** Vercel custom domain and Cloudflare reply forwarding.
2. **Email delivery:** Resend verification, Edge Function deployment, signed hook, and one controlled recovery email.
3. **Legal foundation:** public Privacy Policy and Terms of Use, with owner review before production use.
4. **Public signup:** signup, confirmation, unconfirmed-login handling, and resend confirmation.
5. **Google sign-in:** controlled test users, new account, returning account, same-email linking, cancellation, and safe redirect checks.
6. **Password recovery:** request, callback, new password, and workspace access.
7. **Consultant invitation:** apply the invitation migration, add the production-only Supabase secret, redeploy the Send Email Hook, set the 24-hour OTP expiry, then verify owner invite, resend, password setup, role, and workspace access.

At each checkpoint, monitor Supabase Auth logs, Edge Function logs, Resend delivery/bounce/suppression events, and Vercel callback errors for at least 24 hours with a small group.

If the Send Email Hook fails, disable public signup and recovery entry points, disable the hook if needed, and preserve existing password login while delivery is repaired.

## Activation checklist

- Create a new account and confirm that no session exists before email confirmation.
- Confirm the email and verify `/students` opens automatically.
- Attempt login before confirmation and request a fresh confirmation email.
- Confirm duplicate signup and recovery responses do not reveal whether an account exists.
- Request a recovery email, choose a new password, and sign in with it.
- Confirm expired and reused links return to a recovery screen instead of opening the workspace.
- Create a new user with Google and confirm `/students` opens.
- Sign in again with the same Google identity and confirm no duplicate user is created.
- Link Google to an existing confirmed email/password account with the same verified email.
- Cancel Google consent and confirm the login page shows a neutral retry message.
- Confirm both local and production OAuth callbacks are allow-listed without a production wildcard.
- Invite a new consultant from the owner's Team page, choose a password, and confirm the consultant opens the same consultancy workspace without seeing Team navigation.
- Resend a pending invitation after 60 seconds and confirm the fresh link replaces the previous one.
- Confirm a known existing account produces an owner-facing error and no pending Team row.
- Create a confirmed password user directly in Supabase and sign in normally.
- Test authentication emails on desktop and mobile with images enabled and disabled.
- Verify replies to authentication emails reach the Cloudflare forwarding destination.
- Confirm only synthetic student data is present before sharing access.
