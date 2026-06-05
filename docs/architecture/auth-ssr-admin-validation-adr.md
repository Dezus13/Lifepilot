# Architecture Decision Record: Auth SSR и Admin Validation

## Назначение

Этот ADR закрывает технический конфликт реализованного Auth Foundation:

- как server-side читает `public.admin_users`;
- используется ли `@supabase/ssr`;
- как хранится session на Vercel;
- какая RLS policy нужна без service role key;
- как выглядит финальный Auth Flow.

Этот документ дополняет [auth-admin-foundation-decision-review.md](./auth-admin-foundation-decision-review.md) и является source of truth для SSR/session/admin-validation решений.

## Проблема

Ранее документация требовала одновременно:

- `anon` не читает `public.admin_users`;
- `authenticated` не читает `public.admin_users`;
- admin validation выполняется server-side;
- service role key запрещен.

Такой набор невозможен для Supabase Auth без дополнительного server-only database bypass: server-side client с user session получает ту же роль `authenticated`, что и browser client. Если `authenticated` полностью denied на уровне RLS, server-side validation тоже не сможет прочитать `public.admin_users`.

## Решение

Для MVP Auth Foundation используется:

- `@supabase/ssr` для Supabase server/browser clients в Next.js App Router;
- Supabase Auth cookies для session persistence;
- server-side validation в `/admin`;
- RLS policy, которая разрешает `authenticated` читать только собственную active admin row;
- запрет service role key для MVP Auth Foundation.

Это означает:

- `anon` не читает `public.admin_users`;
- `authenticated` не получает полный allowlist;
- `authenticated` может прочитать только собственную active admin row через RLS;
- browser code не должен читать `public.admin_users`, даже если RLS технически разрешает own-row select;
- окончательное решение о доступе к `/admin` принимает только server-side код.

## Использование `@supabase/ssr`

Auth/Admin implementation использует `@supabase/ssr`.

Причины:

- совместимость с Next.js App Router;
- поддержка server components и server actions;
- cookie-based session persistence;
- совместимость с Vercel serverless runtime;
- отсутствие необходимости хранить auth session в `localStorage`.

Dependency `@supabase/ssr` добавлена в проект.

## Session persistence на Vercel

Session persistence использует Supabase Auth cookies, которыми управляет `@supabase/ssr`.

Правила:

- login server action создает Supabase session и записывает auth cookies;
- `/admin` читает session из cookies server-side;
- logout server action завершает Supabase session и очищает auth cookies;
- `localStorage` не используется для auth session;
- session не смешивается с `lifepilot.currentCase` и `lifepilot.caseHistory`;
- Vercel хранит session через browser cookies, а не через server memory.

Для server-side проверки нужно использовать `auth.getUser()` на server client, а не доверять только client-side состоянию.

## Как server-side читает `public.admin_users`

Server-side validation использует Supabase server client, созданный через `@supabase/ssr` из request cookies.

Порядок:

1. Server-side code читает Supabase Auth cookies.
2. Server-side code вызывает `auth.getUser()`.
3. Если user отсутствует, `/admin` делает redirect на `/admin/login`.
4. Если user есть, server-side code делает SELECT к `public.admin_users`.
5. RLS разрешает прочитать только строку, где:
   - `auth.uid() = auth_user_id`;
   - `status = 'active'`;
   - `role = 'admin'`.
6. Если строка найдена, доступ к `/admin` разрешен.
7. Если строка не найдена, показывается safe forbidden state или redirect на safe route.

Запрос должен выбирать минимальные поля, достаточные для validation. Например:

- `id`;
- `role`;
- `status`.

Email можно сверять server-side, если он нужен specs, но UI не должен раскрывать allowlist.

## RLS policy для `public.admin_users`

RLS для `public.admin_users` включается migration `20260604000000_admin_users_auth_foundation.sql`.

Обязательная SELECT policy:

```sql
create policy "admin users can read own active admin row"
on public.admin_users
for select
to authenticated
using (
  auth.uid() = auth_user_id
  and status = 'active'
  and role = 'admin'
);
```

Для `anon` SELECT policy не создается.

Для `authenticated` INSERT, UPDATE и DELETE policies не создаются.

Следствие:

- `anon` не читает `public.admin_users`;
- `authenticated` не может читать чужие admin records;
- `authenticated` не может читать disabled admin records;
- `authenticated` не может читать rows с role не равной `admin`;
- `authenticated` не может создавать, изменять или удалять admin records;
- browser client технически может попытаться запросить собственную active admin row, но frontend-код LifePilot не должен этого делать.

## Почему это MVP-first

Этот подход:

- не использует service role key;
- не требует прямого Postgres connection string;
- не требует отдельного backend-сервера;
- совместим с Vercel;
- совместим с App Router;
- не меняет основной local-first MVP;
- не открывает полный admin allowlist;
- не добавляет user-facing accounts.

## Service role key

Service role key запрещен для MVP Auth Foundation.

Нельзя:

- добавлять service role key в `.env.example`;
- использовать service role key во frontend;
- использовать service role key в server actions;
- использовать service role key для admin validation;
- коммитить service role key или его значение в docs.

Если позже понадобится service role key, это будет отдельный post-MVP security review.

## Финальная схема Auth Flow

### Login

1. Пользователь открывает `/admin/login`.
2. Пользователь вводит email/password.
3. Server action создает Supabase server client через `@supabase/ssr`.
4. Server action вызывает Supabase Auth email/password sign in.
5. Supabase устанавливает auth cookies.
6. Server action делает redirect на `/admin`.

### Protected `/admin`

1. `/admin` выполняется server-side.
2. Server-side client читает auth cookies.
3. Server-side client вызывает `auth.getUser()`.
4. Если user отсутствует, redirect на `/admin/login`.
5. Если user есть, server-side client читает `public.admin_users`.
6. RLS возвращает только собственную active admin row.
7. Если row найдена, показывается admin page.
8. Если row не найдена, admin content не показывается.

### Logout

1. Admin нажимает logout.
2. Server action вызывает Supabase sign out.
3. Auth cookies очищаются.
4. Пользователь получает redirect на `/admin/login`.
5. `lifepilot.currentCase` и `lifepilot.caseHistory` не изменяются.

## Итоговые решения

1. `@supabase/ssr` используется обязательно.
2. Session persistence работает через Supabase Auth cookies.
3. Vercel compatibility обеспечивается cookie-based session, а не server memory.
4. Service role key запрещен.
5. `anon` не имеет SELECT policy для `public.admin_users`.
6. `authenticated` имеет SELECT policy только для собственной active admin row.
7. INSERT, UPDATE и DELETE для `anon` и `authenticated` не разрешены.
8. Browser UI не читает `public.admin_users`.
9. `/admin` принимает решение о доступе только server-side.
10. Основной MVP остается public и local-first.
