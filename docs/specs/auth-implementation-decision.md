# Auth Implementation Decision

## Назначение

Этот документ фиксирует MVP auth flow для будущего user-facing Supabase stage.

Документ не реализует Auth, не меняет code, UI, routes, schema или migrations. Current MVP остается localStorage-first до отдельной утвержденной implementation-задачи.

## Decision

Для первого user-facing Auth этапа LifePilot выбирает Supabase Auth email + password.

Этот flow используется только для ordinary user-facing accounts и server-side user-case ownership. Он не заменяет и не расширяет Admin Auth Foundation.

## Why Email + Password For MVP

Email + password выбран, потому что:

- flow понятен большинству пользователей;
- recovery через password reset является ожидаемым поведением;
- session lifecycle предсказуем для protected account/server-storage routes;
- implementation проще тестировать вручную для registration, login, logout, recovery и session expiry;
- `auth.uid()` стабильно связывает Supabase Auth user с `public.cases.user_id`;
- не требуется зависеть от email-link delivery как единственного способа входа;
- user-facing Auth можно отделить от `/admin/login` без изменения Admin Auth Foundation.

## Why Not Magic Link First

Magic link не выбран для первого этапа, потому что:

- delivery email становится обязательным критическим путем входа;
- recovery и login становятся менее различимыми для первого implementation stage;
- redirect edge cases сложнее тестировать до production rollout;
- deep-link/session handoff может усложнить localStorage fallback и migration confirmation flow;
- troubleshooting auth failures сложнее без стабильного password-based login baseline.

Magic link может быть рассмотрен позже отдельным Auth UX/security review.

## Scope

В scope будущей реализации после approval:

- registration через email + password;
- login через email + password;
- logout;
- password recovery;
- session persistence через Supabase Auth mechanism;
- protected account/server-storage routes;
- relation authenticated user to `public.cases.user_id`;
- RLS ownership через `auth.uid()`.

## Out Of Scope

Не входит:

- magic link;
- OAuth/social login;
- passkeys;
- multi-factor auth;
- admin login changes;
- mandatory login для Current MVP routes;
- automatic localStorage migration after login;
- service role key во frontend.

## Registration Flow

Требования:

- registration создает ordinary Supabase Auth user;
- registration не создает admin row;
- registration не дает доступ к `/admin`;
- registration не запускает local history migration;
- local cases остаются local-only до explicit migration confirmation;
- errors не раскрывают Supabase internals.

Redirect behavior:

- после successful registration user попадает в authenticated account/server-storage entry point или safe post-auth state;
- если email confirmation включена в Supabase project settings, user должен попасть в pending-confirmation state;
- Current MVP localStorage routes не становятся protected только из-за registration.

## Login Flow

Требования:

- login принимает email + password;
- login создает authenticated Supabase session;
- `auth.uid()` доступен для RLS ownership после успешного login;
- login не меняет `lifepilot.currentCase`;
- login не удаляет `lifepilot.caseHistory`;
- login не запускает migration автоматически;
- failed login показывает safe error without stack traces or Supabase internals.

Redirect behavior:

- после successful login user возвращается к intended protected account/server-storage route, если он был;
- если intended route отсутствует, user попадает в safe account/server-storage entry point;
- user может продолжить localStorage MVP flow без migration.

## Logout Flow

Требования:

- logout завершает user-facing Supabase Auth session;
- logout переводит server read/write path в unauthenticated state;
- logout не удаляет local history;
- logout не удаляет server rows;
- logout не меняет `public.admin_users`;
- logout не должен использовать service role key.

Redirect behavior:

- после logout protected user routes недоступны;
- user получает safe unauthenticated state или redirect к public local-first MVP route.

## Password Recovery

Требования:

- recovery uses password reset flow for email + password accounts;
- recovery не дает доступ к чужим cases;
- recovery не запускает local history migration;
- recovery не обходит RLS;
- recovery links/tokens не логируются;
- expired recovery state должен быть safe and recoverable.

Redirect behavior:

- после successful recovery user возвращается к login или safe authenticated state according to approved implementation;
- recovery failure не раскрывает account existence beyond chosen Supabase Auth behavior.

## Session Lifecycle

Минимальные states:

- `anonymous`;
- `registering`;
- `registration-pending-confirmation`;
- `authenticating`;
- `authenticated`;
- `auth-expired`;
- `recovering-access`;
- `auth-error`.

Rules:

- session state is not Case status;
- session state не хранится в `lifepilot.currentCase`;
- session state не хранится в `lifepilot.caseHistory`;
- access token, refresh token, raw JWT and password не сохраняются в LifePilot localStorage keys;
- expired session disables server read/write path and keeps localStorage fallback available.

## Relation To `auth.uid()`

`auth.uid()` является database-level owner identity.

Rules:

- `public.cases.user_id` must equal `auth.uid()` for user-owned rows;
- RLS policies use `auth.uid()` for SELECT, INSERT and UPDATE checks;
- email is not an ownership boundary;
- client-provided user id is not trusted unless RLS validates it;
- admin identity is not user-case ownership.

## Admin Boundary

Admin Auth Foundation remains separate:

- `/admin/login` is not user-facing login;
- `public.admin_users` is not used for user-case ownership;
- ordinary registration does not create `public.admin_users` row;
- admin session does not grant access to user cases;
- admin access to user cases requires separate RLS/data-access review.

## Acceptance Criteria

Auth decision is implementation-ready when:

- email + password is accepted as MVP user-facing Auth flow;
- magic link is explicitly out of first stage;
- registration, login, logout and recovery behavior are documented;
- redirects are documented at behavior level;
- session lifecycle states are documented;
- relation to `auth.uid()` and RLS is documented;
- admin/user auth boundaries are documented;
- Current MVP remains localStorage-first.

## Related Documents

- [user-auth-spec.md](./user-auth-spec.md);
- [case-ownership-rls.md](./case-ownership-rls.md);
- [sql-rls-policy-spec.md](./sql-rls-policy-spec.md);
- [local-storage-to-supabase-migration.md](./local-storage-to-supabase-migration.md);
- [../plans/active/supabase-implementation-plan.md](../plans/active/supabase-implementation-plan.md).
