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

### 2026-06-07

- Завершен план второй user-facing функции MVP: `saved-case-local-analysis-plan.md` перенесен из `docs/plans/active/` в `docs/plans/completed/` после ручной browser-проверки.

### 2026-06-06

- Синхронизирована документация после уточнения роли `AGENTS.md`, Supabase foundation и Admin Auth Foundation.
- Добавлен минимальный changelog workflow.
- Создан active plan для первой user-facing функции MVP: создание кейса и локальное сохранение в `localStorage`.
- Создан active plan для второй user-facing функции MVP: локальный анализ сохраненного кейса из истории.
- Реализован локальный анализ сохраненного кейса в detail view истории без Supabase, Auth, database или backend API.
