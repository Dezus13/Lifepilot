# Roadmap LifePilot

## Назначение

Этот документ — обзорный roadmap на уровне продукта. Он разделяет текущий user-facing MVP, следующий технический этап и будущие направления без детализации реализации.

Детальный план реализации с этапами, техническим состоянием и критериями готовности: `docs/plans/active/mvp-roadmap.md`.

Scope-решения о том, что входит, не входит и переносится в Post-MVP: `docs/plans/active/mvp-scope.md`.

## Current MVP

Текущий пользовательский MVP работает local-first через `localStorage`. Supabase не является рабочим хранилищем пользовательских кейсов, user-facing Auth не включен, синхронизация между устройствами не реализована.

- Создание кейса из текстового ввода с локальным сохранением в `localStorage`.
- Локальный анализ сохраненного кейса из истории: уровень риска, приоритет, краткое объяснение и план действий.
- Dashboard, локальная история, поиск, фильтры, сортировка и detail view сохраненного кейса.
- Демонстрационный немецкий черновик без автоматической отправки.
- Supabase Foundation для `public.cases` и Admin Auth Foundation существуют только как technical foundation.

## Next Stage

- `docs/plans/active/auth-admin-vercel-plan.md` — активный technical foundation-план для Auth/Admin и Vercel/production-проверок. Он не является user-facing MVP-функцией и не подключает Auth или Supabase к пользовательскому flow.
- `docs/plans/active/supabase-implementation-plan.md` — active implementation plan для будущего Supabase user-case storage. Он закрывает documentation gates для Auth decision, schema review, SQL RLS policy contract, migration plan, testing checklist и rollout/rollback, но реализация начинается только после явного утверждения плана пользователем.

Planning docs для user-facing Supabase stage созданы. Следующий gate — явное утверждение implementation plan и последовательное выполнение фаз без изменения Current MVP localStorage-first поведения.

## Future

- Auth для пользовательских аккаунтов.
- Supabase как рабочее хранилище пользовательских кейсов.
- API для серверной обработки и интеграций.
- Экспорт и архив кейсов.
- Улучшение тестирования.
