# Frontend-структура MVP LifePilot

## Назначение документа

Этот документ описывает текущую frontend-структуру MVP LifePilot. Он фиксирует фактическую организацию приложения без планирования будущих слоев и папок.

## Общий принцип

Frontend MVP построен на Next.js App Router. Основной сценарий расположен в routes внутри `app/` и работает вокруг одного текущего кейса.

Текущая структура не содержит отдельного backend-слоя, auth-слоя, database-слоя, API-клиентов, сложного state manager или отдельного storage-модуля.

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

## Границы frontend MVP

В текущей frontend-структуре не нужны:

- отдельный UI-kit;
- глобальный store;
- server state;
- auth routes;
- API clients;
- OCR, PDF, email или billing-модули;
- пустые папки без использования в текущем MVP.

Текущий MVP держит структуру простой: route-файлы, общие компоненты оболочки и локальное хранение в браузере.

## Связанные документы

- [mvp-architecture.md](./mvp-architecture.md) описывает общую архитектуру текущего MVP.
- [routing-map.md](./routing-map.md) описывает маршруты и переходы.
- [screen-data-mapping.md](./screen-data-mapping.md) описывает данные по экранам.
- [component-map.md](./component-map.md) описывает компоненты по экранам MVP.
- [../plans/screens-flow.md](../plans/screens-flow.md) описывает UI-поток экранов.
