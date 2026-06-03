# Security Model

## Назначение

Этот документ описывает security model для Auth/Admin Foundation: server-side only operations, service role boundaries, environment variables и forbidden client operations.

Единственный source of truth для архитектурных решений: [../architecture/auth-admin-foundation-decision-review.md](../architecture/auth-admin-foundation-decision-review.md).

Этот spec не реализует security layer и не меняет текущий local-first MVP.

## Security principles

- Auth-sensitive решения принимаются server-side.
- Client-side UI не принимает окончательное решение об admin-доступе.
- Service role key не попадает во frontend bundle.
- Service role key запрещен для MVP Auth Foundation.
- Основной пользовательский MVP остается local-first.
- `localStorage` не используется для хранения auth session LifePilot MVP.
- Если доступ нельзя подтвердить безопасно, доступ запрещен.
- Любой доступ к пользовательским кейсам через admin page требует отдельного RLS/data-access review.

## Server-side only operations

Только server-side должны выполняться:

- проверка текущей Supabase Auth session;
- проверка admin allowlist в `public.admin_users`;
- чтение `public.admin_users` для admin validation;
- проверка `status = active`;
- проверка `role = admin`;
- redirect с `/admin` на `/admin/login` для unauthenticated пользователя;
- запрет admin content для пользователя без active admin record;
- logout;
- любые операции записи в Supabase;
- создание, отключение или изменение admin-записей, если такой процесс появится;
- любые будущие admin-действия с `public.cases`;
- чтение данных, закрытых RLS policies.

## Service role boundaries

Service role key запрещен:

- во frontend-коде;
- в client components;
- в browser bundle;
- в markdown с реальными значениями;
- в `.env.example` как реальное значение;
- в `localStorage`;
- в console logs;
- в публичных ошибках UI.

Service role key не используется для первой реализации Auth/Admin Foundation.

Если позже понадобится service role key, это будет отдельный post-MVP security review, отдельные specs и отдельный approval. До такого approval service role key считается запрещенным.

## Environment variables

Публичные frontend-переменные:

- `NEXT_PUBLIC_SUPABASE_URL`;
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Эти переменные могут использоваться browser-safe Supabase client.

Server-side переменные для admin validation должны быть добавлены в `.env.example` только как имена без реальных значений, если выбранная реализация требует server-only database access. Service role key не добавляется в `.env.example` для MVP Auth Foundation.

Нельзя коммитить:

- `.env.local`;
- `.env`;
- реальные Supabase keys;
- service role key;
- Vercel tokens;
- GitHub tokens;
- production credentials;
- пользовательские документы;
- логи с персональными данными.

Production значения должны храниться только в Vercel dashboard или другом утвержденном secret storage.

## Forbidden client operations

Client-side UI не должен:

- хранить Supabase Auth session в `localStorage` LifePilot MVP;
- хранить password, token или refresh token в localStorage истории кейсов;
- использовать service role key;
- читать `public.admin_users` напрямую через browser anon client;
- читать `public.admin_users` напрямую через browser authenticated client;
- принимать admin-доступ только по email из формы;
- показывать admin content до server-side validation;
- читать `public.cases` как admin без server-side проверки и утвержденных RLS policies;
- выполнять запись в Supabase без server-side review;
- показывать внутренние Supabase ошибки пользователю;
- раскрывать RLS policy details;
- раскрывать наличие или отсутствие конкретного email в allowlist.

Client-side UI может:

- показывать форму `/admin/login`;
- отправлять email/password в утвержденный login flow;
- показывать безопасное сообщение об ошибке;
- показывать admin UI после server-side проверки доступа.

## Error disclosure rules

Пользовательские ошибки должны быть безопасными.

Разрешено показывать:

- что вход не выполнен;
- что доступ запрещен;
- что нужно войти заново;
- что произошла техническая ошибка без деталей.

Нельзя показывать:

- stack trace;
- service role details;
- JWT payload;
- RLS policy details;
- список allowlist email;
- существование или отсутствие конкретного admin email;
- внутренние Supabase error objects без фильтрации.

## LocalStorage boundary

`localStorage` в текущем MVP используется для:

- `lifepilot.currentCase`;
- `lifepilot.caseHistory`.

Auth/Admin Foundation не должен добавлять туда:

- auth session;
- password;
- access token;
- refresh token;
- admin role;
- admin email;
- allowlist data;
- server-side secrets.

## Admin validation boundary

Admin validation выполняется только server-side в фиксированном порядке:

1. Проверить Supabase Auth session.
2. Получить Auth user id и email.
3. Прочитать `public.admin_users` server-side.
4. Проверить `status = active`.
5. Проверить `role = admin`.
6. Запретить доступ, если любой шаг не прошел.

RLS для `public.admin_users` должен запрещать direct table access для `anon` и `authenticated`. Browser client не должен читать allowlist напрямую.

## Связанные документы

- [auth-spec.md](./auth-spec.md) описывает login, logout и auth states.
- [admin-spec.md](./admin-spec.md) описывает admin identity и access rules.
- [database-auth-model.md](./database-auth-model.md) описывает `auth.users` и `public.admin_users`.
