# LifePilot

LifePilot — local-first MVP помощника для людей, которые живут в Австрии и получают письма, документы или бытовые бюрократические сообщения на немецком языке.

Проект показывает полный пользовательский сценарий: вставить текст, получить локальный разбор, увидеть уровень риска, понять приоритет, получить план действий и вернуться к сохраненному кейсу из истории.

LifePilot не является юридической консультацией, не отправляет письма автоматически и не гарантирует юридический результат. Пользователь должен вручную проверять факты, сроки, суммы и немецкий черновик.

## Project Overview

LifePilot оформлен как продуктовый MVP с явным scope, документацией, roadmap, архитектурными решениями, demo script и governance-правилами для дальнейшей разработки.

Текущая версия проверяет главную ценность продукта без backend-зависимости: пользователь может обработать текст локально в браузере, сохранить кейс в истории и повторно открыть результат.

## Problem Statement

Люди, которые недавно переехали в Австрию или плохо понимают немецкую бюрократическую коммуникацию, часто сталкиваются с письмами от ведомств, арендодателей, страховых, банков или сервисов. Главная проблема не только в переводе, а в понимании:

- насколько ситуация срочная;
- есть ли риск пропустить срок;
- что нужно сделать следующим шагом;
- какие факты надо проверить перед ответом;
- как не принять письмо за менее важное, чем оно есть.

Обычный переводчик не дает структурированный risk/priority/action plan, а полноценные юридические сервисы слишком тяжелые для первого MVP.

## Solution

LifePilot предлагает простой local-first flow:

1. Пользователь вручную вставляет текст письма, документа или ситуации.
2. Приложение локально анализирует текст rule-based логикой.
3. Пользователь получает краткое объяснение, risk level, priority и action plan.
4. Кейс сохраняется в `localStorage`.
5. Пользователь может открыть историю и повторно просмотреть сохраненный кейс.

Такой подход позволяет проверить продуктовую ценность без Auth, Supabase-хранилища, API и внешних AI-сервисов в пользовательском flow.

## MVP Features

Реализовано в user-facing MVP:

- создание кейса из текстового ввода;
- локальный rule-based анализ текста;
- risk level;
- priority;
- case status;
- action plan;
- демонстрационный немецкий черновик;
- сохранение текущего кейса в `localStorage`;
- локальная история кейсов;
- детальный просмотр сохраненного кейса;
- локальный пересчет анализа для старых кейсов при наличии `sourceText`;
- предупреждения о границах ответственности.

Не входит в текущий user-facing MVP:

- пользовательская авторизация;
- запись пользовательских кейсов в Supabase;
- API для обработки кейсов;
- OCR, PDF parser и загрузка файлов;
- синхронизация между устройствами;
- экспорт и архив;
- платежи и подписки;
- автоматическая отправка писем.

## User Flow

1. Пользователь открывает приложение.
2. Переходит к созданию нового кейса.
3. Вставляет текст письма, документа или ситуации.
4. Запускает локальный анализ.
5. Видит экран анализа.
6. Открывает результат с explanation, risk level, priority и action plan.
7. При необходимости просматривает немецкий демонстрационный черновик.
8. Переходит в историю.
9. Повторно открывает сохраненный кейс.

## Architecture Overview

Текущий user-facing MVP работает local-first:

```text
Пользователь
↓
Next.js UI
↓
Local Case Engines
↓
localStorage
```

Ключевые архитектурные принципы:

- UI находится в `app/` и построен на Next.js App Router.
- Локальные правила анализа находятся в `lib/analysis-rules.ts`.
- Action Plan Engine находится в `lib/action-plan.ts`.
- Текущий кейс и история читаются и сохраняются через `lib/case-storage.ts`.
- `localStorage` является рабочим хранилищем пользовательского MVP.
- Supabase Foundation и Admin Auth Foundation существуют как technical foundation и не подключены к пользовательскому case flow.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- CSS Modules / глобальные стили проекта
- Browser `localStorage`
- Supabase foundation для будущих этапов
- npm scripts для локальной разработки и production build

## Project Structure

- `AGENTS.md` — главный рабочий регламент для ИИ-агентов.
- `docs/project-map.md` — карта документации, планов и ключевых файлов.
- `docs/roadmap.md` — краткий roadmap: Completed, Current, Future.
- `docs/mvp-status.md` — статус функций: Implemented, Planned, Out Of Scope.
- `docs/demo-script.md` — сценарий демонстрации MVP.
- `docs/specs/` — продуктовые и системные требования.
- `docs/architecture/` — архитектура, data flow, routing, ADR.
- `docs/plans/active/` — только незавершенные планы.
- `docs/plans/completed/` — архив завершенных планов.
- `docs/testing/` — MVP checklist.
- `app/` — пользовательские и foundation routes Next.js.
- `lib/` — локальные движки анализа, action plan и storage helpers.
- `supabase/` — foundation migrations для будущих этапов.

## Demo Scenario

Демо-сценарий:

1. Открыть приложение.
   Ожидаемый результат: виден mobile-first dashboard и вход в создание кейса.
2. Создать кейс из текстового ввода.
   Ожидаемый результат: пустой ввод не проходит, валидный текст создает локальный `StoredCase`.
3. Запустить анализ.
   Ожидаемый результат: анализ выполняется локально, без Supabase, backend или внешнего API.
4. Открыть результат.
   Ожидаемый результат: отображаются explanation, risk level, priority и action plan.
5. Перейти в историю.
   Ожидаемый результат: созданный кейс отображается в локальной истории.
6. Повторно открыть кейс.
   Ожидаемый результат: detail view читает данные из `lifepilot.caseHistory`.

Полный сценарий: `docs/demo-script.md`.

## Current Status

User-facing MVP:

- создание кейса из текстового ввода — реализовано;
- локальный анализ кейса — реализовано;
- история кейсов — реализовано;
- просмотр сохраненного кейса — реализовано;
- local-first хранение — реализовано.

Technical Foundation:

- Supabase Foundation подготовлен для будущего database stage;
- Admin Auth Foundation подготовлен отдельно от пользовательского MVP;
- Vercel/production-проверки остаются в активном плане.

Подробный статус: `docs/mvp-status.md`.

## Future Roadmap

Ближайшее направление:

- завершить active technical foundation-план `docs/plans/active/auth-admin-vercel-plan.md`.

Будущие направления после текущего MVP:

- user-facing Auth;
- Supabase как рабочее хранилище пользовательских кейсов;
- API для серверной обработки и интеграций;
- экспорт и архив кейсов;
- расширение тестирования.

Подробно: `docs/roadmap.md`.

## Local Development

Установить зависимости:

```bash
npm install
```

Запустить dev server:

```bash
npm run dev
```

Собрать production build:

```bash
npm run build
```

Открыть локальный адрес из терминала, обычно `http://localhost:3000`.

## Screenshots placeholders

Плейсхолдеры для будущей продуктовой документации:

- `docs/assets/screenshots/home.png` — главный экран.
- `docs/assets/screenshots/new-case.png` — создание кейса.
- `docs/assets/screenshots/analyzing.png` — экран анализа.
- `docs/assets/screenshots/result.png` — результат анализа.
- `docs/assets/screenshots/history.png` — история кейсов.
- `docs/assets/screenshots/case-detail.png` — сохраненный кейс.

## Architecture Decisions references

Ключевые ADR хранятся в `docs/architecture/decisions.md`:

- ADR-001 Local First Storage — почему MVP использует `localStorage`.
- ADR-002 No Auth In MVP — почему user-facing Auth вынесен за пределы текущего MVP.
- ADR-003 Rule Based Analysis — почему анализ работает локально.
- ADR-004 Future Supabase Integration — почему Supabase отложен на следующий этап пользовательского flow.

Дополнительные архитектурные документы:

- `docs/architecture/system-design.md`
- `docs/architecture/data-flow.md`
- `docs/architecture/routing-map.md`
- `docs/architecture/state-management.md`

## License

Отдельная license-модель пока не выбрана.
