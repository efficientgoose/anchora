# Student Onboarding Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Anchora's seeded browser-local students with a secure, Supabase-backed adult student onboarding flow and living Germany journey.

**Architecture:** Public student tables use organization-scoped RLS and explicit Data API grants. Mutations run through authenticated server actions and narrowly granted transactional RPCs; reads use the signed-in user's Supabase server client. A server-only launch flag and versioned legal acceptance gate protect production rollout.

**Tech Stack:** Next.js App Router, React, TypeScript, Supabase Postgres/Auth/RLS/Cron, Zod, React Hook Form, Tailwind CSS.

## Global Constraints

- Never create test classes or test methods.
- Preserve Anchora's existing Inter-based editorial design system and approved visual direction.
- Initial records cover adult India-based applicants targeting Germany.
- Readiness scoring, smart next actions, document upload, student authentication, and university-specific journeys are out of scope.
- Do not log student names, emails, phone numbers, or field values.

---

### Task 1: Database foundation

**Files:**
- Create: `supabase/migrations/<generated>_student_onboarding_foundation.sql`

**Interfaces:**
- Produces: `students`, `journey_stages`, `journey_tasks`, `student_audit_events`, `legal_acceptances`, and `organization_dpa_acceptances`.
- Produces RPCs: `create_student_with_journey`, `update_student_profile`, `update_journey_task`, `archive_student`, `restore_student`, `erase_student`, `export_student_record`, `accept_legal_documents`, and `accept_organization_dpa`.

- [ ] Create an imperative migration with `npx supabase migration new student_onboarding_foundation`.
- [ ] Add constrained enums/tables, indexed foreign keys, a case-insensitive organization/email uniqueness rule, and cascade behavior.
- [ ] Seed private Germany template version 1 with the six approved stages and editable planning-target rules.
- [ ] Add authenticated-only transactional RPC wrappers with explicit identity, membership, role, and legal-version checks.
- [ ] Enable RLS and grant only required `SELECT` access to authenticated users; keep direct table writes revoked.
- [ ] Add PII-minimized audit inserts to every mutation.
- [ ] Add the 90-day archived-student and 12-month audit cleanup function plus a daily Supabase Cron schedule.
- [ ] Review the migration for empty `search_path`, function grants, organization isolation, and rollback safety.

### Task 2: Server data boundary

**Files:**
- Create: `src/features/students/server-data.ts`
- Create: `src/features/students/actions.ts`
- Create: `src/features/legal/actions.ts`
- Modify: `src/domain/models.ts`
- Modify: `src/lib/workspace/context.ts`

**Interfaces:**
- Produces: `loadStudents`, `loadStudentOverview`, `loadStudentWorkspace`, `loadIntakeGroups`, and `loadLegalAccess`.
- Produces actions that map database error codes to stable UI states without exposing database details.

- [ ] Replace demo IDs and task shapes with UUID-backed student, journey stage, journey task, archive, planning-date, and legal-access types.
- [ ] Implement server-only launch-flag parsing with a safe disabled default.
- [ ] Add Zod parsing for every Supabase row/RPC payload.
- [ ] Implement authenticated loaders using the current workspace context and organization-scoped RLS.
- [ ] Implement create/edit/task/archive/restore/export/erase actions and safe error mapping.
- [ ] Revalidate affected student/intake routes after successful mutations.

### Task 3: Legal gates and public documents

**Files:**
- Create: `src/app/legal/accept/page.tsx`
- Create: `src/app/legal/dpa/page.tsx`
- Create: `src/app/dpa/page.tsx`
- Create: `src/features/legal/legal-acceptance-page.tsx`
- Modify: `src/app/privacy/page.tsx`
- Modify: `src/app/terms/page.tsx`
- Modify: `src/features/legal/legal-page.tsx`
- Modify: `src/app/(workspace)/layout.tsx`

**Interfaces:**
- Uses legal version `2026-07-student-data-v1`.
- Requires every user to accept Terms/acknowledge Privacy and only the owner to accept the organization DPA.

- [ ] Update the public operator identity and contact information.
- [ ] Replace synthetic-data prohibitions with adult, data-minimized student processing disclosures.
- [ ] Add the approved processor DPA, retention, subprocessor, incident, export, deletion, and governing-law terms.
- [ ] Build accessible individual and owner-only acceptance forms.
- [ ] Redirect missing individual acceptance to `/legal/accept` and missing owner DPA to `/legal/dpa`.
- [ ] Show members an owner-action-required state without exposing student content.
- [ ] Preserve the originally requested safe internal destination.

### Task 4: Empty state and Add Student wizard

**Files:**
- Modify: `src/app/(workspace)/students/page.tsx`
- Modify: `src/app/(workspace)/students/new/page.tsx`
- Rewrite: `src/features/students/add-student-page.tsx`
- Modify: `src/features/students/student-list-page.tsx`

**Interfaces:**
- Step 1 fields: `fullName`, `email`, optional `phone`, `intakeSeason`, `intakeYear`.
- Step 2 fields: `adultConfirmed`, `permissionConfirmed`.

- [ ] Load real student summaries on the server.
- [ ] Render the approved calm empty state without zero-value risk tiles or filters.
- [ ] Implement the two-step wizard with preserved values, progress semantics, keyboard focus, and responsive layout.
- [ ] Review details and the Germany journey preview before submission.
- [ ] Map duplicate-email errors to the existing student record.
- [ ] Redirect successful creation directly to `/students/{id}?created=1`.

### Task 5: Living journey and lifecycle actions

**Files:**
- Rewrite: `src/features/students/student-detail-page.tsx`
- Modify: `src/features/students/task-status-menu.tsx`
- Modify: `src/features/intakes/intakes-page.tsx`
- Move behavior from: `src/features/portal/student-portal-page.tsx`
- Create: `src/app/(workspace)/students/[studentId]/preview/page.tsx`

**Interfaces:**
- Displays six ordered journey stages and labels generated dates as planning targets.
- Supports profile correction, reassignment, task status/target updates, archive/restore, JSON export, and owner/admin erasure.

- [ ] Render the approved vertical living journey map and creation notice.
- [ ] Derive stage progress from real task state without introducing readiness scoring.
- [ ] Add accessible status and planning-target controls.
- [ ] Add archive/restore and owner/admin export/erasure controls with explicit confirmations.
- [ ] Recalculate only untouched, not-started template targets after an intake change.
- [ ] Convert the portal to an authenticated consultant preview and prevent the old public route from returning student data.
- [ ] Load intake summaries from Supabase instead of the browser repository.

### Task 6: Remove prototype state and verify

**Files:**
- Delete: `src/data/local-repositories.ts`
- Delete: `src/data/seed.ts`
- Delete or rewrite: `src/features/students/data.ts`
- Delete or rewrite: `src/features/intakes/data.ts`
- Modify: `src/domain/constants.ts`
- Modify: `src/components/layout/app-shell.tsx`
- Modify: `.env.example`
- Modify: `docs/authentication-setup.md`

**Interfaces:**
- Adds server-only `REAL_STUDENT_DATA_ENABLED`.
- Stops reading `anchora:prototype:v1`.

- [ ] Remove demo scope/staff/student dependencies and the sample-data banner.
- [ ] Clear the legacy local-storage key once without importing its contents.
- [ ] Update signup and documentation copy for the real-data gated workflow.
- [ ] Run changed-file ESLint and `npm run typecheck`.
- [ ] Run `npm run build` and `git diff --check`.
- [ ] Validate migration syntax with the available Supabase CLI/local stack; if unavailable, report the exact limitation.
- [ ] Inspect the final diff against every approved requirement and confirm no student PII is logged.
