# Подключение Supabase

## Назначение документа

Этот документ фиксирует текущую связь LifePilot с hosted Supabase project. Supabase на этом этапе является только schema/client foundation layer и не заменяет `localStorage` в пользовательском MVP-flow.

Каноническая структура Case, `StoredCase`, `SupabaseCaseRow`, таблица `public.cases` и статусная модель описаны в [specs/case-model.md](./specs/case-model.md).

## Локальные переменные окружения

Локально используется `.env.local` со значениями hosted Supabase project:

```text
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

`.env.local` нужен только для локального окружения и не должен попадать в Git.

## Безопасность

- В репозиторий отправляется только `.env.example` без реальных ключей.
- Реальные значения хранятся только локально или в dashboard окружения деплоя.
- `service_role` key, приватные токены и production credentials нельзя использовать во frontend.
- Supabase Auth, SELECT policy для anon, дополнительные RLS policies и запись данных не включены в текущий MVP-flow.

## База данных

Используется удаленный hosted Supabase project.

Основная таблица foundation layer:

- `public.cases`

Назначение таблицы:

`public.cases` описывает форму кейса для будущего database stage: исходный текст, категорию, summary, priority, risk level, status, analysis и action plan.

В текущем MVP пользовательские экраны создания, результата, истории и детального просмотра продолжают работать через `localStorage`. Функция `readSupabaseCases()` существует как подготовительная функция, но migration включает RLS без SELECT policy для anon role. Поэтому browser anon client сейчас не может читать `public.cases` как рабочий источник данных. UI не должен использовать Supabase как основной источник данных, не должен записывать кейсы в Supabase и не должен запускать синхронизацию истории.
