# Карта документации LifePilot

## Правила работы

- `README.md` — внешний вход в проект: назначение, MVP scope, архитектура, запуск, roadmap и ограничения.
- `AGENTS.md` — главный рабочий регламент для ИИ-агентов: startup workflow, source of truth, правила specs/plans/project-map, Git workflow, security/Auth/Supabase правила и Definition of Done.
- `docs/changelog.md` — журнал значимых изменений проекта и минимальный changelog workflow.

## Roadmap

- `docs/roadmap.md` — обзорный roadmap на уровне продукта: Current MVP, Next Stage и Future. Точка входа в roadmap; детальный план с этапами и критериями находится в `docs/plans/active/mvp-roadmap.md`.
- `docs/mvp-status.md` — фиксирует Implemented, Next Stage, Future / Requires Separate Approved Plan и Out Of Scope For Current MVP в синхронизации со specs и roadmap.
- `docs/demo-script.md` — сценарий демонстрации MVP с ожидаемым результатом на каждом шаге.

## Scope Layers

### User Facing MVP

User Facing MVP — текущий пользовательский продуктовый сценарий. Он работает local-first через `localStorage` и включает создание кейса из текстового ввода, локальный анализ, risk level, priority, status, action plan, немецкий черновик, историю и detail view сохраненного кейса.

Основные источники:

- `docs/plans/active/mvp-scope.md`;
- `docs/specs/mvp-definition.md`;
- `docs/specs/user-flow.md`;
- `docs/specs/data-storage.md`;
- `docs/specs/case-model.md`.

### Technical Foundation

Technical Foundation — подготовленные технические слои, которые существуют в репозитории, но не считаются пользовательскими функциями MVP.

В этот слой входят Supabase Foundation для `public.cases`, Admin Auth Foundation для `/admin/login` и `/admin`, `public.admin_users`, server-side admin validation и Vercel/production-проверки.

Основные источники:

- `docs/specs/auth-spec.md`;
- `docs/specs/admin-spec.md`;
- `docs/specs/database-auth-model.md`;
- `docs/specs/security-model.md`;
- `docs/architecture/auth-admin-foundation-decision-review.md`;
- `docs/architecture/auth-ssr-admin-validation-adr.md`;
- `docs/plans/active/auth-admin-vercel-plan.md`.

### Future Scope

Future Scope — направления после текущего MVP. Они не реализуются без отдельного active plan, обновления specs и явного подтверждения scope.

В этот слой входят user-facing Auth, Supabase как рабочее хранилище пользовательских кейсов, API, экспорт, архив, синхронизация, OCR/PDF, billing и другие расширения из `docs/plans/active/mvp-scope.md`.

Источник scope-решений:

- `docs/plans/active/mvp-scope.md`;

Статусные и навигационные документы, не являющиеся источниками требований:

- `docs/roadmap.md`;
- `docs/mvp-status.md`;
- `docs/plans/active/mvp-roadmap.md`.

## Specs: описание системы

- `docs/specs/business-context.md` — объясняет, почему продукт нужен в Австрии, какую боль решает и чем отличается от обычного чат-бота.
- `docs/specs/project-overview.md` — задает общую идею LifePilot, границы ответственности и mobile-first подход.
- `docs/specs/mvp-definition.md` — фиксирует состав user-facing MVP, отдельные technical foundation-компоненты, критерии готовности и Post-MVP направления.
- `docs/specs/glossary.md` — задает единый словарь терминов проекта.
- `docs/specs/user-flow.md` — описывает путь пользователя от вставки текста до объяснения, плана действий и немецкого ответа.
- `docs/specs/feature-map.md` — показывает основные продуктовые функции и связи между ними.
- `docs/specs/decision-logic.md` — описывает, как система определяет тип ситуации, срочность, предупреждения и следующий шаг.
- `docs/specs/case-model.md` — единственный источник правды для модели Case, полей `public.cases`, статусов, жизненного цикла и границ текущего MVP.
- `docs/specs/user-auth-spec.md` — описывает будущий user-facing authentication flow: registration, login, logout, recovery, session lifecycle, protected routes, связь с `auth.uid()`, RLS и ownership cases.
- `docs/specs/case-ownership-rls.md` — описывает будущую ownership/RLS-модель для user-facing Supabase storage: `user_id`, `auth.uid()`, policies, service role, admin access и negative tests.
- `docs/specs/local-storage-to-supabase-migration.md` — описывает будущую migration strategy от Current MVP localStorage-first к Supabase user-case storage: phases, dual-write, fallback, rollback, idempotency и migration rules.
- `docs/specs/data-storage.md` — описывает данные кейса, объяснения, плана, ответа, границы safety screen, истории и подготовленную таблицу `public.cases`.
- `docs/specs/auth-spec.md` — описывает login, logout, session validation, protected routes, auth states и error states для Auth Foundation.
- `docs/specs/admin-spec.md` — описывает admin identity, allowlist flow, admin access rules и admin session rules.
- `docs/specs/database-auth-model.md` — описывает `auth.users`, `public.admin_users`, связи, поля и ограничения.
- `docs/specs/security-model.md` — описывает server-side only operations, service role boundaries, env variables и forbidden client operations.

## Plans: этапы реализации

- `docs/plans/README.md` — описывает правила работы с активными и завершенными планами.
- `docs/plans/active/mvp-scope.md` — главный источник ограничений MVP: что входит, что не входит, что переносится на следующие этапы.
- `docs/plans/active/mvp-roadmap.md` — детальный план реализации MVP с этапами, техническим состоянием и критериями готовности. Является детализацией обзорного `docs/roadmap.md`.
- `docs/plans/active/supabase-user-cases-plan.md` — active plan следующего после MVP этапа: хранение пользовательских кейсов в Supabase, ownership, migration/fallback, rollback и RLS requirements overview без реализации кода.
- `docs/plans/completed/mvp-plan.md` — описывает цель первой версии и минимальный рабочий сценарий.
- `docs/plans/completed/development-stages.md` — делит реализацию MVP на этапы.
- `docs/plans/completed/implementation-order.md` — фиксирует порядок реализации MVP и очередность задач.
- `docs/plans/completed/screens-list.md` — архивный экранный план MVP; актуальное поведение проверять по specs, architecture и testing.
- `docs/plans/completed/screens-flow.md` — архивный UI-flow MVP; актуальные переходы проверять по `docs/specs/user-flow.md`, `docs/architecture/routing-map.md` и `docs/testing/mvp-checklist.md`.
- `docs/plans/completed/admin-users-migration-plan.md` — описывает реализованную migration для `public.admin_users` и правила дальнейшей проверки.
- `docs/plans/completed/case-creation-local-storage-plan.md` — завершенный план первой user-facing функции MVP: создание кейса из текстового ввода и локальное сохранение в `localStorage`.
- `docs/plans/completed/saved-case-local-analysis-plan.md` — завершенный план второй user-facing функции MVP: локальный анализ сохраненного кейса из истории.
- `docs/plans/active/auth-admin-vercel-plan.md` — активный план Auth/Admin и Vercel: Auth Foundation реализован, Vercel/production-проверки остаются незавершенными.

## Architecture: структура и ограничения

- `docs/architecture/mvp-architecture.md` — описывает базовую архитектуру MVP и роль `localStorage`.
- `docs/architecture/system-design.md` — описывает системную архитектуру, user-facing MVP architecture и отдельные technical foundation-компоненты.
- `docs/architecture/frontend-structure.md` — описывает структуру frontend, маршруты и общие frontend-утилиты.
- `docs/architecture/data-flow.md` — описывает движение данных между вводом, анализом, результатом, историей и Supabase foundation.
- `docs/architecture/state-management.md` — описывает состояние экранов, текущий кейс и локальную историю.
- `docs/architecture/routing-map.md` — фиксирует карту маршрутов, state-guarded routes и fallback-поведение.
- `docs/architecture/screen-data-mapping.md` — связывает экраны с данными, которые они читают и изменяют.
- `docs/architecture/component-map.md` — описывает компонентные зоны экранов без реализации компонентов.
- `docs/architecture/case-entity.md` — описывает архитектурный смысл Case и ссылается на `case-model.md` как source of truth.
- `docs/architecture/decisions.md` — краткие ADR по local-first storage, отсутствию user-facing Auth в MVP, rule-based analysis и будущей Supabase-интеграции.
- `docs/architecture/adr-supabase-user-case-storage.md` — ADR будущего Supabase user case storage: выбор Supabase, RLS, ownership через `user_id`, localStorage fallback и отдельная миграция.
- `docs/architecture/supabase-production-runbook.md` — production runbook для будущего Supabase user-case storage: deployment, env vars, rollback, recovery, outage handling, monitoring, logging, backup, retention, incidents и RLS verification.
- `docs/architecture/mvp-safety-rules.md` — фиксирует safety-правила MVP, ограничения черновика и осторожное поведение.
- `docs/architecture/auth-admin-foundation-decision-review.md` — source of truth для решений реализованного Auth/Admin Foundation.
- `docs/architecture/auth-ssr-admin-validation-adr.md` — source of truth для `@supabase/ssr`, cookie session persistence, RLS policy и admin validation без service role key.

## Design: визуальные правила

- `docs/design/design-system.md` — описывает визуальный язык, компоненты, предупреждения и mobile-first правила.
- `docs/design/mobile-layout.md` — фиксирует мобильную структуру экранов, прокрутку, действия и предупреждения.

## Testing: проверки MVP

- `docs/testing/mvp-checklist.md` — чеклист проверки MVP, localStorage flow, Supabase foundation и мобильного UI.
- `docs/testing/supabase-checklist.md` — pre-implementation checklist для будущего Supabase user-case storage: Auth, Database, RLS, Migration, Fallback, Security и Production Readiness.

## Changelog

- `docs/changelog.md` — фиксирует значимые изменения проекта и правила обновления changelog.

## Supabase

- `docs/supabase-foundation.md` — описывает текущий Supabase foundation, hosted-подключение, RLS и отсутствие anon SELECT policy для рабочего пользовательского flow.

## User Facing MVP Implementation

- `app/page.tsx` — главная страница с local-first dashboard и быстрым входом в создание кейса.
- `app/case/new/page.tsx` — создает `StoredCase` из текстового ввода, запускает локальный анализ и сохраняет кейс в `localStorage`.
- `app/case/analyzing/page.tsx` — показывает промежуточное состояние анализа и ведет пользователя к результату.
- `app/case/result/page.tsx` — показывает локальный результат анализа текущего кейса: explanation, risk level, priority, facts и action plan.
- `app/case/draft/page.tsx` — показывает демонстрационный немецкий черновик без автоматической отправки.
- `app/history/page.tsx` — показывает локальную историю, поиск, фильтры, сортировку и переходы к сохраненным кейсам.
- `app/history/[caseId]/page.tsx` — показывает detail view сохраненного кейса из `lifepilot.caseHistory` без изменения `lifepilot.currentCase`.
- `lib/analysis-rules.ts` — содержит локальные правила анализа, risk level, priority, deadline status и case status.
- `lib/action-plan.ts` — формирует локальный action plan из риска, приоритета и статуса срока.
- `lib/case-storage.ts` — читает и сохраняет текущий кейс и историю в `localStorage`.
- `lib/types.ts` — описывает frontend-тип `StoredCase`.

## Technical Foundation implementation

- `lib/supabase-client.ts` — создает единый типизированный browser-safe Supabase client через публичные переменные окружения.
- `lib/supabase-cases.ts` — содержит подготовительную функцию `readSupabaseCases()` для будущего чтения `public.cases`; из-за RLS без SELECT policy anon client сейчас не может читать таблицу как рабочий источник данных, а UI не заменяет `localStorage`.
- `app/admin/login/page.tsx` — показывает public Admin Login route.
- `app/admin/login/actions.ts` — выполняет Supabase Auth email/password login через Server Action.
- `app/admin/page.tsx` — защищает `/admin` через server-side validation.
- `app/admin/actions.ts` — выполняет logout для admin session.
- `lib/supabase-server.ts` — создает Supabase server client через `@supabase/ssr` для Auth/Admin Foundation.
- `lib/admin-auth.ts` — выполняет server-side admin validation через Supabase Auth user и `public.admin_users`.
- `supabase/migrations/20260604000000_admin_users_auth_foundation.sql` — создает `public.admin_users`, включает RLS и добавляет SELECT policy для собственной active admin row.

## Связи между specs и plans

- `business-context.md` объясняет, почему выбран такой продуктовый фокус.
- `project-overview.md` превращает бизнес-контекст в общее описание системы.
- `mvp-definition.md` фиксирует текущую границу MVP.
- `glossary.md` задает единые термины для всей документации.
- `user-flow.md` показывает, как пользователь проходит через систему.
- `feature-map.md` раскладывает пользовательский путь на функции.
- `decision-logic.md` задает правила анализа и рекомендаций.
- `case-model.md` фиксирует структуру Case, статусы, жизненный цикл и соответствие таблице `public.cases`.
- `user-auth-spec.md` фиксирует future user-facing auth flow и отделяет его от реализованного Admin Auth Foundation.
- `case-ownership-rls.md` фиксирует будущую ownership/RLS-модель для user-facing Supabase storage и не меняет Current MVP.
- `local-storage-to-supabase-migration.md` фиксирует будущий безопасный переход от localStorage-first MVP к Supabase user-case storage и не запускает миграцию.
- `supabase-checklist.md` фиксирует pre-implementation testing gate для будущего Supabase user-case storage и не запускает реализацию.
- `data-storage.md` описывает данные, которые нужны этим функциям.
- `auth-spec.md`, `admin-spec.md`, `database-auth-model.md` и `security-model.md` описывают реализованный Auth/Admin Foundation.
- `adr-supabase-user-case-storage.md` фиксирует архитектурное решение для будущего Supabase user case storage без изменения Current MVP.
- `supabase-production-runbook.md` фиксирует production readiness, rollback/recovery, monitoring, backup/retention и incident response для будущего Supabase stage.
- `mvp-scope.md` ограничивает, какие части системы входят в первую версию.
- `supabase-user-cases-plan.md` проектирует следующий после MVP этап хранения пользовательских кейсов в Supabase и не меняет Current MVP.
- `roadmap.md` и `mvp-status.md` показывают статус функций без замены specs и active plans.
- `mvp-plan.md`, `development-stages.md`, `implementation-order.md`, `screens-list.md` и `screens-flow.md` являются completed/archive plans и описывают исторический порядок реализации выбранного MVP.
- `case-creation-local-storage-plan.md` и `saved-case-local-analysis-plan.md` описывают завершенные первые user-facing функции MVP.
- `admin-users-migration-plan.md` описывает реализованную migration для `public.admin_users`. Оставшиеся Vercel/production-проверки ведутся в `auth-admin-vercel-plan.md`.

## Важное ограничение MVP

В текущем MVP пользователь вставляет текст письма, документа или ситуации вручную. Данные текущего кейса в пользовательском UI хранятся в браузере через `localStorage`. User-facing accounts, файловая загрузка, распознавание документов и синхронизация не входят в первую версию. В проекте также есть подготовительный Supabase foundation для `public.cases`, но anon SELECT сейчас не разрешен и этот слой не подключен к пользовательскому flow. Admin Auth Foundation реализован отдельно и не меняет пользовательский MVP-flow. Полный список ограничений хранится в `docs/plans/active/mvp-scope.md`.

## В каком порядке читать

1. `README.md`
2. `AGENTS.md`
3. `docs/project-map.md`
4. `docs/roadmap.md`
5. `docs/mvp-status.md`
6. `docs/demo-script.md`
7. `docs/changelog.md`
8. `docs/specs/business-context.md`
9. `docs/specs/project-overview.md`
10. `docs/specs/mvp-definition.md`
11. `docs/specs/glossary.md`
12. `docs/specs/user-flow.md`
13. `docs/specs/feature-map.md`
14. `docs/specs/decision-logic.md`
15. `docs/specs/case-model.md`
16. `docs/specs/user-auth-spec.md`
17. `docs/specs/case-ownership-rls.md`
18. `docs/specs/local-storage-to-supabase-migration.md`
19. `docs/testing/supabase-checklist.md`
20. `docs/specs/data-storage.md`
21. `docs/architecture/decisions.md`
22. `docs/architecture/adr-supabase-user-case-storage.md`
23. `docs/architecture/supabase-production-runbook.md`
24. `docs/architecture/auth-admin-foundation-decision-review.md`
25. `docs/architecture/auth-ssr-admin-validation-adr.md`
26. `docs/specs/auth-spec.md`
27. `docs/specs/admin-spec.md`
28. `docs/specs/database-auth-model.md`
29. `docs/specs/security-model.md`
30. `docs/architecture/system-design.md`
31. `docs/architecture/frontend-structure.md`
32. `docs/architecture/data-flow.md`
33. `docs/architecture/state-management.md`
34. `docs/architecture/routing-map.md`
35. `docs/architecture/screen-data-mapping.md`
36. `docs/architecture/component-map.md`
37. `docs/architecture/case-entity.md`
38. `docs/architecture/mvp-safety-rules.md`
39. `docs/design/design-system.md`
40. `docs/design/mobile-layout.md`
41. `docs/plans/README.md`
42. `docs/plans/active/mvp-scope.md`
43. `docs/plans/active/mvp-roadmap.md`
44. `docs/plans/active/supabase-user-cases-plan.md`
45. `docs/plans/completed/mvp-plan.md`
46. `docs/plans/completed/development-stages.md`
47. `docs/plans/completed/implementation-order.md`
48. `docs/plans/completed/screens-list.md`
49. `docs/plans/completed/screens-flow.md`
50. `docs/plans/completed/admin-users-migration-plan.md`
51. `docs/plans/completed/case-creation-local-storage-plan.md`
52. `docs/plans/completed/saved-case-local-analysis-plan.md`
53. `docs/testing/mvp-checklist.md`
54. `docs/supabase-foundation.md`
55. `docs/plans/active/auth-admin-vercel-plan.md`
