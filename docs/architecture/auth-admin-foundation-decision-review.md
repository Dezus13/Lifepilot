# Architecture Decision Review: Auth/Admin Foundation

## Назначение

Этот документ является source of truth для будущих specs по Auth/Admin Foundation. Он закрывает архитектурные решения перед реализацией Supabase Auth, admin login, protected admin page и server-side access checks.

Документ не означает, что Auth/Admin уже реализован. До изменения кода specs, architecture и testing должны ссылаться на решения из этого файла.

## Граница решения

Auth/Admin Foundation нужен только для администраторского доступа к будущему admin-разделу.

В текущую границу не входят:

- user-facing accounts;
- регистрация обычных пользователей;
- миграция `localStorage` истории в Supabase;
- синхронизация пользовательских кейсов;
- платежи;
- analytics;
- чтение или изменение пользовательских кейсов без отдельного RLS review.

Основной пользовательский MVP остается local-first и продолжает работать через `localStorage`.

## Решение 1: способ входа

Для Admin Login используется Supabase Auth email/password.

Причины:

- вход предсказуем для учебного admin-flow;
- не зависит от настройки magic link email delivery перед первым deploy;
- проще тестировать локально и на Vercel preview;
- позволяет явно проверить неуспешный вход, logout и protected route.

Magic link не используется на этом этапе. Его можно рассмотреть позже только после отдельного решения по email delivery, redirect URL и production domain.

Самостоятельная регистрация через UI не входит в этот этап. Admin-пользователь создается вручную через Supabase dashboard или другой утвержденный безопасный процесс.

## Решение 2: admin identity model

Admin identity строится на двух уровнях:

1. Supabase Auth user.
2. App-level admin record в таблице `public.admin_users`.

Supabase Auth user отвечает за сессию и базовую аутентификацию.

`public.admin_users` отвечает за разрешение доступа к admin-разделу LifePilot.

Минимальная модель admin record:

- `id` — uuid primary key;
- `auth_user_id` — uuid пользователя из Supabase Auth;
- `email` — email администратора;
- `role` — app-level роль;
- `status` — состояние доступа;
- `created_at`;
- `updated_at`.

Email в `public.admin_users` должен совпадать с email Supabase Auth user. Проверка доступа не должна полагаться только на email из формы логина.

## Решение 3: allowlist email

Allowlist email нужен.

Allowlist хранится в `public.admin_users`, а не в frontend-коде и не в `.env.local`.

Правила:

- пользователь может открыть `/admin` только если у него есть валидная Supabase Auth session;
- `auth_user_id` текущей сессии должен существовать в `public.admin_users`;
- `status` должен быть `active`;
- email должен совпадать с email текущего Supabase Auth user;
- запись admin должна быть создана заранее вручную или через утвержденный server-side процесс;
- обычный signup не должен автоматически создавать admin-доступ.

Такой подход оставляет Auth session задачей Supabase Auth, а право доступа задачей LifePilot.

## Решение 4: роли пользователей

В Auth/Admin Foundation существуют только две практические категории доступа:

- public visitor — любой пользователь основного MVP без auth;
- admin — пользователь с валидной Supabase Auth session и активной записью в `public.admin_users`.

User-facing roles для обычных пользователей не вводятся.

На этом этапе допустимое значение app-level role:

- `admin`.

Роли `owner`, `editor`, `viewer`, `support` или похожие роли не вводятся без отдельного решения. Если позже понадобится несколько admin-ролей, сначала нужно обновить этот ADR, specs, RLS и testing.

## Решение 5: server-side API и server-side checks

Все auth-sensitive действия выполняются через server-side слой.

Только server-side:

- проверка текущей Supabase Auth session для `/admin`;
- проверка admin allowlist в `public.admin_users`;
- redirect неавторизованного пользователя с `/admin` на `/admin/login`;
- logout;
- любые будущие admin-действия с `public.cases`;
- любые будущие операции, которым может понадобиться service role key, только после отдельного post-MVP security review;
- любые операции записи в Supabase;
- чтение данных, доступ к которым разрешен только утвержденным server-side flow;
- создание, отключение или изменение admin-записей, если такой процесс будет добавлен.

Client-side UI может:

- показывать форму `/admin/login`;
- отправлять email/password в утвержденный server-side login flow;
- показывать безопасные сообщения об ошибке;
- показывать admin UI только после server-side проверки доступа.

Client-side UI не должен:

- хранить auth session в `localStorage` LifePilot MVP;
- использовать service role key;
- принимать решение об admin-доступе только по email;
- читать `public.admin_users` напрямую через browser anon client;
- читать `public.cases` как admin без server-side проверки и утвержденных RLS policies.

## Решение 6: таблицы Supabase

Текущая таблица:

- `public.cases` — уже существует как schema foundation. В текущем MVP RLS включен, SELECT policy для anon отсутствует, пользовательский UI не использует эту таблицу как источник данных.

Для Auth/Admin Foundation нужна новая таблица:

- `public.admin_users` — allowlist и app-level роль администратора.

Минимальные поля `public.admin_users`:

- `id uuid primary key`;
- `auth_user_id uuid not null unique`;
- `email text not null unique`;
- `role text not null`;
- `status text not null`;
- `created_at timestamptz not null`;
- `updated_at timestamptz not null`.

Минимальные допустимые значения:

- `role`: `admin`;
- `status`: `active`, `disabled`.

RLS для `public.admin_users` должен быть включен.

Browser anon client не должен иметь прямой SELECT к `public.admin_users`.

Server-side проверка admin-доступа должна читать `public.admin_users` через `@supabase/ssr` и RLS policy для собственной active admin row. Детали закрыты в [auth-ssr-admin-validation-adr.md](./auth-ssr-admin-validation-adr.md).

Для этого этапа не нужны:

- `public.user_profiles`;
- `public.user_roles`;
- `public.case_users`;
- `public.admin_sessions`;
- `public.audit_logs`.

Audit log может понадобиться позже, если admin page начнет изменять данные. Для текущей foundation-задачи он не является обязательной таблицей.

## Решение 7: protected admin routes

Планируемые routes:

- `/admin/login` — публичный route для входа администратора;
- `/admin` — protected route, доступный только активному admin.

Правила:

- `/admin/login` не должен менять основной пользовательский MVP-flow;
- `/admin/login` не должен показывать внутренние Supabase ошибки;
- успешный login ведет на `/admin`;
- `/admin` проверяет session и allowlist до показа admin content;
- пользователь без session получает redirect на `/admin/login`;
- пользователь с session, но без active admin record, не получает admin content;
- protected route не должен быть только client-side check.

## Решение 8: переменные окружения и секреты

Frontend может использовать только публичные Supabase переменные:

- `NEXT_PUBLIC_SUPABASE_URL`;
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Server-side Auth/Admin использует `@supabase/ssr` и Supabase Auth cookies. Service role key запрещен для MVP Auth Foundation.

Нельзя отправлять в GitHub:

- `.env.local`;
- реальные Supabase keys;
- service role key;
- Vercel tokens;
- GitHub tokens;
- production credentials;
- пользовательские документы или письма;
- логи с персональными данными.

Service role key запрещен во frontend bundle. Если он понадобится для server-side admin checks, он должен использоваться только на сервере и только после отдельного specs review.

## Итоговые архитектурные решения

1. Admin Login использует Supabase Auth email/password.
2. Magic link не используется на этом этапе.
3. Самостоятельная регистрация admin через UI не реализуется.
4. Admin identity состоит из Supabase Auth user и записи в `public.admin_users`.
5. Allowlist email обязателен и хранится в `public.admin_users`.
6. Единственная app-level роль текущего этапа — `admin`.
7. Обычные пользователи остаются public visitors без аккаунтов.
8. `/admin/login` является публичным route.
9. `/admin` является protected route.
10. Проверка session и admin allowlist выполняется server-side.
11. Client-side UI не принимает окончательное решение об admin-доступе.
12. `localStorage` не используется для хранения auth session LifePilot MVP.
13. `public.cases` не становится пользовательским источником данных в этом этапе.
14. Новая обязательная таблица этапа — `public.admin_users`.
15. RLS для `public.admin_users` должен быть включен.
16. Browser anon client не получает прямой доступ к `public.admin_users`.
17. Любое чтение или изменение пользовательских кейсов через admin page требует отдельного RLS/data-access review.
18. Specs, architecture и testing для Auth/Admin должны быть обновлены на основе этого ADR до написания кода.

## Что должно быть обновлено после этого ADR

Перед реализацией нужно обновить:

- specs для Admin Login;
- specs для Protected Admin Page;
- architecture для server-side auth checks;
- routing-map для `/admin/login` и `/admin`;
- state-management для auth session boundary;
- testing checklist для login, logout, protected route и forbidden state;
- Supabase migration plan для `public.admin_users`.

До этих обновлений код Auth/Admin писать нельзя.
