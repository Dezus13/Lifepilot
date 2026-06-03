# Auth Spec

## Назначение

Этот документ описывает Auth Foundation для будущего Admin/Auth этапа LifePilot.

Единственный source of truth для архитектурных решений: [../architecture/auth-admin-foundation-decision-review.md](../architecture/auth-admin-foundation-decision-review.md).

Этот spec не означает, что auth уже реализован. До реализации код, architecture и testing должны быть обновлены на основе этого документа и ADR.

## Граница Auth Foundation

Auth Foundation нужен только для администраторского входа.

В этот этап не входят:

- user-facing accounts;
- регистрация обычных пользователей;
- magic link;
- OAuth providers;
- миграция пользовательской истории из `localStorage`;
- запись кейсов в Supabase из основного пользовательского UI;
- чтение `public.cases` через admin page без отдельного RLS/data-access review.

Основной пользовательский MVP остается публичным и local-first.

## Login

Admin Login использует Supabase Auth email/password.

Планируемый route:

- `/admin/login`.

Правила login:

- `/admin/login` является публичным route;
- форма принимает email и password;
- самостоятельная регистрация через UI не реализуется;
- magic link не используется;
- успешный login создает Supabase Auth session;
- после успешного login пользователь переходит на `/admin`;
- неуспешный login показывает безопасное сообщение без внутренних Supabase деталей;
- login не должен изменять `lifepilot.currentCase` или `lifepilot.caseHistory`;
- login не должен сохранять password, token или session в `localStorage` LifePilot MVP.

Проверка admin-доступа не должна полагаться только на введенный email. После login должна быть server-side проверка session и admin allowlist.

## Logout

Logout является auth-sensitive действием и выполняется через server-side слой.

Правила logout:

- logout завершает текущую Supabase Auth session;
- после logout пользователь не должен видеть `/admin`;
- после logout пользователь должен попасть на `/admin/login` или другой безопасный public route;
- logout не должен очищать пользовательскую localStorage-историю кейсов;
- logout не должен удалять записи `public.admin_users`;
- logout не должен менять `public.cases`.

## Session validation

Session validation выполняется server-side.

Минимальная проверка:

1. Проверить наличие валидной Supabase Auth session.
2. Получить `auth.users.id` и email текущего пользователя.
3. Server-side через `@supabase/ssr` прочитать собственную active admin row из `public.admin_users`.
4. Проверить наличие admin-записи с `auth_user_id` текущего Auth user.
5. Проверить, что email в admin-записи совпадает с email текущего Auth user.
6. Проверить, что `status` равен `active`.
7. Проверить, что `role` равен `admin`.

Если любая проверка не проходит, admin content не показывается.

`public.admin_users` не читается browser client. RLS запрещает SELECT для `anon` и разрешает `authenticated` читать только собственную active admin row. Service role key запрещен для MVP Auth Foundation.

Session persistence использует Supabase Auth cookies через `@supabase/ssr`, а не `localStorage`.

## Protected routes

Публичные routes:

- `/admin/login`;
- основной пользовательский MVP routes без auth.

Protected routes:

- `/admin`.

Правила protected route:

- `/admin` проверяет session и admin allowlist до показа admin content;
- пользователь без session получает redirect на `/admin/login`;
- пользователь с session, но без active admin record, не получает admin content;
- пользователь со статусом `disabled` не получает admin content;
- protected route не должен быть только client-side UI check;
- основной пользовательский MVP не должен становиться auth-protected.

## Auth states

Минимальные auth states:

- `unauthenticated` — Supabase Auth session отсутствует или недействительна;
- `authenticating` — login-запрос выполняется;
- `authenticated-pending-admin-check` — session есть, admin allowlist еще не проверен;
- `admin-authorized` — session валидна, active admin record найден;
- `admin-forbidden` — session есть, но admin record отсутствует, disabled или не совпадает с текущим Auth user;
- `auth-error` — login, logout или session validation завершились ошибкой.

Эти состояния описывают auth-flow. Они не являются Case status и не должны смешиваться со статусами из [case-model.md](./case-model.md).

## Error states

Login error states:

- неверный email или password;
- Supabase Auth недоступен;
- session не создана;
- email/password пустые или невалидные по формату.

Protected route error states:

- session отсутствует;
- session истекла;
- admin record отсутствует;
- admin record disabled;
- email не совпадает с email текущего Auth user;
- role не равен `admin`;
- server-side проверка не может прочитать `public.admin_users`.

Logout error states:

- logout request не выполнен;
- session уже отсутствует;
- redirect после logout не выполнен.

Пользовательский текст ошибок должен быть безопасным:

- не показывать внутренние Supabase stack traces;
- не показывать service role details;
- не раскрывать наличие или отсутствие конкретного email в allowlist;
- не показывать RLS policy details обычному пользователю.

## Что нельзя делать в Auth Foundation

- Нельзя хранить auth session в `localStorage` LifePilot MVP.
- Нельзя использовать service role key во frontend.
- Нельзя использовать service role key для MVP Auth Foundation.
- Нельзя принимать admin-доступ только по email из формы.
- Нельзя делать `/admin` доступным после client-side проверки без server-side validation.
- Нельзя подключать admin page к `public.cases` без отдельного RLS/data-access review.
- Нельзя менять основной local-first пользовательский flow.

## Связанные документы

- [admin-spec.md](./admin-spec.md) описывает admin identity и allowlist.
- [database-auth-model.md](./database-auth-model.md) описывает `auth.users` и `public.admin_users`.
- [security-model.md](./security-model.md) описывает server-side границы и запрещенные client operations.
