# ADR: Supabase user case storage

## Context

Current LifePilot MVP is local-first. User-facing case creation, analysis, result, draft, history and case detail view use `localStorage` as the working storage layer.

The repository already contains a Supabase Foundation for `public.cases`: schema/client/type foundation and a prepared `readSupabaseCases()` helper. This foundation is not connected to the user-facing flow. RLS is enabled for `public.cases`, and there is no anon SELECT policy, so browser anon clients cannot use `public.cases` as a working source of user cases.

The next stage after the current MVP is expected to introduce server-side persistence for user cases. That stage needs a clear storage decision before any code, migrations, RLS policy changes, user-facing Auth changes or UI changes are made.

This ADR supports `docs/plans/active/supabase-user-cases-plan.md`. It does not change specs, code, routes, migrations, RLS policies or the current localStorage behavior.

## Decision

LifePilot will use Supabase as the planned server persistence layer for user-facing cases in a future stage after the current MVP.

The current MVP remains localStorage-first. `localStorage` continues to be the working storage layer until a separate implementation plan, updated specs, migration plan and RLS/security review are approved.

Future Supabase user case storage will use RLS as the primary database access-control boundary. Case ownership will be modeled with a user ownership field on `public.cases`, expected to be `user_id`, tied to the authenticated Supabase Auth user.

The planned ownership rule is:

- each persisted user case belongs to exactly one authenticated user;
- RLS checks ownership through `auth.uid()`;
- users can read only their own cases;
- users can create cases only for themselves;
- updates, deletes, archive and restore behavior require explicit scope before implementation;
- Admin Auth Foundation does not automatically grant access to user cases.

Migration from `localStorage` to Supabase will be a separate stage. It must not be bundled into schema changes or first write-path implementation without explicit approval.

## Alternatives considered

### Keep only localStorage

This keeps the current MVP simple and privacy-friendly, but it cannot support multi-device access, account-based history, backup, or later production features that require server persistence.

Result: keep `localStorage` for Current MVP and fallback, but do not use it as the final production storage strategy for user cases.

### Use a custom backend database instead of Supabase

A custom backend could provide full control, but it would increase infrastructure, auth, deployment and operations complexity before the product has validated the next stage.

Result: not selected for the next stage. Supabase is already present as a foundation layer and fits the current project direction.

### Store user cases in Supabase without RLS

Application-only access control would make database safety depend on every query path being correct. That is too risky for sensitive user documents and case text.

Result: rejected. RLS is required so database-level isolation exists even if UI or query code changes later.

### Use email or client-generated user identifiers for ownership

Email can change and can leak personally identifiable information into ownership logic. Client-generated identifiers are not a reliable authorization boundary.

Result: rejected. Ownership should be tied to Supabase Auth identity via `auth.uid()` and a stable user id field.

### Migrate localStorage automatically as part of first Supabase write

Automatic migration would be convenient, but it could send sensitive local text to the server before the user clearly understands the storage change. It also increases duplication, partial failure and rollback complexity.

Result: rejected for the initial storage decision. Migration must be a separate, explicit stage.

## Consequences

- Supabase becomes the planned persistence platform for future user cases.
- Current MVP behavior remains unchanged and localStorage-first.
- User-facing Auth becomes a prerequisite for user-owned server cases.
- `public.cases` needs an ownership model before it can become a working user storage layer.
- RLS policies must be designed, reviewed and tested before server persistence is enabled.
- Future implementation must support graceful fallback when Supabase is unavailable.
- The project needs a separate migration plan before local cases are sent to Supabase.
- Specs and architecture must be updated before any implementation changes.

## Risks

- User-facing Auth and storage scope may grow too large if implemented together without phase boundaries.
- RLS mistakes could expose sensitive case data across users.
- Automatic or unclear migration could surprise users by uploading local sensitive text.
- Dual-write or sync behavior could create duplicates without idempotency planning.
- Supabase outage, missing environment variables or RLS errors could break history if local fallback is removed too early.
- Admin data access could expand accidentally if Admin Auth Foundation is treated as permission to read user cases.
- Existing `public.cases` foundation rows without ownership may need careful handling before `user_id` becomes required.

## Rollback considerations

Rollback must preserve the current local-first MVP.

Required rollback properties:

- keep `localStorage` available as a fallback during rollout;
- do not delete local history immediately after successful server writes;
- allow disabling the Supabase user case flow through a feature flag or equivalent rollout control if one is introduced;
- keep Admin Auth Foundation independent from user case storage rollback;
- avoid relying on destructive database rollback as the only recovery path;
- document whether any user cases were already persisted in Supabase before rollback;
- preserve safe empty/error states if Supabase is unavailable or disabled.

Rollback is considered feasible only if implementation phases do not remove the localStorage path before Supabase storage, RLS and migration behavior are stable.
