# Frontend-структура MVP LifePilot

## Назначение документа

Этот документ описывает текущую frontend-структуру MVP LifePilot. Он фиксирует фактическую организацию приложения без планирования будущих слоев и папок.

## Общий принцип

Frontend MVP построен на Next.js App Router. Основной сценарий расположен в routes внутри `app/` и работает вокруг одного текущего кейса.

Текущая структура не содержит отдельного backend-слоя, auth-слоя, сложного state manager или серверного storage-модуля. В проекте есть Supabase foundation layer: единый client и read-only модуль для таблицы `public.cases`. Этот слой не подключен к пользовательскому flow и не заменяет локальное хранение.

## Корневая структура

Основной frontend-корень:

```text
app/
  components/
  case/
  history/
  onboarding/
  settings/
  error/
```

`app/` является единственным корнем приложения. Отдельный `src/` в текущем MVP не используется.

Общие frontend-утилиты находятся в `lib/`. На текущем этапе там расположены локальные правила анализа, работа с `localStorage`, foundation-клиент Supabase и подготовительное read-only чтение `public.cases`.

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
- `/history/:caseId` — placeholder просмотра сохраненного кейса;
- `/settings/safety` — настройки безопасности;
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

Файл `lib/supabase-cases.ts` содержит подготовительную функцию `readSupabaseCases()`. Она читает список строк из таблицы `public.cases` через существующий Supabase client, приводит данные к `StoredCase[]` и при ошибке возвращает пустой массив.

Требования к этому слою:

- использовать только browser-safe публичные переменные окружения Next.js;
- не создавать клиент повторно при нескольких импортах;
- возвращать типизированный клиент с описанием read-only формы `public.cases`;
- не подключать auth, storage buckets или server actions;
- не записывать данные в Supabase из пользовательского flow;
- не изменять существующий `localStorage` flow.

Если Supabase-переменные отсутствуют, development-среда получает безопасную ошибку конфигурации. В production foundation layer не должен раскрывать технические детали пользователю.

## Границы frontend MVP

В текущей frontend-структуре не нужны:

- отдельный UI-kit;
- глобальный store;
- server state;
- auth routes;
- дополнительные Supabase clients поверх foundation layer;
- OCR, PDF, email или billing-модули;
- пустые папки без использования в текущем MVP.

Текущий MVP держит структуру простой: route-файлы, общие компоненты оболочки и локальное хранение в браузере.

## Связанные документы

- [mvp-architecture.md](./mvp-architecture.md) описывает общую архитектуру текущего MVP.
- [routing-map.md](./routing-map.md) описывает маршруты и переходы.
- [screen-data-mapping.md](./screen-data-mapping.md) описывает данные по экранам.
- [component-map.md](./component-map.md) описывает компоненты по экранам MVP.
- [../plans/screens-flow.md](../plans/screens-flow.md) описывает UI-поток экранов.
