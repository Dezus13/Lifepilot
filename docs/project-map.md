# Карта документации LifePilot

## Правила работы

- `AGENTS.md` — короткие правила для агентов: язык проекта, порядок работы и расположение разделов документации.

## Specs: описание системы

- `docs/specs/business-context.md` — объясняет, почему продукт нужен в Австрии, какую боль решает и чем отличается от обычного чат-бота.
- `docs/specs/project-overview.md` — задает общую идею LifePilot, границы ответственности и mobile-first подход.
- `docs/specs/mvp-definition.md` — фиксирует текущий состав MVP, критерии готовности и Post-MVP направления без обещания нереализованных функций.
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

- `docs/plans/mvp-scope.md` — главный источник ограничений MVP: что входит, что не входит, что переносится на следующие этапы.
- `docs/plans/mvp-roadmap.md` — описывает этапы MVP, текущее состояние и критерии готовности.
- `docs/plans/mvp-plan.md` — описывает цель первой версии и минимальный рабочий сценарий.
- `docs/plans/development-stages.md` — делит реализацию MVP на этапы.
- `docs/plans/implementation-order.md` — фиксирует порядок реализации MVP и очередность задач.
- `docs/plans/screens-list.md` — перечисляет экраны MVP, их назначение и действия пользователя.
- `docs/plans/screens-flow.md` — описывает переходы между экранами и пользовательский flow.
- `docs/plans/admin-users-migration-plan.md` — описывает migration plan для `public.admin_users` без изменения schema до approval.
- `docs/plans/auth-admin-vercel-plan.md` — отдельный план будущего этапа Supabase Auth, admin login, protected admin page и Vercel deploy.

## Architecture: структура и ограничения

- `docs/architecture/mvp-architecture.md` — описывает базовую архитектуру MVP и роль `localStorage`.
- `docs/architecture/system-design.md` — описывает системную архитектуру, слои приложения и роль Supabase Foundation Layer.
- `docs/architecture/frontend-structure.md` — описывает структуру frontend, маршруты и общие frontend-утилиты.
- `docs/architecture/data-flow.md` — описывает движение данных между вводом, анализом, результатом, историей и Supabase foundation.
- `docs/architecture/state-management.md` — описывает состояние экранов, текущий кейс и локальную историю.
- `docs/architecture/routing-map.md` — фиксирует карту маршрутов, state-guarded routes и fallback-поведение.
- `docs/architecture/screen-data-mapping.md` — связывает экраны с данными, которые они читают и изменяют.
- `docs/architecture/component-map.md` — описывает компонентные зоны экранов без реализации компонентов.
- `docs/architecture/case-entity.md` — описывает архитектурный смысл Case и ссылается на `case-model.md` как source of truth.
- `docs/architecture/mvp-safety-rules.md` — фиксирует safety-правила MVP, ограничения черновика и осторожное поведение.
- `docs/architecture/auth-admin-foundation-decision-review.md` — source of truth для решений Auth/Admin Foundation перед обновлением specs.
- `docs/architecture/auth-ssr-admin-validation-adr.md` — source of truth для `@supabase/ssr`, cookie session persistence, RLS policy и admin validation без service role key.

## Design: визуальные правила

- `docs/design/design-system.md` — описывает визуальный язык, компоненты, предупреждения и mobile-first правила.
- `docs/design/mobile-layout.md` — фиксирует мобильную структуру экранов, прокрутку, действия и предупреждения.

## Testing: проверки MVP

- `docs/testing/mvp-checklist.md` — чеклист проверки MVP, localStorage flow, Supabase foundation и мобильного UI.

## Supabase

- `docs/supabase-local-connection.md` — описывает текущий Supabase foundation, hosted-подключение, RLS и отсутствие anon SELECT policy.

## Ключевые файлы реализации

- `lib/supabase-client.ts` — создает единый типизированный browser-safe Supabase client через публичные переменные окружения.
- `lib/supabase-cases.ts` — содержит подготовительную функцию `readSupabaseCases()` для будущего чтения `public.cases`; из-за RLS без SELECT policy anon client сейчас не может читать таблицу как рабочий источник данных, а UI не заменяет `localStorage`.

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
- `auth-spec.md`, `admin-spec.md`, `database-auth-model.md` и `security-model.md` переводят Auth/Admin ADR в specs для будущей реализации.
- `mvp-scope.md` ограничивает, какие части системы входят в первую версию.
- `mvp-plan.md`, `development-stages.md`, `implementation-order.md`, `screens-list.md` и `screens-flow.md` описывают порядок реализации выбранного MVP.
- `admin-users-migration-plan.md` описывает будущую migration для `public.admin_users`, но не заменяет approval на реализацию.

## Важное ограничение MVP

В текущем учебном MVP пользователь вставляет текст письма, документа или ситуации вручную. Данные текущего кейса в пользовательском UI хранятся в браузере через `localStorage`. Backend, auth, файловая загрузка, распознавание документов и синхронизация не входят в первую версию. В проекте также есть подготовительный Supabase foundation для `public.cases`, но anon SELECT сейчас не разрешен и этот слой не подключен к пользовательскому flow. Полный список ограничений хранится в `docs/plans/mvp-scope.md`.

## В каком порядке читать

1. `AGENTS.md`
2. `docs/project-map.md`
3. `docs/specs/business-context.md`
4. `docs/specs/project-overview.md`
5. `docs/specs/mvp-definition.md`
6. `docs/specs/glossary.md`
7. `docs/specs/user-flow.md`
8. `docs/specs/feature-map.md`
9. `docs/specs/decision-logic.md`
10. `docs/specs/case-model.md`
11. `docs/specs/data-storage.md`
12. `docs/architecture/auth-admin-foundation-decision-review.md`
13. `docs/architecture/auth-ssr-admin-validation-adr.md`
14. `docs/specs/auth-spec.md`
15. `docs/specs/admin-spec.md`
16. `docs/specs/database-auth-model.md`
17. `docs/specs/security-model.md`
18. `docs/architecture/system-design.md`
19. `docs/architecture/frontend-structure.md`
20. `docs/architecture/data-flow.md`
21. `docs/architecture/state-management.md`
22. `docs/architecture/routing-map.md`
23. `docs/architecture/screen-data-mapping.md`
24. `docs/architecture/component-map.md`
25. `docs/architecture/case-entity.md`
26. `docs/architecture/mvp-safety-rules.md`
27. `docs/design/design-system.md`
28. `docs/design/mobile-layout.md`
29. `docs/plans/mvp-scope.md`
30. `docs/plans/mvp-roadmap.md`
31. `docs/plans/mvp-plan.md`
32. `docs/plans/development-stages.md`
33. `docs/plans/implementation-order.md`
34. `docs/plans/screens-list.md`
35. `docs/plans/screens-flow.md`
36. `docs/plans/admin-users-migration-plan.md`
37. `docs/testing/mvp-checklist.md`
38. `docs/supabase-local-connection.md`
39. `docs/plans/auth-admin-vercel-plan.md`
