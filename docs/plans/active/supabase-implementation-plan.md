# Supabase User Case Storage Implementation Plan

## Назначение

Этот документ является active implementation plan для будущего этапа Supabase user-case storage.

Current MVP остается localStorage-first. Этот план не реализует код, UI, routes, schema, migrations или RLS policies. Реализация начинается только после явного утверждения этого плана пользователем.

План закрывает pre-implementation blockers:

- выбран MVP auth flow;
- определен final schema review gate;
- описан SQL-level RLS policy contract;
- описан migration plan для `public.cases`;
- определены testing gates;
- определены rollout, rollback и recovery gates.

## Scope

В scope будущей реализации после утверждения входят:

- user-facing Auth на базе Supabase Auth email + password;
- добавление user ownership к `public.cases`;
- SQL-level RLS policies для `public.cases`;
- migration существующей foundation table `public.cases` к schema v1;
- Supabase write path для новых authenticated cases;
- Supabase read path для authenticated user-owned history;
- localStorage fallback для `lifepilot.currentCase` и `lifepilot.caseHistory`;
- controlled local history migration после явного подтверждения пользователя;
- idempotency и duplicate prevention;
- rollout/rollback controls;
- testing gates для Auth, RLS, migration, fallback и recovery.

## Out Of Scope

Этот implementation plan не включает:

- изменения кода до утверждения плана;
- изменения UI до утверждения конкретной implementation-задачи;
- изменения routes до утверждения конкретной implementation-задачи;
- OCR, PDF parser, file upload;
- billing, Stripe, subscriptions;
- admin access к пользовательским кейсам;
- delete/archive/restore user-facing flow;
- service role key во frontend;
- автоматическую миграцию localStorage history без явного пользовательского подтверждения;
- удаление localStorage history после server write без отдельного retention decision.

## Source Documents

Implementation должна следовать этим документам:

- `docs/specs/auth-implementation-decision.md`;
- `docs/specs/supabase-schema-v1.md`;
- `docs/specs/sql-rls-policy-spec.md`;
- `docs/specs/public-cases-migration-plan.md`;
- `docs/specs/case-ownership-rls.md`;
- `docs/specs/local-storage-to-supabase-migration.md`;
- `docs/specs/user-auth-spec.md`;
- `docs/testing/supabase-checklist.md`;
- `docs/architecture/adr-supabase-user-case-storage.md`;
- `docs/architecture/supabase-production-runbook.md`;
- `docs/supabase-foundation.md`.

## Approval Gate

До явного утверждения этого плана запрещено:

- писать код;
- менять `app/`;
- менять `lib/`;
- менять routes;
- менять UI;
- менять config или package files;
- создавать или менять Supabase migrations;
- применять schema changes;
- применять RLS policies.

После утверждения этого плана каждая implementation phase должна выполняться последовательно. Переход к следующей фазе разрешен только после прохождения acceptance criteria предыдущей фазы.

## Phase 1: Auth Decision

Цель: зафиксировать user-facing Auth prerequisite до database write/read path.

Source of truth:

- `docs/specs/auth-implementation-decision.md`;
- `docs/specs/user-auth-spec.md`;
- `docs/specs/security-model.md`.

Требования:

- MVP auth flow: email + password.
- User-facing Auth отделен от Admin Auth Foundation.
- Login и registration не запускают local history migration автоматически.
- Logout не удаляет localStorage history и server rows.
- `auth.uid()` является canonical user id для RLS ownership.
- Auth tokens, raw JWT и passwords не сохраняются в LifePilot localStorage keys.

Exit criteria:

- выбран provider/flow;
- описаны redirects;
- описан recovery flow;
- описан session lifecycle;
- admin/user auth boundaries подтверждены.

## Phase 2: Schema Final Review

Цель: подтвердить target schema v1 перед созданием migration.

Source of truth:

- `docs/specs/supabase-schema-v1.md`;
- `docs/specs/case-model.md`;
- `docs/specs/public-cases-migration-plan.md`.

Требования:

- `public.cases.user_id` является ownership field.
- `user_id` связан с `auth.users.id`.
- Existing foundation rows без `user_id` не становятся видимыми user-facing clients.
- `local_source_id` используется для idempotency.
- `deleted_at` остается soft delete marker, а не user-facing delete flow.
- `public.admin_users` не связан напрямую с `public.cases`.

Exit criteria:

- поля, constraints и indexes сверены с schema v1;
- handling orphan rows подтвержден;
- idempotency key подтвержден;
- rollback и backup/restore approach подтверждены.

## Phase 3: SQL RLS Policies

Цель: подготовить database-level access control до user-facing storage.

Source of truth:

- `docs/specs/sql-rls-policy-spec.md`;
- `docs/specs/case-ownership-rls.md`;
- `docs/testing/supabase-checklist.md`.

Требования:

- `anon` не получает SELECT, INSERT, UPDATE или DELETE.
- `authenticated` читает только own active rows: `user_id = auth.uid()`.
- `authenticated` создает rows только для `user_id = auth.uid()`.
- `authenticated` обновляет только own rows.
- `user_id` нельзя менять через UPDATE.
- DELETE запрещен до отдельного delete/archive/restore plan.
- Admin Auth Foundation не обходит user ownership.
- Service role key не используется во frontend.

Exit criteria:

- policy contract reviewed;
- negative test cases покрывают чужой read/update/delete, anon access и admin boundary;
- RLS rejection behavior описан как safe failure.

## Phase 4: Migration Plan

Цель: подготовить безопасный переход foundation `public.cases` к user-owned schema v1.

Source of truth:

- `docs/specs/public-cases-migration-plan.md`;
- `docs/specs/local-storage-to-supabase-migration.md`;
- `docs/architecture/supabase-production-runbook.md`.

Требования:

- migration не отправляет localStorage data в Supabase автоматически;
- existing rows без `user_id` переводятся в safe orphan handling state;
- idempotency для local history migration основана на `(user_id, local_source_id)`;
- duplicate/conflict handling описан до local history migration;
- backup/restore gate выполнен до irreversible changes;
- rollback отключает server persistence без удаления local history.

Exit criteria:

- migration sequence reviewed;
- orphan rows handling approved;
- duplicate/conflict behavior approved;
- rollback path approved;
- backup/restore check approved.

## Phase 5: Testing Checklist

Цель: подтвердить, что implementation можно проверить до rollout.

Source of truth:

- `docs/testing/supabase-checklist.md`;
- `docs/specs/sql-rls-policy-spec.md`;
- `docs/specs/public-cases-migration-plan.md`;
- `docs/specs/auth-implementation-decision.md`.

Требования:

- Auth checks покрывают registration, login, logout, recovery и session expiry.
- Database checks покрывают schema, ownership fields, indexes, constraints и idempotency.
- RLS checks покрывают positive и negative cases.
- Migration checks покрывают explicit confirmation, duplicate prevention и partial success.
- Fallback checks покрывают Supabase outage, network failure, auth failure и RLS rejection.
- Security checks подтверждают отсутствие service role key во frontend.

Exit criteria:

- checklist привязан к implementation task;
- `npm run build` должен пройти после code changes;
- manual QA notes готовы для Auth, RLS, migration, fallback и rollback.

## Phase 6: Rollout And Rollback

Цель: включить Supabase user-case storage контролируемо и обратимо.

Source of truth:

- `docs/architecture/supabase-production-runbook.md`;
- `docs/specs/local-storage-to-supabase-migration.md`;
- `docs/specs/public-cases-migration-plan.md`.

Требования:

- staged rollout или equivalent rollout control определен до enablement;
- localStorage fallback остается доступным;
- Supabase write path можно отключить без destructive schema rollback;
- Supabase read path можно отключить без потери локальной истории;
- recovery не требует отключения RLS;
- monitoring/logging не содержит PII, secrets, source text или raw Supabase errors with sensitive context.

Exit criteria:

- rollback procedure reviewed;
- recovery procedure reviewed;
- data retention/account deletion decision approved;
- incident response owner identified before production rollout.

## Implementation Acceptance Criteria

Implementation stage может начаться только если:

- этот plan явно утвержден пользователем;
- `auth-implementation-decision.md` создан и согласован;
- `supabase-schema-v1.md` принят как target schema;
- `sql-rls-policy-spec.md` создан и согласован;
- `public-cases-migration-plan.md` создан и согласован;
- `supabase-checklist.md` используется как testing gate;
- `supabase-production-runbook.md` используется как rollout/rollback gate;
- Current MVP localStorage-first behavior остается source of recovery.

Implementation stage не считается завершенным, пока:

- code changes выполнены только в утвержденном scope;
- migrations применены только после review;
- RLS positive/negative tests пройдены;
- localStorage fallback проверен;
- `npm run build` проходит;
- docs, project map и changelog обновлены после реализации.
