# План Session 18 Auth и Vercel

## Назначение

Этот документ описывает будущий этап после текущего local-first MVP. Он не меняет границы текущего MVP и не означает, что Supabase Auth, admin-поток или развертывание уже реализованы.

Session 18 должна быть отдельным этапом, потому что она вводит auth, защищенные маршруты, production-развертывание и новые требования безопасности.

## Цели Session 18

- Подготовить Supabase Auth для администраторского входа.
- Добавить admin login.
- Добавить protected admin page.
- Подготовить Vercel-развертывание.
- Проверить переменные окружения для production.
- Зафиксировать, какие файлы и секреты нельзя отправлять в GitHub.

## Supabase Auth

Планируемые задачи:

- выбрать способ входа для admin: email/password или magic link;
- описать модель admin-идентичности;
- решить, нужен ли отдельный список разрешенных admin email;
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

Для будущего Auth stage могут понадобиться дополнительные переменные после выбора подхода. Их нужно добавить в `.env.example` без реальных значений и настроить в Vercel dashboard.

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

1. Обновить specs для Auth/Admin.
2. Обновить architecture для protected routes и server-side checks.
3. Обновить testing checklist для admin login, protected admin page и deploy.
4. Подготовить Supabase Auth configuration.
5. Реализовать `/admin/login`.
6. Реализовать protected `/admin`.
7. Настроить переменные окружения Vercel.
8. Запустить `npm run build`.
9. Проверить preview-развертывание.
10. Проверить production-развертывание.

## Не входит в Session 18 без отдельного решения

- платежи;
- Stripe;
- user-facing accounts;
- синхронизация пользовательской истории;
- запись пользовательских кейсов в Supabase из основного UI;
- миграция `localStorage` истории в database;
- чтение чужих пользовательских данных через admin page без RLS review;
- production analytics.

## Критерии готовности

Session 18 считается готовой только когда:

- admin может войти через утвержденный Auth-поток;
- `/admin` недоступен без сессии;
- секреты не попадают в GitHub;
- переменные окружения Vercel настроены;
- `npm run build` проходит;
- preview-развертывание работает;
- документация соответствует фактической реализации.
