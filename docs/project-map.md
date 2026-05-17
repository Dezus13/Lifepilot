# Карта документации LifePilot

## Правила работы

- `AGENTS.md` — короткие правила для агентов: язык проекта, порядок работы и расположение разделов документации.

## Specs: описание системы

- `docs/specs/business-context.md` — объясняет, почему продукт нужен в Австрии, какую боль решает и чем отличается от обычного чат-бота.
- `docs/specs/project-overview.md` — задает общую идею LifePilot, границы ответственности и mobile-first подход.
- `docs/specs/user-flow.md` — описывает путь пользователя от вставки текста до объяснения, плана действий и немецкого ответа.
- `docs/specs/feature-map.md` — показывает основные продуктовые функции и связи между ними.
- `docs/specs/decision-logic.md` — описывает, как система определяет тип ситуации, срочность, предупреждения и следующий шаг.
- `docs/specs/data-storage.md` — описывает данные кейса, объяснения, плана, ответа, настроек и истории.

## Plans: этапы реализации

- `docs/plans/mvp-scope.md` — главный источник ограничений MVP: что входит, что не входит, что переносится на следующие этапы.
- `docs/plans/mvp-plan.md` — описывает цель первой версии и минимальный рабочий сценарий.
- `docs/plans/development-stages.md` — делит реализацию MVP на этапы.
- `docs/plans/screens-list.md` — перечисляет экраны MVP, их назначение и действия пользователя.

## Будущие разделы

- `docs/design/` — будущие дизайн-решения и визуальная система.
- `docs/architecture/` — будущая техническая архитектура.
- `docs/testing/` — будущая стратегия тестирования.

## Связи между specs и plans

- `business-context.md` объясняет, почему выбран такой продуктовый фокус.
- `project-overview.md` превращает бизнес-контекст в общее описание системы.
- `user-flow.md` показывает, как пользователь проходит через систему.
- `feature-map.md` раскладывает пользовательский путь на функции.
- `decision-logic.md` задает правила анализа и рекомендаций.
- `data-storage.md` описывает данные, которые нужны этим функциям.
- `mvp-scope.md` ограничивает, какие части системы входят в первую версию.
- `mvp-plan.md`, `development-stages.md` и `screens-list.md` описывают порядок реализации выбранного MVP.

## Важное ограничение MVP

В MVP пользователь вставляет текст письма, документа или ситуации вручную. Файловая загрузка и распознавание документов не описываются как часть первой версии. Полный список ограничений хранится в `docs/plans/mvp-scope.md`.

## В каком порядке читать

1. `AGENTS.md`
2. `docs/project-map.md`
3. `docs/specs/business-context.md`
4. `docs/specs/project-overview.md`
5. `docs/specs/user-flow.md`
6. `docs/specs/feature-map.md`
7. `docs/specs/decision-logic.md`
8. `docs/specs/data-storage.md`
9. `docs/plans/mvp-scope.md`
10. `docs/plans/mvp-plan.md`
11. `docs/plans/development-stages.md`
12. `docs/plans/screens-list.md`
