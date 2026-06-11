# MVP Status LifePilot

## Implemented

- Создание кейса из текстового ввода.
- Локальный rule-based анализ текста.
- Уровень риска.
- Приоритет.
- Статус кейса.
- План действий.
- Сохранение текущего кейса в `localStorage`.
- Локальная история кейсов.
- Детальный просмотр сохраненного кейса из истории.
- Локальный пересчет анализа для старых сохраненных кейсов при наличии `sourceText`.
- Демонстрационный немецкий черновик.
- Safety/limitations screen.
- Supabase Foundation для будущего database stage: schema/client/type foundation без подключения к пользовательскому flow.
- Admin Auth Foundation для `/admin/login` и `/admin`.

## Next Stage

- Vercel/production-проверки в рамках `docs/plans/active/auth-admin-vercel-plan.md`.
- Supabase user-case storage implementation gate в рамках `docs/plans/active/supabase-implementation-plan.md`; реализация начинается только после явного утверждения плана.

## Future / Requires Separate Approved Plan

- User-facing Auth implementation.
- Supabase как рабочее хранилище пользовательских кейсов после утверждения implementation plan.
- API для серверной обработки и интеграций.
- Экспорт и архив.
- Расширение тестирования.

## Out Of Scope For Current MVP

- OCR.
- PDF parser.
- Загрузка файлов и изображений.
- Multi-device sync в текущем MVP.
- Автоматическая отправка писем.
- Платежи, Stripe и billing.
- Командная или семейная работа.
- Полноценная юридическая база знаний.
- Юридическая гарантия результата.
