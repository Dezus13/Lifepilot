# Карта документации LifePilot

## Правила работы

- `AGENTS.md` — главный рабочий регламент для ИИ-агентов: startup workflow, source of truth, правила specs/plans/project-map, Git workflow, security/Auth/Supabase правила и Definition of Done.
- `docs/changelog.md` — журнал значимых изменений проекта и минимальный changelog workflow.

## Specs: описание системы

- `docs/specs/business-context.md` — объясняет, почему продукт нужен в Австрии, какую боль решает и чем отличается от обычного чат-бота.
- `docs/specs/project-overview.md` — задает общую идею LifePilot, границы ответственности и mobile-first подход.
- `docs/specs/mvp-definition.md` — фиксирует состав user-facing MVP, отдельные technical foundation-компоненты, критерии готовности и Post-MVP направления.
- `docs/specs/glossary.md` — задает единый словарь терминов проекта.
- `docs/specs/user-flow.md` — описывает путь пользователя от вставки текста до объяснения, плана действий и немецкого ответа.
- `docs/specs/feature-map.md` — показывает основные продуктовые функции и связи между ними.
- `docs/specs/decision-logic.md` — описывает, как система определяет тип ситуации, срочность, предупреждения и следующий шаг.
- `docs/specs/case-model.md` — единственный источник правды для модели Case, полей `public.cases`, статусов, жизненного цикла и границ текущего MVP.
- `docs/specs/data-storage.md` — описывает данные кейса, объяснения, плана, ответа, границы safety screen, истории и подготовленную таблицу `public.cases`.
- `docs/specs/auth-spec.md` — описывает login, logout, session validation, protected routes, auth states и error states для Auth Foundation.
- `docs/specs/admin-spec.md` — описывает admin identity, allowlist flow, admin access rules и admin session rules.
- `docs/specs/database-auth-model.md` — описывает `auth.users`, `public.admin_users`, связи, поля и ограничения.
- `docs/specs/security-model.md` — описывает server-side only operations, service role boundaries, env variables и forbidden client operations.

## Plans: этапы реализации

- `docs/plans/README.md` — описывает правила работы с активными и завершенными планами.
- `docs/plans/active/mvp-scope.md` — главный источник ограничений MVP: что входит, что не входит, что переносится на следующие этапы.
- `docs/plans/active/mvp-roadmap.md` — описывает этапы MVP, текущее состояние и критерии готовности.
- `docs/plans/active/case-creation-local-storage-plan.md` — активный план первой user-facing функции MVP: создание кейса из текстового ввода и локальное сохранение в `localStorage`.
- `docs/plans/completed/mvp-plan.md` — описывает цель первой версии и минимальный рабочий сценарий.
- `docs/plans/completed/development-stages.md` — делит реализацию MVP на этапы.
- `docs/plans/completed/implementation-order.md` — фиксирует порядок реализации MVP и очередность задач.
- `docs/plans/completed/screens-list.md` — перечисляет экраны MVP, их назначение и действия пользователя.
- `docs/plans/completed/screens-flow.md` — описывает переходы между экранами и пользовательский flow.
- `docs/plans/completed/admin-users-migration-plan.md` — описывает реализованную migration для `public.admin_users` и правила дальнейшей проверки.
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
- `docs/architecture/mvp-safety-rules.md` — фиксирует safety-правила MVP, ограничения черновика и осторожное поведение.
- `docs/architecture/auth-admin-foundation-decision-review.md` — source of truth для решений реализованного Auth/Admin Foundation.
- `docs/architecture/auth-ssr-admin-validation-adr.md` — source of truth для `@supabase/ssr`, cookie session persistence, RLS policy и admin validation без service role key.

## Design: визуальные правила

- `docs/design/design-system.md` — описывает визуальный язык, компоненты, предупреждения и mobile-first правила.
- `docs/design/mobile-layout.md` — фиксирует мобильную структуру экранов, прокрутку, действия и предупреждения.

## Testing: проверки MVP

- `docs/testing/mvp-checklist.md` — чеклист проверки MVP, localStorage flow, Supabase foundation и мобильного UI.

## Changelog

- `docs/changelog.md` — фиксирует значимые изменения проекта и правила обновления changelog.

## Supabase

- `docs/supabase-local-connection.md` — описывает текущий Supabase foundation, hosted-подключение, RLS и отсутствие anon SELECT policy.

## Ключевые файлы реализации

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
- `data-storage.md` описывает данные, которые нужны этим функциям.
- `auth-spec.md`, `admin-spec.md`, `database-auth-model.md` и `security-model.md` описывают реализованный Auth/Admin Foundation.
- `mvp-scope.md` ограничивает, какие части системы входят в первую версию.
- `mvp-plan.md`, `development-stages.md`, `implementation-order.md`, `screens-list.md` и `screens-flow.md` описывают порядок реализации выбранного MVP.
- `admin-users-migration-plan.md` описывает реализованную migration для `public.admin_users`. Оставшиеся Vercel/production-проверки ведутся в `auth-admin-vercel-plan.md`.

## Важное ограничение MVP

В текущем учебном MVP пользователь вставляет текст письма, документа или ситуации вручную. Данные текущего кейса в пользовательском UI хранятся в браузере через `localStorage`. User-facing accounts, файловая загрузка, распознавание документов и синхронизация не входят в первую версию. В проекте также есть подготовительный Supabase foundation для `public.cases`, но anon SELECT сейчас не разрешен и этот слой не подключен к пользовательскому flow. Admin Auth Foundation реализован отдельно и не меняет пользовательский MVP-flow. Полный список ограничений хранится в `docs/plans/active/mvp-scope.md`.

## В каком порядке читать

1. `AGENTS.md`
2. `docs/project-map.md`
3. `docs/changelog.md`
4. `docs/specs/business-context.md`
5. `docs/specs/project-overview.md`
6. `docs/specs/mvp-definition.md`
7. `docs/specs/glossary.md`
8. `docs/specs/user-flow.md`
9. `docs/specs/feature-map.md`
10. `docs/specs/decision-logic.md`
11. `docs/specs/case-model.md`
12. `docs/specs/data-storage.md`
13. `docs/architecture/auth-admin-foundation-decision-review.md`
14. `docs/architecture/auth-ssr-admin-validation-adr.md`
15. `docs/specs/auth-spec.md`
16. `docs/specs/admin-spec.md`
17. `docs/specs/database-auth-model.md`
18. `docs/specs/security-model.md`
19. `docs/architecture/system-design.md`
20. `docs/architecture/frontend-structure.md`
21. `docs/architecture/data-flow.md`
22. `docs/architecture/state-management.md`
23. `docs/architecture/routing-map.md`
24. `docs/architecture/screen-data-mapping.md`
25. `docs/architecture/component-map.md`
26. `docs/architecture/case-entity.md`
27. `docs/architecture/mvp-safety-rules.md`
28. `docs/design/design-system.md`
29. `docs/design/mobile-layout.md`
30. `docs/plans/README.md`
31. `docs/plans/active/mvp-scope.md`
32. `docs/plans/active/mvp-roadmap.md`
33. `docs/plans/active/case-creation-local-storage-plan.md`
34. `docs/plans/completed/mvp-plan.md`
35. `docs/plans/completed/development-stages.md`
36. `docs/plans/completed/implementation-order.md`
37. `docs/plans/completed/screens-list.md`
38. `docs/plans/completed/screens-flow.md`
39. `docs/plans/completed/admin-users-migration-plan.md`
40. `docs/testing/mvp-checklist.md`
41. `docs/supabase-local-connection.md`
42. `docs/plans/active/auth-admin-vercel-plan.md`
