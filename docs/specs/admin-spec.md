# Admin Spec

## Назначение

Этот документ описывает admin identity, allowlist flow, правила admin-доступа и admin session rules для реализованного Auth/Admin Foundation.

Единственный source of truth для архитектурных решений: [../architecture/auth-admin-foundation-decision-review.md](../architecture/auth-admin-foundation-decision-review.md).

Текущий admin-раздел реализован минимально: `/admin/login` выполняет вход через Supabase Auth, `/admin` защищен server-side проверкой session и `public.admin_users`.

## Граница admin stage

Admin stage нужен только для защищенного администраторского доступа.

В этот этап не входят:

- обычные пользовательские аккаунты;
- signup для обычных пользователей;
- несколько admin-ролей;
- owner/editor/viewer/support roles;
- чтение или изменение пользовательских кейсов без отдельного RLS/data-access review;
- analytics;
- audit log как обязательная таблица.

## Admin identity

Admin identity состоит из двух частей:

1. Supabase Auth user.
2. App-level admin record в `public.admin_users`.

Supabase Auth user отвечает за authentication: email/password login и auth session.

`public.admin_users` отвечает за authorization: имеет ли этот Auth user право открыть admin-раздел LifePilot.

Минимальные признаки активного admin:

- есть валидная Supabase Auth session;
- `auth.users.id` совпадает с `public.admin_users.auth_user_id`;
- email текущего Auth user совпадает с `public.admin_users.email`;
- `public.admin_users.role` равен `admin`;
- `public.admin_users.status` равен `active`.

Проверка этих признаков выполняется только server-side.

## Allowlist flow

Allowlist email обязателен.

Allowlist хранится в `public.admin_users`.

Allowlist не хранится:

- во frontend-коде;
- в `.env.local`;
- в markdown с реальными email;
- в `localStorage`;
- в `public.cases`.

Минимальный flow добавления admin:

1. Admin-пользователь создается вручную через Supabase Auth dashboard или другой утвержденный безопасный процесс.
2. Для этого Auth user создается запись в `public.admin_users`.
3. В записи указываются `auth_user_id`, `email`, `role = admin`, `status = active`.
4. После login server-side проверка ищет active admin record.
5. Если active record найден и совпадает с текущим Auth user, пользователь получает доступ к `/admin`.

Обычный signup не должен автоматически создавать запись в `public.admin_users`.

Direct table access к `public.admin_users` для `anon` должен быть запрещен RLS. `authenticated` получает SELECT только для собственной active admin row. Browser client не читает allowlist напрямую.

## Admin access rules

Доступ к `/admin` разрешен только если:

- Supabase Auth session валидна;
- admin record существует;
- admin record `status` равен `active`;
- admin record `role` равен `admin`;
- `auth_user_id` совпадает с текущим Auth user;
- email admin record совпадает с email текущего Auth user.

Доступ к `/admin` запрещен если:

- session отсутствует;
- session истекла или недействительна;
- admin record отсутствует;
- admin record имеет `status = disabled`;
- role не равен `admin`;
- email не совпадает;
- server-side проверка не может безопасно подтвердить admin-доступ.

Правило по умолчанию: если доступ нельзя подтвердить, доступ запрещен.

Порядок server-side проверки:

1. Supabase Auth session.
2. Auth user id и email.
3. Чтение собственной active admin row из `public.admin_users` через `@supabase/ssr`.
4. Проверка `status = active`.
5. Проверка `role = admin`.

## Admin session rules

Admin session — это Supabase Auth session, прошедшая server-side admin allowlist validation.

Правила:

- session не хранится в `localStorage` LifePilot MVP;
- session не должна смешиваться с `lifepilot.currentCase`;
- session не должна смешиваться с `lifepilot.caseHistory`;
- session validation выполняется перед показом `/admin`;
- logout завершает session и закрывает доступ к `/admin`;
- disabled admin не должен получить доступ даже при наличии технически валидной Auth session;
- admin session не дает права читать или менять `public.cases` без отдельного RLS/data-access review.

## Admin role

На этом этапе существует только одна app-level роль:

- `admin`.

Эта роль нужна, чтобы явно отделить admin authorization от обычной Supabase Auth session.

Роли `owner`, `editor`, `viewer`, `support` не вводятся.

Если позже понадобится несколько ролей, сначала нужно обновить:

- Architecture Decision Review;
- этот spec;
- database auth model;
- security model;
- RLS policies;
- testing checklist.

## Forbidden admin behavior

Admin-раздел не должен:

- создавать обычные пользовательские аккаунты;
- автоматически мигрировать localStorage-историю;
- читать все пользовательские кейсы без отдельного RLS review;
- записывать или удалять `public.cases` без отдельного решения;
- показывать service role key или technical policy details;
- использовать service role key для MVP Auth Foundation;
- менять основной пользовательский MVP-flow.

## Связанные документы

- [auth-spec.md](./auth-spec.md) описывает login, logout и session validation.
- [database-auth-model.md](./database-auth-model.md) описывает `public.admin_users`.
- [security-model.md](./security-model.md) описывает server-side и client-side границы.
