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
- `docs/specs/data-storage.md` — описывает данные кейса, объяснения, плана, ответа, настроек, истории и подготовленную таблицу `public.cases`.

## Plans: этапы реализации

- `docs/plans/mvp-scope.md` — главный источник ограничений MVP: что входит, что не входит, что переносится на следующие этапы.
- `docs/plans/mvp-roadmap.md` — описывает этапы MVP, текущее состояние и критерии готовности.
- `docs/plans/mvp-plan.md` — описывает цель первой версии и минимальный рабочий сценарий.
- `docs/plans/development-stages.md` — делит реализацию MVP на этапы.
- `docs/plans/screens-list.md` — перечисляет экраны MVP, их назначение и действия пользователя.

## Дополнительные разделы

- `docs/design/` — визуальные правила и mobile-first подход.
- `docs/architecture/` — архитектурные ограничения и структура frontend.
- `docs/architecture/system-design.md` — описывает системную архитектуру, слои приложения и роль Supabase Read Layer.
- `docs/testing/` — чеклисты для проверки MVP.

## Ключевые файлы реализации

- `lib/supabase-client.ts` — создает единый типизированный browser-safe Supabase client через публичные переменные окружения.
- `lib/supabase-cases.ts` — содержит подготовительный read-only слой `readSupabaseCases()` для чтения `public.cases`; этот слой не является основным UI storage и не заменяет `localStorage`.

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
- `mvp-scope.md` ограничивает, какие части системы входят в первую версию.
- `mvp-plan.md`, `development-stages.md` и `screens-list.md` описывают порядок реализации выбранного MVP.

## Важное ограничение MVP

В текущем учебном MVP пользователь вставляет текст письма, документа или ситуации вручную. Данные текущего кейса в пользовательском UI хранятся в браузере через `localStorage`. Backend, auth, файловая загрузка, распознавание документов и синхронизация не входят в первую версию. В проекте также есть подготовительный Supabase read-only слой для `public.cases`, но он не подключен к пользовательскому flow и не заменяет локальное хранение. Полный список ограничений хранится в `docs/plans/mvp-scope.md`.

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
12. `docs/architecture/system-design.md`
13. `docs/plans/mvp-scope.md`
14. `docs/plans/mvp-roadmap.md`
15. `docs/plans/mvp-plan.md`
16. `docs/plans/development-stages.md`
17. `docs/plans/screens-list.md`
