# Public Cases Migration Plan

## Назначение

Этот документ описывает migration strategy для перехода существующей foundation table `public.cases` к будущей user-owned Supabase schema v1.

Документ не создает migrations, SQL, schema changes или code changes. Он фиксирует порядок и правила, которые должны быть использованы в отдельной implementation-задаче после утверждения active implementation plan.

Current MVP остается localStorage-first. Миграция database schema не должна автоматически отправлять `lifepilot.currentCase` или `lifepilot.caseHistory` в Supabase.

## Scope

В scope входит:

- handling существующих `public.cases` rows без `user_id`;
- orphan rows strategy;
- idempotency и duplicate prevention;
- duplicate/conflict handling;
- rollback strategy;
- backup/restore gate;
- migration sequencing;
- validation и testing gates;
- запрет автоматической localStorage migration.

## Out Of Scope

Этот документ не включает:

- executable SQL;
- создание migrations;
- изменение кода;
- изменение UI;
- изменение routes;
- применение RLS policies;
- автоматическую миграцию localStorage history;
- delete/archive/restore user-facing flow;
- admin access к пользовательским кейсам.

## Current State

Текущее состояние foundation:

- `public.cases` существует как Supabase Foundation table;
- текущая foundation schema не имеет user ownership;
- RLS включен;
- anon SELECT policy отсутствует;
- user-facing UI не читает и не пишет `public.cases`;
- рабочий Current MVP использует `localStorage`.

## Target State

Target schema v1 описана в `docs/specs/supabase-schema-v1.md`.

Минимальный target state:

- `public.cases.user_id` существует как ownership field;
- `user_id` связан с `auth.users.id`;
- new user-owned rows требуют `user_id`;
- rows без `user_id` не видны ordinary authenticated users;
- `(user_id, local_source_id)` предотвращает duplicate migrated rows;
- read path исключает rows, где `deleted_at is not null`;
- `public.admin_users` не связан напрямую с `public.cases`.

## Existing Rows Without `user_id`

Existing rows без `user_id` должны считаться orphan foundation rows до отдельного решения.

Правила:

- orphan rows не должны становиться видимыми ordinary authenticated users;
- orphan rows не должны автоматически присваиваться первому вошедшему пользователю;
- orphan rows не должны связываться по email, title, timestamp или source text;
- orphan rows не должны мигрироваться в user-owned state без подтвержденного owner;
- если rows являются тестовыми foundation rows, их судьба должна быть решена до production rollout;
- если rows содержат реальные данные, нужен separate privacy/security review.

Допустимые стратегии перед production rollout:

- оставить orphan rows inaccessible под RLS;
- удалить test-only rows после backup и approval;
- backfill только controlled rows, если owner доказан вне client-side данных;
- перенести rows в отдельный maintenance/archive state только после отдельного review.

## Migration Sequence

Порядок должен быть фазовым:

1. Подтвердить backup/restore gate для hosted Supabase project.
2. Проверить текущее состояние `public.cases` и наличие rows без `user_id`.
3. Классифицировать existing rows: none, test-only, real/unknown.
4. Принять orphan rows decision.
5. Подготовить target schema changes из `supabase-schema-v1.md`.
6. Подготовить RLS policies по `sql-rls-policy-spec.md`.
7. Проверить migration на non-production или controlled environment.
8. Применить migration только после approval.
9. Проверить RLS positive/negative cases.
10. Включать user-facing write/read path только после successful verification.

## Idempotency

Idempotency нужна для:

- retry после network timeout;
- повторной попытки server write;
- будущей local history migration;
- recovery после partial success.

Target idempotency model:

- `local_source_id` хранит stable local case id;
- `local_source_id` не содержит source text, email, case numbers или sensitive data;
- unique constraint по `(user_id, local_source_id)` предотвращает duplicate rows для одного пользователя;
- retry должен искать existing server row or rely on unique rejection handling;
- unknown write state должен разрешаться через approved reconciliation flow.

## Duplicate Handling

Duplicate считается возможным, если:

- один local case повторно записан под тем же user;
- network timeout скрыл successful server write;
- migration partial success была повторена;
- local history содержит старые duplicate local ids.

Правила:

- same `(user_id, local_source_id)` не должен создавать вторую server row;
- duplicates с разными `local_source_id` не должны автоматически merge-иться;
- title, source text, timestamp и category не являются достаточным duplicate key;
- потенциальные semantic duplicates должны быть помечены для future conflict resolution flow;
- automatic deletion duplicate rows запрещен без review.

## Conflict Handling

Conflict возникает, если local и server версии одного кейса расходятся.

Initial implementation rules:

- automatic merge запрещен;
- server row не должен перезаписывать local history без explicit user action;
- local history не удаляется после conflict;
- conflicting records должны быть сохранены в safe state;
- UI/UX conflict resolution требует отдельного approved scope, если будет реализован.

Минимальный safe behavior:

- сохранить local row;
- сохранить server row;
- не создавать дополнительные duplicates при retry;
- показать safe unavailable/needs-review state, если UI scope это включает.

## LocalStorage Migration Boundary

Database migration и localStorage history migration — разные этапы.

Правила:

- database schema migration не читает `lifepilot.currentCase`;
- database schema migration не читает `lifepilot.caseHistory`;
- localStorage data не отправляется в Supabase автоматически;
- local history migration требует authenticated session;
- local history migration требует explicit user confirmation;
- retry local history migration должен быть idempotent.

## Rollback Strategy

Rollback должен возвращать user-facing flow к localStorage behavior.

Требования:

- отключить Supabase write path через rollout control, если он включен;
- отключить Supabase read path как рабочий source of history;
- оставить `lifepilot.currentCase` доступным;
- оставить `lifepilot.caseHistory` доступной;
- не удалять local history;
- не удалять server rows без data-retention decision;
- не отключать RLS для восстановления UI;
- не использовать service role key во frontend;
- не полагаться на destructive schema rollback как единственный recovery path.

## Initial Data Retention Rule

Для initial Supabase user-case storage implementation действует минимальное retention rule:

- localStorage history не удаляется автоматически после server write;
- server rows не удаляются автоматически при rollback;
- migrated server rows сохраняются до отдельного user-facing delete/archive/restore или account deletion scope;
- backups не очищаются вручную без approved retention procedure;
- account deletion behavior не включается в initial implementation UI;
- `on delete cascade` из schema v1 рассматривается как database-level behavior для удаления Supabase Auth user, но user-facing account deletion должен быть отдельным privacy/security scope до включения в продукт.

Это правило закрывает initial implementation decision. Более подробная production retention policy может быть утверждена перед production rollout в рамках `docs/architecture/supabase-production-runbook.md`.

## Backup And Restore Gate

Перед migration должно быть подтверждено:

- backup mechanism для Supabase project известен;
- restore path проверен на non-production или controlled environment;
- rollback не зависит только от restore;
- backup access ограничен least privilege;
- backup не используется как способ обхода RLS;
- backup handling согласован с data retention decision.

## Validation Gates

До enablement:

- existing rows classified;
- orphan rows decision approved;
- schema changes reviewed against `supabase-schema-v1.md`;
- RLS policy contract reviewed against `sql-rls-policy-spec.md`;
- unique/idempotency behavior tested;
- auth session ownership tested;
- anon access tested;
- admin boundary tested;
- rollback tested.

После migration:

- `anon` не получает доступ к `public.cases`;
- authenticated user видит только own rows;
- rows без `user_id` invisible to ordinary authenticated users;
- duplicate retry не создает secondary rows;
- localStorage MVP flow продолжает работать.

## Acceptance Criteria

Migration plan готов к implementation, если:

- existing rows без `user_id` имеют explicit orphan strategy;
- localStorage data не мигрируется автоматически;
- idempotency model определена через `(user_id, local_source_id)`;
- duplicate handling описан;
- conflict handling описан без automatic merge;
- rollback сохраняет localStorage fallback;
- backup/restore gate описан;
- service role key запрещен во frontend;
- document содержит no executable SQL.

## Related Documents

- [supabase-schema-v1.md](./supabase-schema-v1.md);
- [sql-rls-policy-spec.md](./sql-rls-policy-spec.md);
- [local-storage-to-supabase-migration.md](./local-storage-to-supabase-migration.md);
- [case-ownership-rls.md](./case-ownership-rls.md);
- [../architecture/supabase-production-runbook.md](../architecture/supabase-production-runbook.md);
- [../testing/supabase-checklist.md](../testing/supabase-checklist.md).
