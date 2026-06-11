# Changelog LifePilot

## Назначение

Этот файл фиксирует значимые изменения проекта LifePilot. Он не заменяет specs, plans, architecture или testing, а помогает быстро понять, что изменилось и почему.

## Когда обновлять

Changelog обновляется при изменении:

- пользовательского поведения;
- MVP scope;
- specs, architecture, plans или testing workflow;
- security, Auth, Supabase, RLS или database правил;
- Git workflow, AGENTS.md или структуры документации;
- release, deploy или production-статуса.

Мелкие правки текста без изменения смысла можно не фиксировать.

## Кто обновляет

Changelog обновляет тот, кто вносит соответствующее изменение: человек или ИИ-агент.

## Записи

### 2026-06-11

- Проведен docs-only аудит перед проектированием Supabase.
- `docs/roadmap.md` разделен на Current MVP, Next Stage и Future, чтобы Supabase user storage не выглядел частью текущего MVP.
- `docs/mvp-status.md`, `docs/plans/active/mvp-roadmap.md` и `docs/testing/mvp-checklist.md` синхронизированы с local-first MVP и разделением `Открыть кейс` / `Открыть результат`.
- Документ подключения Supabase переименован в `docs/supabase-foundation.md`, чтобы убрать двусмысленность с local Supabase.
- Архивные screen-планы помечены как completed/archive reference, а не актуальный source of truth.
- `AGENTS.md` уточнен для docs-only audit-задач, где пользователь явно разрешает markdown-исправления без изменений кода.
- Создан active plan `docs/plans/active/supabase-user-cases-plan.md` для проектирования следующего после MVP этапа хранения пользовательских кейсов в Supabase без кода, migrations или подключения Supabase.
- Создан ADR `docs/architecture/adr-supabase-user-case-storage.md` для будущего Supabase user case storage: Supabase, RLS, ownership через `user_id`, localStorage fallback и отдельная миграция.
- Создан spec `docs/specs/case-ownership-rls.md` для будущей ownership/RLS-модели user-facing Supabase storage без изменений кода, schema или migrations.
- Создан spec `docs/specs/local-storage-to-supabase-migration.md` для будущего безопасного перехода от localStorage-first MVP к Supabase user-case storage: phases, dual-write, fallback, rollback, idempotency и migration rules.
- Создан checklist `docs/testing/supabase-checklist.md` как pre-implementation gate для будущего Supabase user-case storage: Auth, Database, RLS, Migration, Fallback, Security и Production Readiness.
- Создан spec `docs/specs/user-auth-spec.md` для будущего user-facing Auth flow: registration, login, logout, recovery, session lifecycle, protected routes, `auth.uid()`, RLS и отделение от Admin Auth Foundation.
- Создан runbook `docs/architecture/supabase-production-runbook.md` для будущего Supabase production stage: deployment, environment variables, rollback/recovery, outage handling, monitoring/logging, backup, retention, incident response и RLS verification.
- Создан spec `docs/specs/supabase-schema-v1.md` для будущей Supabase schema v1: MVP-level таблицы, `user_id` ownership, indexes, constraints, timestamps, soft delete и idempotency fields без кода или migrations.
- Создан active implementation plan `docs/plans/active/supabase-implementation-plan.md` для будущего Supabase user-case storage с фазами Auth decision, schema review, SQL RLS policies, migration plan, testing checklist и rollout/rollback.
- Создан spec `docs/specs/sql-rls-policy-spec.md` с SQL-level RLS policy contract для `public.cases` без executable SQL или migrations.
- Создан spec `docs/specs/public-cases-migration-plan.md` для migration strategy existing `public.cases` rows без `user_id`, orphan rows, idempotency, duplicate/conflict handling, rollback и backup/restore.
- Создан spec `docs/specs/auth-implementation-decision.md` с MVP user-facing Auth decision: Supabase Auth email + password, redirects, recovery, session lifecycle и relation to `auth.uid()`.

### 2026-06-07

- Завершен план второй user-facing функции MVP: `saved-case-local-analysis-plan.md` перенесен из `docs/plans/active/` в `docs/plans/completed/` после ручной browser-проверки.
- Завершен план первой user-facing функции MVP: `case-creation-local-storage-plan.md` перенесен из `docs/plans/active/` в `docs/plans/completed/`.
- `docs/project-map.md` дополнен основными user-facing implementation files и синхронизирован с active/completed plans.
- Уточнено fallback-поведение старых кейсов: при наличии `sourceText` локальный анализ может быть пересчитан, а отсутствующие факты показываются как `Не найдено`.
- Добавлен короткий `docs/roadmap.md`; структура разделов позднее уточнена для Current MVP, Next Stage и Future.
- Обновлен корневой `README.md` как внешний вход в проект.
- Добавлены `docs/architecture/decisions.md`, `docs/demo-script.md` и `docs/mvp-status.md`.
- Выполнен UI-polish user-facing MVP: пользовательские labels унифицированы на русский, result/detail получили более сильный summary, history cards стали легче, empty states приведены к единому стилю.

### 2026-06-06

- Синхронизирована документация после уточнения роли `AGENTS.md`, Supabase foundation и Admin Auth Foundation.
- Добавлен минимальный changelog workflow.
- Создан active plan для первой user-facing функции MVP: создание кейса и локальное сохранение в `localStorage`.
- Создан active plan для второй user-facing функции MVP: локальный анализ сохраненного кейса из истории.
- Реализован локальный анализ сохраненного кейса в detail view истории без Supabase, Auth, database или backend API.
