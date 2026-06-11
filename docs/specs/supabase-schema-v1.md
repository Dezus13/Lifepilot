# Supabase Schema V1

## Назначение

Этот документ проектирует целевую Supabase schema v1 для будущего user-facing storage пользовательских кейсов LifePilot.

Current MVP остается localStorage-first. Пользовательские экраны создания, анализа, результата, черновика, истории и detail view продолжают использовать `lifepilot.currentCase` и `lifepilot.caseHistory` в браузерном `localStorage`. Этот spec не реализует schema, не создает migrations, не меняет RLS policies, не подключает Supabase к user-facing flow и не меняет код.

Документ описывает target schema для следующего этапа после MVP и должен быть использован перед будущей migration/RLS implementation-задачей.

Связанные документы:

- [case-model.md](./case-model.md);
- [case-ownership-rls.md](./case-ownership-rls.md);
- [sql-rls-policy-spec.md](./sql-rls-policy-spec.md);
- [public-cases-migration-plan.md](./public-cases-migration-plan.md);
- [auth-implementation-decision.md](./auth-implementation-decision.md);
- [local-storage-to-supabase-migration.md](./local-storage-to-supabase-migration.md);
- [user-auth-spec.md](./user-auth-spec.md);
- [database-auth-model.md](./database-auth-model.md);
- [../architecture/adr-supabase-user-case-storage.md](../architecture/adr-supabase-user-case-storage.md);
- [../plans/active/supabase-user-cases-plan.md](../plans/active/supabase-user-cases-plan.md);
- [../plans/active/supabase-implementation-plan.md](../plans/active/supabase-implementation-plan.md);
- [../supabase-foundation.md](../supabase-foundation.md).

## Scope

В scope Supabase schema v1 входит проектирование:

- таблиц, нужных для MVP-level user-case storage;
- полей таблиц;
- связей между таблицами;
- ownership через `user_id`;
- индексов;
- constraints;
- timestamps;
- soft delete fields, если они нужны для безопасного будущего delete/archive/retention flow;
- idempotency fields для будущей миграции localStorage history.

Schema v1 является design target. Ее применение требует отдельной migration, RLS review, testing checklist и approval.

## Out Of Scope

Этот документ не разрешает:

- менять код;
- менять UI;
- менять routes;
- менять текущую localStorage-логику;
- создавать migrations;
- применять SQL в Supabase;
- менять существующие RLS policies;
- включать user-facing Auth;
- подключать Supabase read/write path к пользовательскому flow;
- автоматически мигрировать локальную историю;
- добавлять billing, OCR, PDF parser, file upload или external AI/API processing;
- добавлять admin-доступ к пользовательским кейсам.

## Design Principles

- `localStorage` остается рабочим хранилищем Current MVP до отдельного implementation stage.
- `auth.users.id` является канонической identity для ownership.
- `public.cases.user_id` является ownership boundary для пользовательских кейсов.
- RLS является обязательной database-level защитой.
- `anon` не должен иметь read/write access к пользовательским кейсам.
- Admin Auth Foundation не дает автоматического доступа к user cases.
- Service role key запрещен во frontend.
- Idempotency нужна до миграции localStorage history.
- Soft delete не включает user-facing delete flow без отдельного plan/spec.

## Tables Overview

Target schema v1 использует три таблицы/identity layer:

| Layer | Таблица | Статус | Назначение |
| --- | --- | --- | --- |
| Supabase Auth | `auth.users` | Managed by Supabase | Identity обычных пользователей и admin users |
| User case storage | `public.cases` | Target user-case table | Хранение user-owned кейсов |
| Admin foundation | `public.admin_users` | Existing foundation table | Allowlist для `/admin`, не ownership user cases |

`auth.users` не создается LifePilot migration. `public.admin_users` уже описана и реализована как Admin Auth Foundation. Основная будущая schema-работа для user-case storage относится к `public.cases`.

## `auth.users`

`auth.users` — системная таблица Supabase Auth.

LifePilot не создает ее вручную и не должен описывать полную Supabase Auth schema в migrations.

### Используемые поля

| Поле | Тип | Назначение |
| --- | --- | --- |
| `id` | `uuid` | Канонический user id, доступный через `auth.uid()` |
| `email` | `text` | Email пользователя, если выбран email-based auth |
| auth session metadata | Supabase-managed | Session/auth lifecycle, не app-level authorization |

### Требования

- `auth.users.id` используется как FK target для `public.cases.user_id`.
- `auth.uid()` используется в RLS policies для ownership checks.
- Email не должен быть primary ownership boundary.
- Auth session не хранится в `lifepilot.currentCase` или `lifepilot.caseHistory`.

## `public.cases`

`public.cases` — целевая таблица для будущего user-facing Supabase storage.

В текущем Supabase Foundation таблица `public.cases` уже существует без user ownership. Schema v1 описывает будущую target-структуру, которую нельзя применять без отдельной migration. Existing rows без `user_id`, если они есть, должны быть обработаны отдельным migration plan и не должны становиться видимыми ordinary authenticated users.

### Назначение

`public.cases` хранит одну пользовательскую жизненную ситуацию: исходный текст, категорию, summary, risk/priority, статус, deadline status, analysis и action plan.

### Поля

| Поле | Тип | Обязательность | Default | Назначение |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | Required | `gen_random_uuid()` | Primary key server row |
| `user_id` | `uuid` | Required for new user-owned rows | none | Owner, references `auth.users.id` |
| `title` | `text` | Nullable | none | Краткое название кейса |
| `category` | `text` | Nullable | none | Категория ситуации |
| `source_text` | `text` | Required | none | Исходный пользовательский текст |
| `summary` | `text` | Nullable | none | Краткое резюме |
| `risk_level` | `text` | Nullable | none | Уровень риска |
| `priority_level` | `text` | Nullable | none | Уровень приоритета |
| `status` | `text` | Required | `new` | Canonical case lifecycle status |
| `deadline_status` | `text` | Nullable | none | Статус найденного срока |
| `action_plan` | `jsonb` | Required | `[]` | Список шагов action plan |
| `analysis` | `jsonb` | Required | `{}` | Сохраненный результат анализа |
| `local_source_id` | `text` | Nullable | none | Stable local id для idempotent migration |
| `migration_batch_id` | `uuid` | Nullable | none | Группа будущей localStorage migration |
| `schema_version` | `integer` | Required | `1` | Версия server schema для row |
| `created_at` | `timestamptz` | Required | `now()` | Server creation timestamp |
| `updated_at` | `timestamptz` | Required | `now()` | Server update timestamp |
| `deleted_at` | `timestamptz` | Nullable | none | Soft delete marker для будущего delete/archive/retention flow |

### Field Requirements

- `user_id` обязателен для всех новых user-owned rows.
- `source_text` не должен быть пустой строкой.
- `status` должен использовать canonical values из [case-model.md](./case-model.md).
- `action_plan` должен быть JSON array.
- `analysis` должен быть JSON object.
- `local_source_id` не должен содержать sensitive text, email, document numbers или raw source text.
- `deleted_at` не означает, что user-facing delete уже реализован.
- `created_at` и `updated_at` должны быть server timestamps.
- `updated_at` должен обновляться при изменении row через trigger или эквивалентный approved mechanism.

### Constraints

Минимальные constraints для target schema v1:

| Constraint | Требование |
| --- | --- |
| Primary key | `id` |
| Foreign key | `user_id references auth.users(id) on delete cascade` |
| Not null | `id`, `user_id`, `source_text`, `status`, `action_plan`, `analysis`, `schema_version`, `created_at`, `updated_at` |
| Source text | `length(trim(source_text)) > 0` |
| Status check | `status in ('new', 'analyzed', 'action-required', 'waiting', 'completed')` |
| Risk level check | `risk_level is null or risk_level in ('low', 'medium', 'high')` |
| Priority level check | `priority_level is null or priority_level in ('low', 'medium', 'high')` |
| JSON action plan check | `jsonb_typeof(action_plan) = 'array'` |
| JSON analysis check | `jsonb_typeof(analysis) = 'object'` |
| Schema version check | `schema_version >= 1` |
| Idempotency unique | unique `(user_id, local_source_id)` where `local_source_id is not null` |

Category values should remain compatible with the current Case model:

- `Жильё`;
- `Страховка`;
- `Работа`;
- `Документы`;
- `Другое`;
- `Банк`;
- `Госорган`.

Если перед migration будет принято решение хранить canonical English category keys instead of Russian display labels, `case-model.md`, `data-storage.md`, UI mapping и migration plan должны быть обновлены до SQL changes.

### Indexes

Минимальные indexes для target schema v1:

| Index | Columns | Purpose |
| --- | --- | --- |
| `cases_pkey` | `id` | Direct lookup by primary key |
| `cases_user_created_at_idx` | `(user_id, created_at desc)` where `deleted_at is null` | История пользователя по дате создания |
| `cases_user_updated_at_idx` | `(user_id, updated_at desc)` where `deleted_at is null` | Сортировка по последнему изменению |
| `cases_user_status_idx` | `(user_id, status)` where `deleted_at is null` | Фильтр истории по статусу |
| `cases_user_priority_idx` | `(user_id, priority_level)` where `deleted_at is null` | Фильтр истории по priority |
| `cases_user_risk_idx` | `(user_id, risk_level)` where `deleted_at is null` | Фильтр истории по risk |
| `cases_user_local_source_id_uidx` | `(user_id, local_source_id)` unique where `local_source_id is not null` | Idempotency для migration/retry |

Full-text search index не входит в schema v1, потому что Current MVP search работает локально, а server-side search требует отдельного privacy/performance review.

### Soft Delete

Schema v1 включает `deleted_at`, но user-facing delete/archive/restore не входит в текущий Supabase user-case storage stage.

Назначение `deleted_at`:

- позволить будущий safe archive/delete flow без немедленного физического удаления;
- поддержать retention/recovery decision;
- исключать soft-deleted rows из обычной истории через read queries и indexes.

Требования:

- обычный read path должен по умолчанию исключать rows, где `deleted_at is not null`;
- физическое удаление чувствительных данных требует отдельного privacy/security review;
- DELETE policy остается запрещенной до отдельного delete/archive/restore plan;
- soft delete update должен быть разрешен только если будущий scope явно включает archive/delete.

## `public.admin_users`

`public.admin_users` — existing Admin Auth Foundation table для allowlist `/admin`.

Schema v1 не меняет назначение `public.admin_users` и не использует ее для ownership пользовательских кейсов.

### Поля

Каноническая структура описана в [database-auth-model.md](./database-auth-model.md):

| Поле | Тип | Обязательность | Назначение |
| --- | --- | --- | --- |
| `id` | `uuid` | Required | Primary key admin row |
| `auth_user_id` | `uuid` | Required | References `auth.users.id` |
| `email` | `text` | Required | Email admin user |
| `role` | `text` | Required | App-level role, currently only `admin` |
| `status` | `text` | Required | `active` or `disabled` |
| `created_at` | `timestamptz` | Required | Creation timestamp |
| `updated_at` | `timestamptz` | Required | Update timestamp |

### Requirements

- `public.admin_users.auth_user_id` references `auth.users.id`.
- Admin allowlist does not grant user-case ownership.
- `/admin` must not read `public.cases` without separate RLS/data-access review.
- Admin access to user cases, if ever needed, requires separate specs, policies, audit logging and privacy review.

## Relationships

Target schema relationships:

| From | To | Cardinality | Purpose |
| --- | --- | --- | --- |
| `public.cases.user_id` | `auth.users.id` | many cases to one user | User owns server-side cases |
| `public.admin_users.auth_user_id` | `auth.users.id` | zero-or-one admin row to one user | Admin allowlist validation |

No direct relationship is allowed between `public.admin_users` and `public.cases` in schema v1.

## RLS Overview

SQL-level policies must be written and reviewed before migration. Minimum policy direction:

- RLS enabled on `public.cases`.
- `anon` has no SELECT, INSERT, UPDATE or DELETE.
- `authenticated` can SELECT only rows where `user_id = auth.uid()` and `deleted_at is null`.
- `authenticated` can INSERT only rows where `user_id = auth.uid()`.
- `authenticated` can UPDATE only own rows if update is in approved scope.
- UPDATE must not allow changing `user_id` to another user.
- DELETE remains disabled until a separate delete/archive/restore plan exists.
- Rows without `user_id` are invisible to ordinary authenticated users.
- Service role is not used in frontend.

`public.admin_users` RLS remains governed by [database-auth-model.md](./database-auth-model.md) and Admin Auth Foundation docs.

## Migration Notes

Before applying schema v1, a separate migration plan must define:

- how to handle existing `public.cases` foundation rows without `user_id`;
- whether existing foundation rows are deleted, backfilled in a controlled environment, or left inaccessible;
- how to add `user_id` without exposing orphan rows;
- how to create constraints without breaking hosted project state;
- how `local_source_id` is populated from `lifepilot.caseHistory`;
- how duplicate prevention works during retry and partial success;
- how rollback disables server persistence while preserving localStorage history.

Automatic upload of localStorage history is forbidden. Local migration requires authenticated session and explicit user confirmation.

## Tables Not Included In Schema V1

Schema v1 intentionally does not add:

- `public.user_profiles`;
- `public.case_events`;
- `public.case_versions`;
- `public.case_migration_batches`;
- `public.audit_logs`;
- `public.case_shares`;
- `public.attachments`;
- billing/subscription tables;
- task/reminder tables.

Reasons:

- Current MVP does not require profiles, sharing, billing, attachments or task management.
- Event/audit/version tables need separate retention, privacy and UI requirements.
- Migration batches can be represented initially by nullable `migration_batch_id` until a separate migration observability plan requires a table.
- Adding unused tables increases RLS and operational risk.

## Acceptance Criteria

Schema v1 design is ready for future implementation planning when:

- Current MVP remains explicitly localStorage-first.
- `auth.users`, `public.cases` and `public.admin_users` roles are separated.
- `public.cases.user_id` is defined as the ownership field.
- FK relationship to `auth.users.id` is defined.
- Required fields, nullable fields and defaults are documented.
- Indexes for user history, filters and idempotency are documented.
- Constraints for status, risk, priority, JSON shape and source text are documented.
- Soft delete is documented as future-safe storage design, not current user-facing delete.
- Existing foundation rows without ownership are treated as migration risk.
- No code, UI, migration or RLS policy change is implied by this spec.

## Risks

- Adding `user_id not null` without a migration plan could break existing foundation rows.
- Incorrect RLS could expose sensitive `source_text` across users.
- Missing idempotency could duplicate cases during retry or local history migration.
- Treating Admin Auth Foundation as user-case access could violate privacy boundaries.
- Soft delete could be mistaken for implemented delete/archive UI.
- Category or status constraints could reject legacy/local data if mapping is not reviewed before migration.
- Logging schema errors with row payloads could expose sensitive case text.

## Full Audit: Tables And Purpose

### `auth.users`

Будет использоваться, но не создается LifePilot migration. Нужна для authenticated identity, `auth.uid()` and FK target for ownership. Без нее невозможно безопасно связать server case с пользователем.

### `public.cases`

Будет основной таблицей user-case storage. Нужна для хранения пользовательских кейсов в Supabase: исходный текст, summary, risk, priority, status, deadline status, analysis, action plan, ownership, timestamps, soft delete marker and idempotency metadata.

Future implementation will likely alter the existing foundation table rather than introduce a second cases table, but exact SQL must be defined in a separate migration plan.

### `public.admin_users`

Уже существует как Admin Auth Foundation. Нужна только для admin allowlist и server-side admin validation. Не является ownership model для user cases и не дает автоматического доступа к `public.cases`.
