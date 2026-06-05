# Frontend-структура MVP LifePilot

## Назначение документа

Этот документ описывает текущую frontend-структуру MVP LifePilot. Он фиксирует фактическую организацию приложения без планирования будущих слоев и папок.

## Общий принцип

Frontend MVP построен на Next.js App Router. Основной сценарий расположен в routes внутри `app/` и работает вокруг одного текущего кейса.

Текущая структура пользовательского MVP не содержит отдельного backend-слоя, сложного state manager или серверного storage-модуля. В проекте есть Supabase foundation layer для `public.cases` и отдельный Auth/Admin Foundation для `/admin/login` и `/admin`. Пользовательский flow не подключен к Supabase как источнику данных и не заменяет локальное хранение.

## Корневая структура

Основной frontend-корень:

```text
app/
  components/
  admin/
  case/
  history/
  onboarding/
  settings/
  error/
```

`app/` является единственным корнем приложения. Отдельный `src/` в текущем MVP не используется.

Общие frontend-утилиты находятся в `lib/`. На текущем этапе там расположены локальные правила анализа, работа с `localStorage`, foundation-клиент Supabase, server-side Supabase client для Auth/Admin и подготовительная функция чтения `public.cases`, которая не используется пользовательским UI.

## Routes

Текущие routes:

- `/` — главный экран;
- `/onboarding` — знакомство и ограничения продукта;
- `/case/new` — создание нового кейса;
- `/case/analyzing` — состояние анализа;
- `/case/result` — результат текущего кейса;
- `/case/draft` — демонстрационный немецкий черновик;
- `/case/high-risk` — предупреждение о риске;
- `/history` — локальная история кейсов;
- `/history/:caseId` — экран деталей сохраненного кейса из локальной истории `localStorage`;
- `/settings/safety` — настройки безопасности;
- `/admin/login` — публичный admin login route;
- `/admin` — protected admin route с server-side validation;
- `/error` — экран ошибки;
- fallback route — неизвестный маршрут.

## Shared components

В текущем MVP общие компоненты находятся в `app/components/`:

- `MobileShell` — мобильная оболочка приложения;
- `MainNavigation` — основная навигация между экранами.

Остальные UI-блоки пока находятся внутри route-файлов. Это приемлемо для текущего MVP, потому что кодовая база небольшая и сценарий линейный.

## Состояние и хранение

Экранное состояние хранится локально в client components. Постоянные данные MVP сохраняются в `localStorage`.

Подробности:

- [state-management.md](./state-management.md) описывает состояние экранов, текущего кейса и истории;
- [../specs/data-storage.md](../specs/data-storage.md) описывает состав данных в `localStorage`.

## Supabase foundation layer

Файл `lib/supabase-client.ts` создает единый lazy singleton для `createClient`.

Файл `lib/supabase-cases.ts` содержит подготовительную функцию `readSupabaseCases()`. Она описывает будущий select-запрос к таблице `public.cases`, приводит данные к `StoredCase[]` и при ошибке возвращает пустой массив. В текущей migration RLS включен, а SELECT policy для anon role отсутствует, поэтому browser anon client не может читать `public.cases` как рабочий источник данных. Структура Case и допустимые статусы описаны в [../specs/case-model.md](../specs/case-model.md).

Требования к этому слою:

- использовать только browser-safe публичные переменные окружения Next.js;
- не создавать клиент повторно при нескольких импортах;
- возвращать типизированный клиент с описанием формы `public.cases`;
- не подключать auth, storage buckets или server actions;
- не записывать данные в Supabase из пользовательского flow;
- не изменять существующий `localStorage` flow.

Если Supabase-переменные отсутствуют, development-среда получает безопасную ошибку конфигурации. В production foundation layer не должен раскрывать технические детали пользователю.

## Auth/Admin Foundation layer

Auth/Admin Foundation реализован отдельно от пользовательского MVP:

- `app/admin/login/page.tsx` показывает admin login form;
- `app/admin/login/actions.ts` выполняет Supabase Auth email/password login через Server Action;
- `app/admin/page.tsx` защищает `/admin` через server-side validation;
- `app/admin/actions.ts` выполняет logout;
- `lib/supabase-server.ts` создает Supabase server client через `@supabase/ssr`;
- `lib/admin-auth.ts` проверяет session, Auth user и собственную active admin row в `public.admin_users`.

Этот слой не меняет `lifepilot.currentCase`, `lifepilot.caseHistory` и пользовательские routes MVP.

## Границы frontend MVP

В текущей frontend-структуре не нужны:

- отдельный UI-kit;
- глобальный store;
- server state;
- OCR, PDF, email или billing-модули;
- пустые папки без использования в текущем MVP.

Текущий MVP держит структуру простой: route-файлы, общие компоненты оболочки и локальное хранение в браузере.

## Связанные документы

- [mvp-architecture.md](./mvp-architecture.md) описывает общую архитектуру текущего MVP.
- [routing-map.md](./routing-map.md) описывает маршруты и переходы.
- [screen-data-mapping.md](./screen-data-mapping.md) описывает данные по экранам.
- [component-map.md](./component-map.md) описывает компоненты по экранам MVP.
- [../plans/completed/screens-flow.md](../plans/completed/screens-flow.md) описывает UI-поток экранов.
