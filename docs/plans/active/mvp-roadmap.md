# MVP Roadmap

## Цель проекта

LifePilot помогает людям, которые живут в Австрии, понимать письма, документы и бытовые бюрократические ситуации на немецком языке. Цель продукта — снизить стресс пользователя, показать смысл текста, риски и следующий практический шаг без обещания юридической консультации.

---

## Текущее состояние проекта

User-facing MVP:

- Next.js приложение
- Mobile-first интерфейс
- Анализ кейсов
- LocalStorage flow
- Action Plan Engine
- Priority Engine
- Case Status Engine
- Case Detail Screen
- Документация проекта
- Типизированная модель Case

Technical Foundation:

- Supabase schema/client foundation
- Таблица `public.cases` с RLS без anon SELECT policy
- Admin Auth Foundation для `/admin/login` и `/admin`
- Таблица `public.admin_users`
- Server-side admin validation

Technical Foundation не является пользовательской функцией MVP и не заменяет `localStorage` в пользовательском flow.

Каноническая структура Case, статусы и жизненный цикл описаны в `docs/specs/case-model.md`.

---

## Этап 1 — Основа MVP

Статус: Выполнено

Что входит:

- Структура проекта
- AGENTS.md
- Specs
- Architecture
- Project Map
- LocalStorage
- Основные страницы приложения

---

## Этап 2 — Подготовка Supabase

Статус: Выполнено частично

Что входит:

- Supabase client
- Таблица public.cases
- Миграции
- Подготовительная функция чтения без разрешенного anon SELECT
- Документация хранения данных

Пользовательский интерфейс пока не использует Supabase как основной источник данных.

Основной источник данных MVP остается `localStorage`; Supabase является подготовленным schema/client foundation. RLS для `public.cases` включен, SELECT policy для anon role сейчас отсутствует.

Этот этап относится к Technical Foundation и не является подключением database к user-facing MVP.

---

## Этап 3 — User-facing Supabase stage

Статус: Next implementation gate / требует явного утверждения active implementation plan

Этот этап не входит в Current MVP и не меняет localStorage-first пользовательский flow без отдельной реализации. Planning docs созданы: user auth decision, schema v1, SQL RLS policy contract, public cases migration plan, testing checklist и production runbook. Реализация начинается только после явного утверждения `docs/plans/active/supabase-implementation-plan.md`.

Возможный scope будущего этапа:

- Запись кейсов в Supabase
- Чтение кейсов из Supabase
- Синхронизация данных между устройствами после user-facing Auth
- Обработка ошибок

---

## Этап 4 — User-facing accounts

Статус: Future / требует отдельного approved active plan

Что входит:

- Регистрация
- Вход
- Привязка кейсов к пользователю
- Защита данных

---

## Этап 5 — Production MVP

Статус: Next/Future после завершения active Vercel/production-проверок

Что входит:

- Полный пользовательский flow
- Тестирование
- Оптимизация UX
- Deploy
- Мониторинг ошибок

---

## Что не входит в текущий MVP

- User-facing Auth
- Supabase как рабочее хранилище пользовательских кейсов
- Синхронизация пользовательской истории между устройствами
- Командная работа
- Real-time collaboration
- Платные подписки
- AI-агенты
- Мобильное приложение
- Корпоративные аккаунты

---

## Технический долг

- Выполнение утвержденного Supabase implementation plan
- Применение SQL RLS policies после review
- Применение `public.cases` migration после review
- Проверка rollout/rollback и recovery gates

Эти пункты не являются разрешением на изменение текущей local-first реализации. Изменения кода, schema и migrations возможны только после явного утверждения Supabase implementation plan.

---

## Критерии готовности MVP

MVP считается готовым, когда:

- Пользователь может создать кейс
- Кейсы сохраняются
- Кейсы анализируются
- Action Plan формируется
- Данные не теряются
- Build проходит без ошибок
- Документация соответствует реализации
