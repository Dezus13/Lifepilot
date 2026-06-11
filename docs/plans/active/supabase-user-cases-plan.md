# План Supabase user cases stage

## Назначение

Этот документ проектирует следующий этап после текущего local-first MVP: хранение пользовательских кейсов в Supabase.

Current MVP остается localStorage-first. Этот план не подключает Supabase к пользовательскому flow, не создает migrations, не меняет RLS, не меняет Auth/Admin, не меняет UI и не меняет код. Любая реализация должна начаться только после явного подтверждения scope и обновления релевантных specs/architecture.

Implementation gate для следующего этапа зафиксирован отдельно в `docs/plans/active/supabase-implementation-plan.md`. Этот документ остается planning/reference документом для продуктовой цели, scope, ownership, migration/fallback и rollback overview.

## Цель этапа

Цель этапа — спроектировать безопасный переход от локальной истории кейсов в браузере к серверному хранению пользовательских кейсов в `public.cases`, сохраняя понятный fallback на `localStorage` и не ломая текущий пользовательский сценарий.

Этап должен ответить на вопросы:

- кто владеет кейсом;
- как кейс связывается с пользователем;
- как существующие локальные кейсы могут быть перенесены;
- какие RLS policies нужны;
- как приложение ведет себя, если Supabase недоступен;
- как откатить этап без потери текущего local-first MVP.

## Scope

В scope проектирования входят:

- модель владения пользовательскими кейсами;
- стратегия чтения и записи кейсов в Supabase на будущем этапе;
- стратегия сосуществования Supabase и `localStorage`;
- правила миграции локальной истории;
- fallback и rollback-поведение;
- обзор RLS requirements для `public.cases`;
- acceptance criteria для будущей implementation-задачи;
- фазы реализации после утверждения плана.

В scope будущей реализации после подтверждения могут войти:

- добавление user ownership к кейсам;
- запись новых кейсов в Supabase;
- чтение истории из Supabase;
- безопасный локальный fallback;
- миграция локальной истории пользователя после входа;
- обновление testing checklist для Supabase user cases stage.

## Out Of Scope

На этапе этого плана не выполняются:

- изменение кода;
- изменение UI;
- изменение маршрутов;
- изменение localStorage-логики;
- изменение Auth/Admin реализации;
- создание Supabase migrations;
- создание новых таблиц;
- изменение RLS policies;
- подключение Supabase к user-facing flow;
- перенос реальных пользовательских данных;
- user-facing signup/login implementation;
- billing, Stripe, тарифы или лимиты;
- export/archive/delete/restore кейсов;
- admin-доступ к пользовательским кейсам;
- server-side AI/API processing;
- OCR, PDF parser или загрузка файлов.

## User Stories

- Как пользователь, я хочу сохранять кейсы в аккаунте, чтобы открыть их позже не только в текущем браузере.
- Как пользователь, я хочу не потерять локальную историю при переходе к Supabase.
- Как пользователь, я хочу понимать, какие кейсы остаются локальными, а какие сохранены в аккаунте.
- Как пользователь, я хочу, чтобы приложение продолжало работать, если Supabase временно недоступен.
- Как пользователь, я хочу видеть только свои кейсы.
- Как владелец продукта, я хочу сохранить текущий local-first MVP как безопасный fallback.
- Как разработчик, я хочу иметь понятную RLS и migration strategy до изменения schema или кода.

## Functional Requirements

- Current MVP должен продолжать работать через `localStorage` до начала отдельной implementation-задачи.
- Будущая Supabase-история должна использовать каноническую модель Case из `docs/specs/case-model.md`.
- Будущий user-facing Supabase flow должен требовать user identity до связывания кейсов с пользователем.
- Новые кейсы должны сохраняться локально до успешного server persistence или вместе с ним, если выбран dual-write подход.
- История должна иметь понятное состояние загрузки, empty state и error/fallback state.
- Локальная история должна оставаться доступной, если Supabase недоступен.
- Миграция локальных кейсов должна быть явным пользовательским или безопасно объясненным системным действием.
- Повторная миграция не должна создавать дубликаты.
- Данные кейса не должны передаваться через URL.
- Немецкий черновик не должен становиться отдельной Supabase-сущностью без обновления specs.
- Admin page не должен получать доступ к пользовательским кейсам в рамках этого этапа.

## Non-Functional Requirements

- Security-first: доступ к кейсам должен быть запрещен по умолчанию, если ownership нельзя подтвердить.
- Privacy-first: исходные тексты могут содержать чувствительные данные и должны храниться только в утвержденных местах.
- Backward compatibility: старые локальные кейсы должны открываться безопасно.
- Graceful degradation: отсутствие Supabase config, network error или RLS error не должны ломать local MVP.
- Observability without PII: будущие ошибки не должны логировать исходные тексты, документы, реальные email или персональные данные.
- No secret leakage: service role key не должен попадать во frontend, markdown с реальными значениями или browser bundle.
- Incremental rollout: Supabase должен подключаться по фазам, а не одномоментной заменой `localStorage`.
- Reversibility: этап должен иметь понятный rollback к local-first behavior.

## Data Ownership Model

Минимальная будущая модель владения:

- каждый server-side пользовательский кейс должен принадлежать одному Supabase Auth user;
- ownership должен проверяться на уровне RLS, а не только в UI;
- `auth.uid()` должен быть основой user isolation;
- пользователь может читать только свои кейсы;
- пользователь может создавать кейсы только для себя;
- пользователь может обновлять только свои кейсы, если update будет включен в scope;
- delete/archive/restore не входят в этот этап без отдельного plan/spec;
- admin identity из `public.admin_users` не дает автоматического доступа к пользовательским кейсам.

Предварительное schema-направление для будущего review:

- добавить owner field к `public.cases`, например `user_id uuid references auth.users(id)`;
- определить обязательность `user_id` для новых server-side кейсов;
- определить поведение старых rows без `user_id`, если они есть в hosted foundation project;
- определить unique/idempotency strategy для migrated local cases.

Окончательная schema должна быть зафиксирована в specs и migration plan до создания migration.

## Migration Strategy Overview

Переход должен быть постепенным:

1. Сохранить текущий `localStorage` как рабочий источник Current MVP.
2. Спроектировать user-facing Auth и ownership до записи кейсов.
3. Добавить schema/RLS только после утверждения specs и ADR.
4. Ввести server persistence как дополнительный слой, не отключая local fallback.
5. Добавить миграцию локальной истории после user login.
6. Сопоставлять локальные кейсы с server rows через стабильный local id или migration metadata.
7. Избегать дубликатов при повторной миграции.
8. После стабилизации чтения из Supabase оставить локальный cache/fallback для offline/error state, если это утверждено.

Миграция не должна:

- автоматически отправлять локальные чувствительные тексты без понятного пользовательского контекста;
- удалять локальную историю сразу после server write;
- менять смысл анализа;
- пересчитывать анализ без необходимости;
- скрывать ошибки частичной миграции.

## Rollback Strategy Overview

Rollback должен сохранять возможность вернуться к Current MVP behavior:

- оставить `localStorage` как fallback до завершения этапа;
- не удалять локальные кейсы после успешной server migration без отдельного решения;
- при Supabase/RLS/network ошибке показывать локальную историю;
- иметь feature flag или эквивалентный механизм отключения Supabase user cases flow, если он будет добавлен;
- не делать schema rollback единственным способом восстановления пользовательского flow;
- не менять admin flow при rollback пользовательских кейсов;
- документировать, какие данные могли быть записаны в Supabase до rollback.

## RLS Requirements Overview

Будущие RLS requirements для `public.cases` должны быть утверждены до migration:

- RLS включен для `public.cases`.
- `anon` не должен читать, создавать, изменять или удалять пользовательские кейсы.
- `authenticated` может читать только rows, где `user_id = auth.uid()`.
- `authenticated` может создавать rows только для `user_id = auth.uid()`.
- `authenticated` может обновлять только свои rows, если update входит в scope.
- Delete должен быть запрещен до отдельного delete/archive plan.
- Admin-доступ к пользовательским кейсам не включается без отдельного RLS/data-access review.
- Service role key не используется во frontend.
- Policies должны быть проверены negative tests: чужой кейс не читается и не изменяется.

## Acceptance Criteria

План считается готовым к подтверждению, если:

- Current MVP явно остается localStorage-first.
- Scope будущего Supabase user cases stage описан без реализации кода.
- Out of scope запрещает migrations, RLS changes, UI/code changes и Supabase connection work в рамках этого planning step.
- Описана базовая data ownership model.
- Описана migration strategy overview.
- Описана rollback strategy overview.
- Описан RLS requirements overview.
- Описаны implementation phases.
- Указано, какие документы нужно обновить перед реализацией.

Будущая implementation-задача считается готовой только если:

- specs обновлены до кода;
- architecture/ADR обновлены до кода;
- active implementation plan утвержден;
- migration plan утвержден;
- RLS policies review выполнен;
- testing checklist для Supabase user cases stage создан или обновлен;
- `npm run build` проходит после реализации;
- Current localStorage fallback не сломан.

## Implementation Phases

### Phase 0 — Approval and docs

- Подтвердить этот plan.
- Обновить specs для user-facing Auth, storage, ownership и RLS.
- Создать ADR для Supabase user case storage.
- Создать migration/RLS checklist.
- Подтвердить rollout и rollback strategy.

### Phase 1 — Schema and RLS design

- Спроектировать `public.cases.user_id` или эквивалент ownership field.
- Спроектировать constraints и indexes.
- Спроектировать RLS policies.
- Спроектировать negative tests.
- Не применять migration до отдельного approval.

### Phase 2 — Auth prerequisite

- Подтвердить user-facing Auth scope.
- Разделить user-facing Auth и Admin Auth Foundation.
- Зафиксировать session persistence и redirects.
- Убедиться, что auth state не смешивается с `lifepilot.currentCase` и `lifepilot.caseHistory`.

### Phase 3 — Write path with local fallback

- Добавить server persistence для новых кейсов после утверждения code scope.
- Сохранять local fallback.
- Обрабатывать Supabase errors без потери локального кейса.
- Не отключать current localStorage flow.

### Phase 4 — Read path and history

- Добавить чтение пользовательской истории из Supabase после успешной auth/session проверки.
- Сохранять local fallback и safe empty/error states.
- Разделить local-only, syncing и saved states, если это нужно UX.

### Phase 5 — Local history migration

- Мигрировать локальные кейсы только после утвержденного пользовательского или системного flow.
- Обеспечить idempotency.
- Показать безопасный partial-success state.
- Не удалять локальную историю без отдельного решения.

### Phase 6 — Stabilization

- Проверить RLS positive/negative cases.
- Проверить fallback при отключенной сети или ошибке Supabase.
- Проверить старые локальные кейсы.
- Обновить testing docs, project map и changelog.
- Запустить `npm run build`.

## Документы, которые используются перед реализацией

- `docs/plans/active/supabase-implementation-plan.md`
- `docs/specs/auth-implementation-decision.md`
- `docs/specs/supabase-schema-v1.md`
- `docs/specs/sql-rls-policy-spec.md`
- `docs/specs/public-cases-migration-plan.md`
- `docs/specs/case-ownership-rls.md`
- `docs/specs/local-storage-to-supabase-migration.md`
- `docs/testing/supabase-checklist.md`
- `docs/architecture/adr-supabase-user-case-storage.md`
- `docs/architecture/supabase-production-runbook.md`
- `docs/project-map.md`
- `docs/changelog.md`

## Запрещенные действия до подтверждения

- Не писать код.
- Не менять UI.
- Не менять routes.
- Не менять localStorage behavior.
- Не менять Auth/Admin реализацию.
- Не создавать migrations.
- Не менять RLS policies.
- Не создавать новые таблицы.
- Не подключать Supabase к пользовательскому flow.
- Не менять specs без отдельной задачи.
