# Supabase User Case Storage Checklist

## Назначение

Этот документ является pre-implementation checklist для будущего Supabase user-case storage.

Current MVP остается localStorage-first. Этот checklist не означает, что Supabase user-case storage, user-facing Auth, RLS policies, schema changes, migrations или local history migration уже реализованы. Перед выполнением пунктов нужен отдельный approved implementation plan.

Связанные документы:

- `docs/plans/active/supabase-implementation-plan.md`;
- `docs/specs/auth-implementation-decision.md`;
- `docs/specs/supabase-schema-v1.md`;
- `docs/specs/sql-rls-policy-spec.md`;
- `docs/specs/public-cases-migration-plan.md`;
- `docs/specs/case-ownership-rls.md`;
- `docs/specs/local-storage-to-supabase-migration.md`;
- `docs/architecture/adr-supabase-user-case-storage.md`;
- `docs/plans/active/supabase-user-cases-plan.md`;
- `docs/supabase-foundation.md`;
- `docs/specs/security-model.md`.

## Out Of Scope

Этот checklist не разрешает:

- менять код;
- менять UI;
- менять routes;
- менять `app/`;
- менять `lib/`;
- менять Supabase schema;
- создавать или менять migrations;
- менять RLS policies;
- подключать Supabase к user-facing flow;
- переносить реальные локальные данные;
- включать admin access к пользовательским кейсам;
- добавлять delete/archive/restore кейсов;
- добавлять billing, OCR, PDF parser, file upload или external AI/API processing.

## Auth

Перед включением Supabase user-case storage должно быть подтверждено:

- [ ] User-facing Auth включен отдельным approved scope и не смешан с Admin Auth Foundation.
- [ ] User session создается, сохраняется и восстанавливается утвержденным способом.
- [ ] `auth.uid()` возвращает ожидаемый Supabase Auth user id для authenticated user.
- [ ] `auth.uid()` отсутствует или недоступен для unauthenticated/anon flow.
- [ ] Login scenario проверен: пользователь входит и получает корректную session.
- [ ] Logout scenario проверен: пользователь выходит, server read/write path становится недоступен.
- [ ] Session refresh/expiry behavior проверен.
- [ ] Auth state не сохраняется в `lifepilot.currentCase` или `lifepilot.caseHistory`.
- [ ] Auth failure не удаляет localStorage cases.

## Database

Перед применением database changes должно быть подтверждено:

- [ ] Final schema для `public.cases` согласована в specs.
- [ ] Ownership fields определены, включая `user_id` или утвержденный эквивалент.
- [ ] `user_id` связан с Supabase Auth user id или утвержденной user ownership моделью.
- [ ] Required/nullable behavior для ownership fields определен.
- [ ] Поведение existing foundation rows без ownership определено.
- [ ] Indexes для ownership/read path определены.
- [ ] Indexes или constraints для idempotency/duplicate prevention определены.
- [ ] Migration strategy утверждена до создания migration.
- [ ] Rollback strategy для database changes утверждена.
- [ ] Schema не требует service role key во frontend.

## RLS

Перед user-facing read/write path должно быть подтверждено:

- [ ] RLS включен для `public.cases`.
- [ ] Anonymous access запрещен для SELECT.
- [ ] Anonymous access запрещен для INSERT.
- [ ] Anonymous access запрещен для UPDATE.
- [ ] Anonymous access запрещен для DELETE.
- [ ] Authenticated user читает только свои rows.
- [ ] Authenticated user создает только rows для себя.
- [ ] Authenticated user обновляет только свои rows, если update входит в scope.
- [ ] Authenticated user не может переназначить `user_id` другому пользователю.
- [ ] DELETE запрещен до отдельного delete/archive/restore plan.
- [ ] Direct access к чужому `id` не возвращает чужие данные.
- [ ] Rows без ownership не видны ordinary authenticated users без отдельного safe flow.
- [ ] Negative tests описаны для read чужого case.
- [ ] Negative tests описаны для update чужого case.
- [ ] Negative tests описаны для delete чужого case.
- [ ] Negative tests описаны для anon access.
- [ ] Negative tests описаны для admin foundation без user ownership.

## Migration

Перед миграцией локальной истории должно быть подтверждено:

- [ ] LocalStorage migration подтверждается пользователем явно.
- [ ] Автоматическая отправка локальных кейсов запрещена.
- [ ] Migration запускается только при authenticated session.
- [ ] Каждый migrated case получает ownership через authenticated user id.
- [ ] Duplicate prevention проверен.
- [ ] Idempotency strategy определена.
- [ ] Retry migration не создает duplicate server rows.
- [ ] Partial success state описан и проверен.
- [ ] Local history не удаляется после migration success без отдельного retention decision.
- [ ] Conflict resolution для local/server versions вынесен в отдельный future document.
- [ ] Rollback path определен.
- [ ] Migration не пересчитывает analysis, risk level, priority, status или action plan без отдельного review.

## Fallback

Перед rollout должно быть подтверждено:

- [ ] Supabase outage не ломает создание нового local case.
- [ ] Supabase outage не ломает открытие local history.
- [ ] Network outage сохраняет localStorage fallback.
- [ ] Network timeout не создает duplicate server rows при retry.
- [ ] Auth failure переводит user-facing server path в safe unavailable state.
- [ ] Auth failure не отправляет local cases автоматически после повторного login.
- [ ] RLS failure не раскрывает чужие данные.
- [ ] RLS failure не показывает пользователю policy details.
- [ ] LocalStorage fallback остается доступным для `lifepilot.currentCase`.
- [ ] LocalStorage fallback остается доступным для `lifepilot.caseHistory`.
- [ ] Recovery flow не требует отключения RLS.
- [ ] Recovery flow не требует service role key во frontend.

## Security

Перед production rollout должно быть подтверждено:

- [ ] Service role key не используется во frontend.
- [ ] Service role key не попадает в browser bundle.
- [ ] Secrets не попадают в client-side logs.
- [ ] Secrets не попадают в markdown с реальными значениями.
- [ ] Secrets не попадают в `localStorage`.
- [ ] Ownership проверяется через RLS, а не только через UI filters.
- [ ] Client-only ownership checks не считаются security boundary.
- [ ] Admin access изолирован от user case ownership.
- [ ] `/admin` не читает `public.cases` без отдельного RLS/data-access review.
- [ ] Ошибки не раскрывают `source_text`, analysis, action plan, реальные email, case numbers или Supabase internals.
- [ ] Observability не логирует PII.
- [ ] Privacy/data-retention decision утвержден до удаления local или server data.

## Production Readiness

Перед production enablement должно быть подтверждено:

- [ ] Monitoring для Supabase read/write errors определен.
- [ ] Monitoring для RLS rejection rates определен.
- [ ] Monitoring для migration partial failures определен.
- [ ] Logging не содержит PII и secrets.
- [ ] Rollback runbook утвержден.
- [ ] Recovery flow утвержден.
- [ ] Data retention policy утверждена.
- [ ] Feature flag или эквивалентный rollout control определен, если используется staged rollout.
- [ ] Safe empty/error states проверены.
- [ ] Build проходит после implementation changes.
- [ ] Manual QA checklist для Auth, RLS, migration, fallback и rollback выполнен.
- [ ] Documentation updated after implementation: specs, architecture, testing, project map и changelog.

## Acceptance Criteria

Checklist считается готовым как pre-implementation gate, если:

- Auth, Database, RLS, Migration, Fallback, Security и Production Readiness разделы заполнены.
- Current MVP явно остается localStorage-first.
- Checklist не утверждает, что Supabase user-case storage уже реализован.
- Anonymous access и чужие user rows покрыты negative tests.
- Migration требует explicit user confirmation.
- Idempotency и duplicate prevention проверяются до rollout.
- Rollback сохраняет localStorage history.
- Admin Auth Foundation не дает автоматического доступа к user cases.
- Service role key запрещен во frontend.
- Документ согласован с Supabase specs, ADR, active plan и Supabase Foundation.

Supabase user-case implementation может стартовать, когда:

- checklist привязан к `docs/plans/active/supabase-implementation-plan.md`;
- `docs/specs/auth-implementation-decision.md` подтвержден;
- `docs/specs/supabase-schema-v1.md` подтвержден как target schema;
- `docs/specs/sql-rls-policy-spec.md` reviewed как policy contract;
- `docs/specs/public-cases-migration-plan.md` confirmed как migration source;
- rollout/recovery gates из `docs/architecture/supabase-production-runbook.md` подтверждены.

## Risks

Риски, которые checklist должен предотвращать:

- Supabase storage может быть включен до user-facing Auth.
- RLS может разрешить доступ к чужим кейсам.
- Anonymous role может получить read/write access.
- Dual-write или migration может создать duplicate rows.
- Retry после network timeout может записать кейс повторно.
- Local history может быть удалена слишком рано.
- RLS failure может быть показан как пустая история без диагностики.
- Service role key может попасть во frontend или logs.
- Admin Auth Foundation может быть ошибочно использован как доступ к user cases.
- Production rollback может оказаться невозможным без destructive schema changes.
