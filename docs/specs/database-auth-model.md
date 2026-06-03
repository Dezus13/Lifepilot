# Database Auth Model

## Назначение

Этот документ описывает database-модель для Auth/Admin Foundation: `auth.users`, `public.admin_users`, связи, поля и ограничения.

Единственный source of truth для архитектурных решений: [../architecture/auth-admin-foundation-decision-review.md](../architecture/auth-admin-foundation-decision-review.md).

Этот spec не создает migration и не означает, что таблица `public.admin_users` уже существует.

## Граница database auth model

Модель нужна только для admin authorization.

В этот этап не входят:

- user profiles для обычных пользователей;
- user-facing accounts;
- user roles для обычных пользователей;
- case ownership;
- связь `public.cases` с пользователями;
- audit logs;
- admin sessions table.

## `auth.users`

`auth.users` — системная таблица Supabase Auth.

LifePilot не создает эту таблицу вручную и не описывает ее полной migration-схемой.

Для Auth/Admin Foundation используются только следующие данные Auth user:

- `id` — uuid пользователя Supabase Auth;
- `email` — email пользователя;
- факт валидной Supabase Auth session.

`auth.users` отвечает за authentication, но не отвечает за app-level admin authorization.

## `public.admin_users`

`public.admin_users` — app-level allowlist таблица LifePilot для admin-доступа.

Назначение:

- связать Supabase Auth user с admin-доступом LifePilot;
- хранить allowlist email;
- хранить единственную текущую app-level роль `admin`;
- разрешать отключение admin-доступа через `status = disabled`.

Минимальные поля:

| Поле | Тип | Обязательность | Назначение |
| --- | --- | --- | --- |
| `id` | `uuid` | Обязательное | Primary key admin-записи |
| `auth_user_id` | `uuid` | Обязательное | Ссылка на `auth.users.id` |
| `email` | `text` | Обязательное | Email администратора |
| `role` | `text` | Обязательное | App-level роль |
| `status` | `text` | Обязательное | Состояние admin-доступа |
| `created_at` | `timestamptz` | Обязательное | Дата создания admin-записи |
| `updated_at` | `timestamptz` | Обязательное | Дата последнего изменения admin-записи |

Минимальные допустимые значения:

- `role`: `admin`;
- `status`: `active`, `disabled`.

## Связь `auth.users` и `public.admin_users`

Каноническая связь:

- `public.admin_users.auth_user_id` обязательно ссылается на `auth.users.id`;
- migration должна добавить foreign key: `auth_user_id REFERENCES auth.users(id) ON DELETE CASCADE`.

Правила:

- один Auth user может иметь не более одной admin-записи;
- один email может иметь не более одной admin-записи;
- admin-запись действительна только если `auth_user_id` и `email` совпадают с текущим Supabase Auth user;
- отсутствие admin-записи означает отсутствие admin-доступа;
- `status = disabled` означает запрет admin-доступа.

## Ограничения таблицы

Минимальные constraints, которые должны быть отражены в migration plan:

- primary key на `id`;
- unique constraint на `auth_user_id`;
- unique constraint на `email`;
- not null для `auth_user_id`;
- not null для `email`;
- not null для `role`;
- not null для `status`;
- check constraint для `role = admin`;
- check constraint для `status in ('active', 'disabled')`;
- foreign key `auth_user_id REFERENCES auth.users(id) ON DELETE CASCADE`.

Foreign key обязателен. Если migration не может добавить foreign key к `auth.users(id)`, Auth/Admin implementation должна быть остановлена до отдельного architecture review.

## RLS

RLS для `public.admin_users` должен быть включен.

Direct table access rules:

- `anon` не получает прямой SELECT к `public.admin_users`;
- `authenticated` не получает прямой SELECT к `public.admin_users`;
- browser client не читает `public.admin_users`;
- admin-доступ не проверяется client-side чтением `public.admin_users`.

Admin validation выполняется только server-side:

1. server-side получает валидную Supabase Auth session;
2. server-side получает `auth.users.id` и email текущего Auth user;
3. server-side читает `public.admin_users`;
4. server-side проверяет `status = active`;
5. server-side проверяет `role = admin`;
6. если проверка не проходит, admin content не показывается.

Service role key запрещен для MVP Auth Foundation. Server-side чтение `public.admin_users` должно быть реализовано без service role key.

## Отношение к `public.cases`

`public.cases` уже существует как schema foundation для будущего database stage.

Auth/Admin Foundation не меняет `public.cases` как пользовательский источник данных.

На этом этапе:

- основной пользовательский UI продолжает работать через `localStorage`;
- `public.cases` не получает user ownership;
- admin page не читает `public.cases` без отдельного RLS/data-access review;
- запись пользовательских кейсов в Supabase не включается.

## Таблицы, которые не нужны на этом этапе

Для Auth/Admin Foundation не нужны:

- `public.user_profiles`;
- `public.user_roles`;
- `public.case_users`;
- `public.admin_sessions`;
- `public.audit_logs`.

Если admin page позже начнет менять данные, `public.audit_logs` нужно рассмотреть отдельно.

## Связанные документы

- [auth-spec.md](./auth-spec.md) описывает auth-flow.
- [admin-spec.md](./admin-spec.md) описывает admin allowlist.
- [security-model.md](./security-model.md) описывает security boundaries.
- [case-model.md](./case-model.md) остается source of truth для Case и `public.cases`.
