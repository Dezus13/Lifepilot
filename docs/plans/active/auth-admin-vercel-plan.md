# План Auth/Admin и Vercel

## Назначение

Этот документ описывает текущий этап Auth/Admin и Vercel после local-first MVP. Он не меняет границы пользовательского MVP.

Auth Foundation уже реализован в коде: `/admin/login`, `/admin`, `lib/admin-auth.ts`, `lib/supabase-server.ts`, migration `20260604000000_admin_users_auth_foundation.sql` и таблица `public.admin_users`.

Vercel-развертывание и production-проверки остаются активной незавершенной частью этого плана.

Архитектурные решения для Auth/Admin Foundation закрыты в [../../architecture/auth-admin-foundation-decision-review.md](../../architecture/auth-admin-foundation-decision-review.md). Детальные specs описаны в [../../specs/auth-spec.md](../../specs/auth-spec.md), [../../specs/admin-spec.md](../../specs/admin-spec.md), [../../specs/database-auth-model.md](../../specs/database-auth-model.md) и [../../specs/security-model.md](../../specs/security-model.md).

## Цели этапа Auth/Admin и Vercel

- Поддерживать реализованный Supabase Auth для администраторского входа.
- Поддерживать реализованный admin login.
- Поддерживать реализованный protected admin page.
- Подготовить Vercel-развертывание.
- Проверить переменные окружения для production.
- Зафиксировать, какие файлы и секреты нельзя отправлять в GitHub.

## Supabase Auth Foundation

Реализовано:

- использовать Supabase Auth email/password для admin login;
- использовать admin identity: Supabase Auth user + запись `public.admin_users`;
- использовать обязательный allowlist email через `public.admin_users`;
- добавить безопасную для сервера настройку Supabase Auth для Next.js;
- добавить проверку сессии на защищенных admin routes;
- не хранить auth session в `localStorage` LifePilot MVP;
- не использовать service role key на frontend;
- обновить specs перед изменением кода.

## Admin Login

Реализованный route:

- `/admin/login` — экран входа администратора.

Требования:

- экран не должен показывать внутренние ошибки Supabase пользователю;
- успешный вход должен вести на protected admin page;
- неуспешный вход должен показывать безопасное сообщение;
- форма входа не должна сохранять пароль или токены в локальную историю кейсов;
- admin login не должен менять основной пользовательский MVP-flow.

## Protected Admin Page

Реализованный route:

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

Активные незавершенные задачи:

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
2. Проверить, что реализованные `/admin/login`, `/admin`, `lib/admin-auth.ts`, `lib/supabase-server.ts` и migration `public.admin_users` соответствуют docs.
3. Настроить Supabase Auth configuration в целевой среде.
4. Настроить переменные окружения Vercel.
5. Запустить `npm run build`.
6. Проверить preview-развертывание.
7. Проверить production-развертывание.

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
