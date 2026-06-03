# План Auth/Admin и Vercel

## Назначение

Этот документ описывает будущий этап после текущего local-first MVP. Он не меняет границы текущего MVP и не означает, что Supabase Auth, admin-поток или развертывание уже реализованы.

Auth/Admin и Vercel должны быть отдельным продуктовым этапом, потому что они вводят auth, защищенные маршруты, production-развертывание и новые требования безопасности.

Архитектурные решения для Auth/Admin Foundation закрыты в [../architecture/auth-admin-foundation-decision-review.md](../architecture/auth-admin-foundation-decision-review.md). Детальные specs описаны в [../specs/auth-spec.md](../specs/auth-spec.md), [../specs/admin-spec.md](../specs/admin-spec.md), [../specs/database-auth-model.md](../specs/database-auth-model.md) и [../specs/security-model.md](../specs/security-model.md).

Реализация Auth/Admin может начаться только после отдельного approval.

## Цели этапа Auth/Admin и Vercel

- Подготовить Supabase Auth для администраторского входа.
- Добавить admin login.
- Добавить protected admin page.
- Подготовить Vercel-развертывание.
- Проверить переменные окружения для production.
- Зафиксировать, какие файлы и секреты нельзя отправлять в GitHub.

## Supabase Auth

Планируемые задачи:

- использовать Supabase Auth email/password для admin login;
- использовать admin identity: Supabase Auth user + запись `public.admin_users`;
- использовать обязательный allowlist email через `public.admin_users`;
- добавить безопасную для сервера настройку Supabase Auth для Next.js;
- добавить проверку сессии на защищенных admin routes;
- не хранить auth session в `localStorage` LifePilot MVP;
- не использовать service role key на frontend;
- обновить specs перед изменением кода.

## Admin Login

Планируемый route:

- `/admin/login` — экран входа администратора.

Требования:

- экран не должен показывать внутренние ошибки Supabase пользователю;
- успешный вход должен вести на protected admin page;
- неуспешный вход должен показывать безопасное сообщение;
- форма входа не должна сохранять пароль или токены в локальную историю кейсов;
- admin login не должен менять основной пользовательский MVP-flow.

## Protected Admin Page

Планируемый route:

- `/admin` — защищенная admin page.

Требования:

- страница должна быть недоступна без валидной auth session;
- проверка доступа должна происходить до показа admin content;
- неавторизованный пользователь должен попадать на `/admin/login`;
- admin page не должна читать пользовательские кейсы без утвержденных RLS/policies;
- protected route не должен полагаться только на client-side UI check.

## Доступ к данным Supabase

Перед чтением или записью данных через admin page нужно отдельно утвердить:

- RLS policies;
- admin role или allowlist;
- связь пользователя с кейсами, если она появится;
- правила чтения `public.cases`;
- правила записи, удаления и аудита действий.

Текущий `public.cases` layer остается schema/client foundation без разрешенного anon SELECT до отдельного решения о database/auth stage.

## Vercel-развертывание

Планируемые задачи:

- проверить `npm run build` локально;
- убедиться, что `package-lock.json` актуален;
- определить production-версию Node.js через `engines` или настройки Vercel;
- создать Vercel project;
- подключить GitHub repository;
- добавить production-переменные окружения в Vercel dashboard;
- проверить preview-развертывание;
- проверить production-развертывание;
- проверить, что UI не раскрывает технические детали Supabase-конфигурации.

## Переменные окружения

Минимальные переменные для текущего Supabase foundation layer:

- `NEXT_PUBLIC_SUPABASE_URL`;
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Auth stage использует `@supabase/ssr` и Supabase Auth cookies. Для MVP Auth Foundation используются публичные Supabase-переменные; service role key не добавляется в `.env.example`.

Правила:

- реальные значения хранятся только локально или в настройках окружения Vercel;
- `.env.local` не коммитится;
- secret keys не используются в client components;
- service role key не попадает во frontend bundle;
- production-секреты не вставляются в документацию.

## Что нельзя отправлять в GitHub

Нельзя коммитить:

- `.env.local`;
- `.env`;
- реальные Supabase keys;
- service role key;
- приватные токены Vercel или GitHub;
- `.vercel/`;
- `.next/`;
- `node_modules/`;
- `supabase/.temp/`;
- файлы с реальными пользовательскими документами или письмами;
- скриншоты или логи, содержащие персональные данные;
- production-credentials в markdown-документации.

## Последовательность работ

1. Использовать Auth/Admin ADR и specs как source of truth.
2. Обновить architecture для protected routes и server-side checks.
3. Обновить testing checklist для admin login, protected admin page и deploy.
4. Подготовить Supabase Auth configuration.
5. Использовать [admin-users-migration-plan.md](./admin-users-migration-plan.md) как migration plan для `public.admin_users`.
6. Реализовать `/admin/login`.
7. Реализовать protected `/admin`.
8. Настроить переменные окружения Vercel.
9. Запустить `npm run build`.
10. Проверить preview-развертывание.
11. Проверить production-развертывание.

## Не входит в этап Auth/Admin и Vercel без отдельного решения

- платежи;
- Stripe;
- user-facing accounts;
- синхронизация пользовательской истории;
- запись пользовательских кейсов в Supabase из основного UI;
- миграция `localStorage` истории в database;
- чтение чужих пользовательских данных через admin page без RLS review;
- production analytics.

## Критерии готовности

Этап Auth/Admin и Vercel считается готовым только когда:

- admin может войти через утвержденный Auth-поток;
- `/admin` недоступен без сессии;
- секреты не попадают в GitHub;
- переменные окружения Vercel настроены;
- `npm run build` проходит;
- preview-развертывание работает;
- документация соответствует фактической реализации.
