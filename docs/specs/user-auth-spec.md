# User-Facing Auth Spec

## Назначение

Этот документ проектирует будущий user-facing authentication flow для LifePilot.

Current MVP остается localStorage-first. Этот spec не означает, что пользовательские аккаунты, регистрация, user-facing login, session-dependent history, Supabase user-case storage или migration уже реализованы. Любая реализация требует отдельного approved active implementation plan, обновления architecture/testing и security/RLS review.

Документ отделяет user-facing auth от реализованного Admin Auth Foundation. Существующий `docs/specs/auth-spec.md` описывает `/admin/login`, `/admin`, `public.admin_users` и admin validation. Этот документ описывает будущую authentication-модель для обычных пользователей LifePilot.

Связанные документы:

- `docs/specs/case-ownership-rls.md`;
- `docs/specs/local-storage-to-supabase-migration.md`;
- `docs/testing/supabase-checklist.md`;
- `docs/architecture/adr-supabase-user-case-storage.md`;
- `docs/plans/active/supabase-user-cases-plan.md`;
- `docs/supabase-foundation.md`;
- `docs/specs/security-model.md`.

## Scope

В scope будущего user-facing auth stage входит:

- регистрация обычного пользователя;
- вход обычного пользователя;
- выход обычного пользователя;
- восстановление доступа;
- session management;
- auth state lifecycle;
- protected routes для account/server-storage features;
- связь authenticated user с пользовательскими кейсами;
- использование `auth.uid()` как основы ownership;
- связь auth lifecycle с RLS policies;
- разграничение user auth и admin auth;
- security requirements для user-facing auth.

## Out Of Scope

Этот spec не разрешает:

- менять код;
- менять UI;
- менять routes;
- менять Supabase schema;
- создавать migrations;
- менять RLS policies;
- подключать Supabase к user-facing flow;
- переносить локальную историю в Supabase;
- добавлять admin-доступ к пользовательским кейсам;
- добавлять billing, subscription, OCR, PDF parser или file upload;
- хранить auth session в `lifepilot.currentCase` или `lifepilot.caseHistory`;
- использовать service role key во frontend;
- заменять текущий localStorage MVP.

## Registration

Будущая регистрация должна создавать Supabase Auth user для обычного пользователя LifePilot.

Требования:

- registration flow должен быть отдельным от Admin Auth Foundation;
- registration не должен автоматически давать admin-доступ;
- регистрация должна создавать user identity, пригодную для ownership через `auth.uid()`;
- пользователь должен понимать, что аккаунт нужен для server-side хранения и будущей синхронизации кейсов;
- регистрация не должна автоматически отправлять существующую localStorage history в Supabase;
- после регистрации local cases остаются локальными, пока пользователь явно не подтвердит migration flow;
- ошибки регистрации должны быть безопасными и не раскрывать Supabase internals.

Нужно определить до реализации:

- email/password, magic link или другой allowed provider;
- правила email confirmation;
- password requirements, если используется password flow;
- redirect после регистрации;
- поведение при существующем email;
- локализацию текстов ошибок.

## Login

Будущий user login должен создавать authenticated session для обычного пользователя.

Требования:

- login flow должен быть отдельным от `/admin/login`;
- успешный login должен давать session, из которой доступен Supabase Auth user id;
- `auth.uid()` должен соответствовать текущему authenticated user;
- login не должен изменять `lifepilot.currentCase`;
- login не должен удалять `lifepilot.caseHistory`;
- login не должен автоматически запускать local history migration;
- после login могут быть доступны будущие protected account/history routes, если они утверждены отдельным scope;
- failed login не должен раскрывать, существует ли конкретный email, если это противоречит выбранной auth policy.

## Logout

Будущий user logout должен завершать пользовательскую session без потери локальной истории.

Требования:

- logout завершает user-facing Supabase Auth session;
- logout не удаляет localStorage history;
- logout не удаляет server rows;
- logout переводит user-facing server read/write path в unauthenticated state;
- после logout protected user routes должны быть недоступны;
- logout не должен влиять на Admin Auth Foundation за пределами общей Supabase session модели, которую нужно отдельно проверить перед реализацией;
- logout не должен менять `public.admin_users`;
- logout не должен менять ownership server cases.

## Access Recovery

Восстановление доступа должно быть спроектировано до включения user-facing accounts.

Требования:

- recovery flow должен быть безопасным и не раскрывать наличие конкретного email сверх выбранной auth policy;
- recovery не должен давать доступ к чужим cases;
- после recovery `auth.uid()` должен оставаться идентификатором того же Supabase Auth user или должен быть описан безопасный account recovery edge case;
- recovery не должен автоматически мигрировать localStorage history;
- recovery не должен обходить RLS;
- recovery emails/links не должны попадать в logs;
- expired recovery link должен приводить к safe error state.

Нужно определить до реализации:

- password reset или magic-link recovery;
- срок действия recovery link;
- redirect после recovery;
- поведение при смене email;
- влияние recovery на active sessions.

## Session Management

User-facing session должна управляться через утвержденный Supabase Auth session mechanism.

Требования:

- session persistence не должна использовать `lifepilot.currentCase` или `lifepilot.caseHistory`;
- password, access token, refresh token и raw JWT не должны сохраняться в LifePilot localStorage keys;
- session validation для server-sensitive операций должна выполняться server-side или через Supabase/RLS boundary;
- expired session должна переводить server read/write path в safe unauthenticated/auth-expired state;
- refresh behavior должен быть описан до реализации;
- auth state не должен смешиваться с Case status из `docs/specs/case-model.md`;
- local-first flow должен оставаться доступным без active user session, пока это разрешено Current MVP/fallback strategy.

## Auth State Lifecycle

Минимальные будущие user auth states:

- `anonymous` — пользователь не вошел; localStorage MVP доступен, server user-case storage недоступен.
- `registering` — registration request выполняется.
- `registration-pending-confirmation` — пользователь создан, но email/session confirmation еще не завершены, если это требуется provider policy.
- `authenticating` — login request выполняется.
- `authenticated` — session валидна, `auth.uid()` доступен.
- `auth-expired` — session истекла или refresh не выполнен.
- `recovering-access` — recovery flow выполняется.
- `auth-error` — registration, login, logout, recovery или session validation завершились ошибкой.

Эти состояния не являются Case status и не должны сохраняться внутри case history.

## Protected Routes

Protected user routes должны появляться только для account/server-storage features после отдельного approved implementation plan.

Потенциальные future protected routes:

- account settings;
- server-backed user history;
- migration confirmation flow;
- account data/export/privacy flows, если они будут утверждены.

Требования:

- Current MVP routes не становятся protected без отдельного product decision;
- protected user routes проверяют user session до показа sensitive account/server data;
- protected user routes не используют admin allowlist;
- `/admin` остается отдельным admin-protected route;
- user protected route не должен показывать данные, если ownership/RLS не подтвержден;
- unauthenticated user получает safe redirect или safe unavailable state без потери local cases.

## Ownership Relation With Cases

User-facing auth является prerequisite для user-owned server cases.

Требования:

- каждый server-side user case должен принадлежать authenticated Supabase Auth user;
- ownership должен быть основан на `auth.users.id`;
- future `public.cases.user_id` или утвержденный equivalent ownership field должен соответствовать текущему authenticated user;
- local `StoredCase` текущего MVP не получает server user id до отдельного implementation stage;
- local history migration назначает ownership только после authenticated session и явного подтверждения пользователя;
- admin identity из `public.admin_users` не является case ownership;
- email не должен быть primary ownership boundary.

## Relation To `auth.uid()`

`auth.uid()` является каноническим RLS-level идентификатором текущего authenticated user.

Требования:

- user-facing write path создает rows только для `user_id = auth.uid()`;
- user-facing read path читает rows только для `user_id = auth.uid()`;
- update path, если он будет включен в scope, проверяет `user_id = auth.uid()`;
- пользователь не может создать или изменить row для чужого `user_id`;
- `anon` не получает доступ к user cases;
- frontend не должен подставлять trusted ownership из localStorage, email или UI state.

## Relation To RLS

User-facing auth и RLS должны проектироваться вместе.

Требования:

- RLS для `public.cases` должен быть включен до production user-case storage;
- SELECT policy должна разрешать authenticated user читать только свои cases;
- INSERT policy должна разрешать authenticated user создавать только свои cases;
- UPDATE policy должна разрешать update только своих cases, если update входит в scope;
- DELETE запрещен до отдельного delete/archive/restore plan;
- RLS rejection должен обрабатываться как safe failure, а не как доказательство пустой истории;
- RLS policy details не показываются пользователю;
- negative tests должны покрывать чужой read/update/delete, anon access и admin foundation без ownership.

## Admin Auth And User Auth Boundaries

Admin Auth Foundation и user-facing auth имеют разные назначения.

Admin Auth Foundation:

- реализован для `/admin/login` и `/admin`;
- использует `public.admin_users` как allowlist;
- не дает автоматического доступа к user cases;
- не является user ownership model;
- не должен читать `public.cases` без отдельного RLS/data-access review.

User-facing auth:

- предназначен для обычных пользователей LifePilot;
- нужен для server-side user case ownership;
- должен использовать `auth.uid()` для ownership/RLS;
- не должен давать admin-доступ;
- не должен создавать или менять `public.admin_users`;
- не должен превращать localStorage MVP в mandatory-login app без отдельного product decision.

## Security Requirements

- Service role key запрещен во frontend.
- Real secrets не должны попадать в markdown, logs, browser bundle или `localStorage`.
- Auth session не хранится в `lifepilot.currentCase` или `lifepilot.caseHistory`.
- Password, access token, refresh token и raw JWT не сохраняются в LifePilot localStorage keys.
- Ownership проверяется через RLS, а не только через UI filters.
- User-facing Auth errors не раскрывают stack traces, JWT payload, RLS policy details или Supabase internals.
- Recovery flow не раскрывает чужие данные.
- Account/user identifiers не должны использоваться для client-only authorization.
- LocalStorage fallback не должен отправлять sensitive local history в Supabase без explicit migration confirmation.
- Admin access остается изолированным и требует отдельной server-side validation.

## Acceptance Criteria

User-facing auth spec считается готовым, если:

- registration, login, logout и access recovery описаны отдельно;
- session management и auth state lifecycle описаны отдельно;
- protected routes описаны как future/account/server-storage routes, а не как Current MVP behavior;
- связь user auth с case ownership описана через authenticated user id;
- `auth.uid()` описан как RLS-level ownership boundary;
- RLS requirements согласованы с `case-ownership-rls.md`;
- migration rules согласованы с `local-storage-to-supabase-migration.md`;
- admin auth и user auth явно разделены;
- security requirements запрещают service role key во frontend и client-only ownership;
- Current MVP остается localStorage-first;
- документ не требует немедленных code, UI, route, schema, migration или RLS changes.

Будущая implementation-задача не готова к старту, пока:

- не утвержден active implementation plan;
- не выбран auth provider/flow;
- не обновлены architecture и testing docs;
- не утверждены SQL-level RLS policies;
- не утвержден migration/rollback strategy;
- не определены production monitoring, logging и recovery expectations.

## Risks

Основные риски user-facing auth stage:

- user auth может случайно смешаться с Admin Auth Foundation;
- Current MVP может стать mandatory-login без отдельного product decision;
- local history может быть автоматически отправлена на сервер после login;
- auth session или tokens могут попасть в LifePilot localStorage keys;
- ownership может быть ошибочно основан на email или client-side user id;
- RLS может быть включен позже write path и открыть доступ к чужим cases;
- logout может быть ошибочно реализован как удаление local history;
- recovery flow может раскрыть существование email или открыть неверный account;
- admin session может быть ошибочно воспринята как право читать user cases;
- session expiry может привести к потере локального кейса, если fallback не сохранен.
