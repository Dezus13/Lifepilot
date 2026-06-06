# План локального анализа сохраненного кейса

## Цель функции

Реализовать вторую user-facing функцию MVP: пользователь открывает сохраненный кейс из локальной истории и видит локальный анализ сохраненного текста.

Функция должна показать в detail view сохраненного кейса:

- risk level;
- priority;
- краткое объяснение;
- action plan.

Анализ должен работать локально, без Supabase, Auth, RLS, database, migrations, backend API или внешних AI API.

## Scope

Scope ограничен пользовательским MVP и существующим local-first flow.

Источник требований:

- `docs/plans/active/mvp-scope.md`;
- `docs/specs/mvp-definition.md`;
- `docs/specs/user-flow.md`;
- `docs/specs/decision-logic.md`;
- `docs/specs/data-storage.md`;
- `docs/specs/case-model.md`;
- `docs/architecture/data-flow.md`;
- `docs/architecture/state-management.md`;
- `docs/architecture/routing-map.md`;
- `docs/testing/mvp-checklist.md`.

## Что входит

- Проверить detail route `/history/[caseId]` как точку просмотра сохраненного кейса.
- Читать сохраненный кейс только из `lifepilot.caseHistory`.
- Показывать risk level сохраненного кейса.
- Показывать priority level и краткое priority summary.
- Показывать краткое объяснение результата анализа.
- Показывать action plan из сохраненного анализа.
- Безопасно обрабатывать старые кейсы без новых полей анализа.
- При необходимости пересчитывать локальный анализ из `sourceText`, если сохраненный кейс содержит текст, но не содержит актуальные поля анализа.
- Показывать `Nicht gefunden` для отсутствующих фактов, а не ломать экран.
- Сохранять local-first поведение и не менять текущий кейс без явной необходимости.

## Что не входит

- Запись кейсов в Supabase.
- Чтение кейсов из Supabase.
- Изменение RLS, Auth, Admin или database schema.
- User-facing accounts.
- Синхронизация между устройствами.
- Backend API или внешние AI API.
- OCR, PDF parser, загрузка файлов или изображений.
- Архив, экспорт, восстановление или серверное удаление кейсов.
- Автоматическая отправка писем.
- Несколько вариантов немецкого ответа.
- Изменение Technical Foundation.
- Новые specs или изменение MVP scope.

## Файлы, которые будут изменены позже

Ожидаемые файлы реализации:

- `app/history/[caseId]/page.tsx`;
- `app/history/page.tsx`;
- `app/case/result/page.tsx`;
- `lib/analysis-rules.ts`;
- `lib/action-plan.ts`;
- `lib/case-storage.ts`;
- `lib/types.ts`.

Файлы нужно менять только если это требуется для acceptance criteria.

## Acceptance Criteria

- Пользователь может открыть сохраненный кейс из `/history`.
- `/history/[caseId]` читает кейс из `lifepilot.caseHistory`.
- Сохраненный кейс показывает risk level.
- Сохраненный кейс показывает priority level и краткое summary.
- Сохраненный кейс показывает краткое объяснение анализа.
- Сохраненный кейс показывает action plan из 3-5 коротких шагов.
- Старый кейс без `analysis.priorityLevel`, `analysis.prioritySummary` или `analysis.actionPlan` не ломает экран.
- Если старый кейс содержит `sourceText`, локальный анализ может быть пересчитан на клиенте без backend.
- Если данных недостаточно, экран показывает осторожный fallback и `Nicht gefunden`.
- Кейс не передается через URL.
- Supabase, Auth/Admin, RLS, database, migrations и package.json не меняются.
- Основной пользовательский flow остается local-first.

## Тестовые сценарии

1. Создать новый кейс, открыть `/history`, затем открыть detail view сохраненного кейса.
   - Ожидается отображение risk level, priority, краткого объяснения и action plan.

2. Открыть high risk кейс из истории.
   - Ожидается высокий risk level, высокий или критический priority, осторожное объяснение и практичный action plan.

3. Открыть medium risk кейс из истории.
   - Ожидается отображение срока, требования или суммы, если они найдены локальными правилами.

4. Открыть low risk кейс из истории.
   - Ожидается спокойный risk level, низкий priority и короткий план проверки фактов.

5. Открыть старый локальный кейс без новых полей `analysis`.
   - Ожидается безопасный fallback или локальный пересчет из `sourceText`.
   - Экран не падает и не показывает пустые поля без подписи.

6. Открыть несуществующий `caseId`.
   - Ожидается empty state и ссылка назад в историю.

7. Повредить `lifepilot.caseHistory`.
   - Ожидается безопасное состояние истории и detail route без runtime ошибки.

8. Проверить, что после открытия detail view не появляется обращение к Supabase или внешнему API.
   - Ожидается только локальное чтение из браузера.

## Риски

- Можно случайно подключить Supabase к просмотру сохраненного кейса, что нарушит MVP scope.
- Можно начать менять Auth/Admin или RLS без необходимости.
- Можно дублировать логику анализа между result screen и detail view.
- Можно расширить `StoredCase` без обновления specs.
- Можно сломать старые локальные кейсы без новых полей анализа.
- Можно изменить `lifepilot.currentCase` при простом просмотре detail view и запутать пользовательский flow.
- Можно показать уверенный вывод там, где данных недостаточно.

## Definition of Done

Функция считается готовой только если:

- acceptance criteria выполнены;
- тестовые сценарии пройдены вручную;
- `npm run build` проходит;
- `docs/testing/mvp-checklist.md` проверен по релевантным пунктам;
- specs не требуют обновления или обновлены до кода, если требования изменились;
- `docs/project-map.md` обновлен при изменении структуры;
- `docs/changelog.md` обновлен при значимом изменении;
- Supabase, Auth/Admin, RLS, database schema, migrations и Technical Foundation не изменены;
- план перенесен в `docs/plans/completed/` после завершения реализации.
