# Supabase Production Runbook

## Назначение

Этот документ описывает production runbook для будущего Supabase user-case storage.

Current MVP остается localStorage-first. Runbook не означает, что user-facing Auth, Supabase user-case storage, RLS policies, migrations, backup automation, monitoring или production rollout уже реализованы. Документ является pre-implementation operational gate и должен использоваться только после отдельного approved active implementation plan.

Связанные документы:

- `docs/plans/active/supabase-implementation-plan.md`;
- `docs/specs/auth-implementation-decision.md`;
- `docs/specs/supabase-schema-v1.md`;
- `docs/specs/sql-rls-policy-spec.md`;
- `docs/specs/public-cases-migration-plan.md`;
- `docs/specs/user-auth-spec.md`;
- `docs/specs/case-ownership-rls.md`;
- `docs/specs/local-storage-to-supabase-migration.md`;
- `docs/testing/supabase-checklist.md`;
- `docs/architecture/adr-supabase-user-case-storage.md`;
- `docs/plans/active/supabase-user-cases-plan.md`;
- `docs/supabase-foundation.md`;
- `docs/specs/security-model.md`.

## Out Of Scope

Этот runbook не разрешает:

- менять код;
- менять UI;
- менять routes;
- менять Supabase schema;
- создавать или менять migrations;
- менять RLS policies;
- подключать Supabase к user-facing flow;
- переносить локальные данные;
- добавлять admin-доступ к пользовательским кейсам;
- использовать service role key во frontend;
- отключать `localStorage` fallback;
- выполнять destructive rollback без отдельного approval;
- задавать финальные юридические сроки хранения данных без отдельного privacy/legal decision.

## Deployment Checklist

Перед production rollout будущего Supabase user-case storage должно быть подтверждено:

- [ ] Approved active implementation plan существует.
- [ ] User-facing Auth scope утвержден.
- [ ] Final schema/migration plan утвержден.
- [ ] SQL-level RLS policies reviewed до применения.
- [ ] Migration strategy утверждена.
- [ ] Rollback strategy утверждена.
- [ ] Recovery procedure утверждена.
- [ ] Data retention policy утверждена.
- [ ] Monitoring и alerting настроены.
- [ ] Logging не содержит PII и secrets.
- [ ] Feature flag или эквивалентный rollout control определен, если используется staged rollout.
- [ ] `npm run build` проходит после implementation changes.
- [ ] RLS positive/negative tests выполнены.
- [ ] Supabase outage fallback проверен.
- [ ] Network failure fallback проверен.
- [ ] Auth failure fallback проверен.
- [ ] LocalStorage fallback проверен для `lifepilot.currentCase` и `lifepilot.caseHistory`.
- [ ] Admin Auth Foundation не получил доступ к user cases без отдельного review.

## Environment Variables

Текущий Supabase Foundation использует только browser-safe публичные переменные:

```text
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Правила:

- real values не коммитятся;
- `.env.local` не коммитится;
- production values хранятся только в утвержденном secret storage, например Vercel dashboard;
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` не считается secret, но должен работать только вместе с RLS;
- service role key запрещен во frontend, browser bundle, client logs и markdown с реальными значениями;
- если будущий server-side maintenance flow потребует service role key, он должен быть documented, server-side-only и approved отдельно;
- переменные окружения должны проверяться до rollout;
- отсутствие production env vars должно переводить Supabase user-case flow в safe unavailable state, а не ломать localStorage MVP.

Будущие server-only variables, если они понадобятся, должны быть описаны отдельным security review до добавления.

## Rollback Procedure

Цель rollback — вернуть user-facing flow к безопасному localStorage behavior без потери локальной истории.

Порядок rollback:

1. Остановить rollout через feature flag или эквивалентный rollout control, если он есть.
2. Отключить новые Supabase writes из user-facing flow.
3. Отключить Supabase reads как рабочий источник истории.
4. Оставить `lifepilot.currentCase` и `lifepilot.caseHistory` доступными.
5. Не удалять local history.
6. Не удалять server rows без отдельного privacy/data-retention decision.
7. Не отключать RLS для восстановления UI.
8. Не использовать service role key во frontend.
9. Проверить, что Current MVP routes продолжают работать local-first.
10. Задокументировать, какие данные могли быть сохранены в Supabase до rollback.

Rollback не должен зависеть от destructive schema rollback как единственного пути восстановления.

## Recovery Procedure

Recovery используется, когда часть операций Supabase завершилась неизвестно, частично или с ошибкой.

Требования:

- recovery должен сохранять localStorage history как источник восстановления;
- retry разрешен только для idempotent operations;
- unknown write result должен проверяться через approved reconciliation flow;
- duplicate prevention должен использовать утвержденную idempotency strategy;
- partial migration success должен показываться безопасно;
- recovery не должен пересчитывать analysis, risk level, priority, status или action plan без отдельного review;
- recovery не должен раскрывать `source_text`, analysis, action plan, реальные email или Supabase internals в logs/UI;
- recovery не должен требовать отключения RLS;
- recovery не должен требовать service role key во frontend.

## Supabase Outage Handling

Если Supabase недоступен:

- создание нового кейса должно продолжить работать через `localStorage`;
- открытие локальной истории должно продолжить работать через `lifepilot.caseHistory`;
- user-facing server read/write path должен перейти в safe unavailable state;
- приложение не должно показывать внутренние Supabase errors пользователю;
- retry должен быть idempotent;
- local-only cases не должны исчезать;
- migration локальной истории не должна запускаться;
- admin flow не должен получать user-case access как fallback;
- monitoring должен зафиксировать outage без PII.

После восстановления Supabase:

- не запускать автоматическую миграцию local history без явного подтверждения пользователя;
- сверить unknown write states через approved reconciliation flow;
- проверить RLS before re-enable;
- задокументировать incident summary, если был пользовательский impact.

## Monitoring

Минимальные будущие monitoring signals:

- Supabase read error rate;
- Supabase write error rate;
- RLS rejection rate;
- auth failure rate;
- migration partial success/failure count;
- duplicate prevention conflicts;
- network timeout count;
- fallback activation count;
- recovery retry count;
- rollback activation event;
- anomalous admin access attempts to user-case data.

Monitoring не должен содержать:

- `source_text`;
- analysis body;
- action plan text;
- реальные документы;
- raw JWT;
- access token;
- refresh token;
- service role key;
- полные Supabase error objects с sensitive context.

## Logging

Logging должен помогать диагностике без раскрытия чувствительных данных.

Разрешено логировать:

- operation type: read, write, migration, recovery, rollback;
- safe error category: network, auth, RLS, validation, unavailable;
- anonymized/request-scoped correlation id;
- timestamp;
- non-PII status code/category;
- feature flag state, если он есть.

Запрещено логировать:

- `source_text`;
- analysis;
- action plan;
- реальные email в user-facing logs;
- case numbers из документов;
- суммы, сроки и персональные данные;
- JWT payload;
- access token;
- refresh token;
- service role key;
- raw Supabase error object, если он содержит sensitive context.

## Backup Strategy

Backup strategy должна быть утверждена до production storage.

Минимальные требования:

- определить Supabase backup mechanism для production project;
- определить recovery point objective и recovery time objective;
- проверить restore procedure на non-production окружении;
- не использовать backup как замену RLS;
- не экспортировать sensitive user cases в неутвержденные storage locations;
- ограничить доступ к backups по least privilege;
- зафиксировать owner процесса backup/restore;
- задокументировать, как backup относится к data retention policy.

LocalStorage history не считается production backup. Она остается fallback для текущего браузера пользователя, но не гарантирует cross-device recovery.

## Data Retention Policy

До production rollout нужно утвердить data retention policy.

Минимальные решения:

- сколько хранятся server-side user cases;
- когда local history может быть удалена после migration success;
- как обрабатывается user-requested deletion, если delete будет включен отдельным scope;
- что происходит с server rows после rollback;
- как обрабатываются partial migrations;
- как обрабатываются backups после удаления данных;
- кто может выполнять maintenance operations;
- какие audit expectations нужны для sensitive operations.

До отдельного retention decision запрещено:

- автоматически удалять local history после server write;
- автоматически удалять server rows при rollback;
- использовать destructive cleanup как recovery shortcut;
- давать admin page доступ к user cases.

## Incident Response

Incident response нужен для security, privacy, availability и data-integrity incidents.

Минимальные incident categories:

- suspected cross-user data exposure;
- RLS misconfiguration;
- service role key exposure;
- Supabase outage affecting user storage;
- migration duplicate/data corruption;
- failed rollback;
- logs containing PII/secrets;
- unexpected admin access to user cases.

Порядок реакции:

1. Оценить severity и scope.
2. Остановить affected rollout/write path, если риск активен.
3. Сохранить localStorage fallback.
4. Не отключать RLS как first response.
5. Не использовать service role key во frontend.
6. Собрать non-PII diagnostics.
7. Проверить RLS policies и recent changes.
8. Определить affected users/data без раскрытия лишних данных.
9. Принять recovery или rollback decision.
10. Задокументировать incident timeline, cause, mitigation и follow-up actions.

Security/privacy incidents должны блокировать дальнейший rollout до review.

## RLS Verification Steps

Перед production enablement и после любого RLS/schema/auth изменения нужно проверить:

- [ ] RLS включен для `public.cases`.
- [ ] `anon` не может SELECT из `public.cases`.
- [ ] `anon` не может INSERT в `public.cases`.
- [ ] `anon` не может UPDATE `public.cases`.
- [ ] `anon` не может DELETE из `public.cases`.
- [ ] Authenticated user A читает только rows с `user_id = auth.uid()` user A.
- [ ] Authenticated user A не читает row user B по прямому `id`.
- [ ] Authenticated user A создает row только для своего `user_id`.
- [ ] Authenticated user A не создает row с `user_id` user B.
- [ ] Authenticated user A обновляет только свои rows, если UPDATE входит в scope.
- [ ] Authenticated user A не может переназначить `user_id`.
- [ ] DELETE запрещен до отдельного delete/archive/restore plan.
- [ ] Rows без ownership не видны ordinary authenticated users.
- [ ] Admin Auth Foundation не обходит user ownership.
- [ ] Service role не используется в user-facing CRUD.
- [ ] RLS rejection не раскрывает policy details пользователю.

Verification results должны быть зафиксированы в testing notes перед rollout.

## Acceptance Criteria

Runbook считается готовым как production gate, если:

- deployment checklist описан;
- environment variables и secret boundaries описаны;
- rollback procedure сохраняет localStorage fallback;
- recovery procedure поддерживает idempotency и не требует отключения RLS;
- Supabase outage handling сохраняет local MVP behavior;
- monitoring и logging описаны без PII/secrets;
- backup strategy описана;
- data retention policy decisions перечислены;
- incident response flow описан;
- RLS verification steps покрывают anon, own rows, чужие rows, admin boundary и service role boundary;
- Current MVP явно остается localStorage-first;
- runbook не требует немедленных code, UI, schema, migration или RLS changes.

Implementation stage не готов к production rollout, пока:

- runbook не привязан к approved implementation plan;
- feature flag/rollout control не определен, если используется staged rollout;
- `docs/specs/public-cases-migration-plan.md` не утвержден для конкретной migration;
- `docs/specs/sql-rls-policy-spec.md` не reviewed и не проверен через implementation tests;
- monitoring/logging не настроены;
- backup/restore procedure не проверена;
- data retention policy не утверждена;
- incident response owner не определен.

## Risks

Основные production risks:

- RLS misconfiguration может раскрыть чужие user cases;
- rollback может оказаться невозможным, если localStorage fallback удален слишком рано;
- recovery может создать duplicates без idempotency;
- service role key может попасть в frontend или logs;
- monitoring/logging может сохранить PII;
- backup может стать неучтенным хранилищем sensitive data;
- retention policy может конфликтовать с пользовательскими ожиданиями;
- Supabase outage может сломать историю, если read path заменит local fallback одномоментно;
- admin boundary может быть нарушен и дать доступ к user cases;
- destructive schema rollback может привести к потере данных.
