# Case Ownership и RLS для user-facing Supabase storage

## Назначение

Определить ownership и RLS-модель для будущего user-facing Supabase storage.

Этот документ описывает будущий этап после Current MVP. Текущий MVP остается localStorage-first: пользовательские кейсы создаются, анализируются и открываются из `localStorage`. Этот spec не меняет код, UI, routes, Supabase schema, migrations, RLS policies или Auth/Admin реализацию.

Документ связан с:

- `docs/plans/active/supabase-user-cases-plan.md`;
- `docs/architecture/adr-supabase-user-case-storage.md`;
- `docs/specs/case-model.md`;
- `docs/specs/data-storage.md`;
- `docs/specs/security-model.md`.

## Scope

В ownership/RLS stage входит:

- определить, как пользовательский кейс связывается с Supabase Auth user;
- определить будущий ownership field для `public.cases`;
- описать RLS requirements для чтения, создания, обновления и удаления пользовательских кейсов;
- зафиксировать запрет доступа к чужим данным;
- зафиксировать границы service role key;
- зафиксировать границы admin access к пользовательским кейсам;
- определить negative test cases для RLS;
- определить acceptance criteria для готовности ownership/RLS-проектирования.

Этот документ является проектным spec для будущего database/auth stage. Реальная schema и SQL policies должны быть зафиксированы в отдельном migration plan до создания migrations.

## Out Of Scope

На этом этапе запрещено:

- менять код приложения;
- менять UI;
- менять routes;
- менять localStorage behavior;
- менять Auth/Admin Foundation;
- менять Supabase schema;
- создавать migrations;
- создавать новые таблицы;
- применять или менять RLS policies;
- подключать Supabase к user-facing flow;
- переносить локальную историю в Supabase;
- добавлять admin-доступ к пользовательским кейсам;
- добавлять delete/archive/restore flow;
- добавлять billing, тарифы или usage limits;
- добавлять OCR, PDF parser, file upload или external AI/API processing.

## Ownership Model

Будущая модель ownership строится вокруг `user_id`.

Минимальное направление:

- `public.cases` получает ownership field `user_id`;
- `user_id` должен ссылаться на Supabase Auth user, то есть на `auth.users.id`;
- `auth.uid()` используется как канонический идентификатор текущего authenticated user в RLS;
- каждый server-side пользовательский кейс принадлежит ровно одному пользователю;
- пользователь может читать только кейсы, где `public.cases.user_id = auth.uid()`;
- пользователь может создавать кейс только для себя;
- пользователь может обновлять только свои кейсы, если update входит в утвержденный scope;
- кейсы без `user_id` не должны становиться видимыми обычным пользователям по умолчанию;
- локальный `StoredCase` текущего MVP не получает server user id, пока не начат отдельный implementation stage.

Требования к ownership:

- ownership не должен определяться email из формы;
- ownership не должен определяться client-only значением из `localStorage`;
- ownership не должен полагаться только на UI-фильтр;
- ownership должен проверяться database-level RLS;
- admin identity из `public.admin_users` не является ownership пользовательских кейсов;
- будущая миграция локальных кейсов должна назначать `user_id` только после подтвержденной authenticated session.

## RLS Requirements

RLS для `public.cases` должен быть включен до того, как таблица станет рабочим user-facing хранилищем.

### SELECT policy

Будущая SELECT policy должна разрешать authenticated user читать только свои кейсы:

- role: `authenticated`;
- condition: `user_id = auth.uid()`;
- `anon` не получает SELECT;
- кейсы других пользователей не возвращаются;
- кейсы без подтвержденного ownership не возвращаются обычным пользователям.

### INSERT policy

Будущая INSERT policy должна разрешать authenticated user создавать только свои кейсы:

- role: `authenticated`;
- check: `user_id = auth.uid()`;
- client не может создать row для другого `user_id`;
- `anon` не получает INSERT;
- server/client write path должен передавать только разрешенный ownership.

### UPDATE policy

Будущая UPDATE policy допустима только если update входит в утвержденный implementation scope.

Минимальные требования:

- role: `authenticated`;
- using condition: `user_id = auth.uid()`;
- check condition: `user_id = auth.uid()`;
- пользователь не может переназначить кейс другому пользователю;
- пользователь не может обновить чужой кейс;
- поля, которые разрешено обновлять, должны быть описаны отдельно перед реализацией.

### DELETE policy

DELETE не входит в текущий ownership/RLS stage.

Требования:

- `anon` не получает DELETE;
- `authenticated` не получает DELETE до отдельного delete/archive/restore plan;
- удаление, архивирование и восстановление кейсов должны быть спроектированы отдельно;
- физическое удаление чувствительных данных требует отдельного privacy/security review.

### Запрет доступа к чужим данным

RLS должен запрещать:

- чтение чужого кейса по прямому `id`;
- обновление чужого кейса по прямому `id`;
- удаление чужого кейса по прямому `id`;
- создание кейса с чужим `user_id`;
- обход ownership через query filters;
- доступ к rows без ownership, если для них не создан отдельный безопасный migration/admin flow.

### Требования к service role

- Service role key запрещен во frontend.
- Service role key не должен попадать в browser bundle, markdown с реальными значениями, logs или `localStorage`.
- Service role key не нужен для обычного user-facing case CRUD.
- Если service role понадобится для migration/admin maintenance, это должен быть отдельный server-side-only security review.
- Любые service-role операции с пользовательскими кейсами должны иметь отдельные docs, approvals и audit expectations.

### Требования к admin access

- Admin Auth Foundation не дает автоматического доступа к user cases.
- `/admin` не должен читать `public.cases` без отдельного RLS/data-access review.
- Admin allowlist в `public.admin_users` не является ownership model для кейсов.
- Будущий admin access, если он понадобится, должен быть отдельным stage с отдельными specs, RLS rules, audit log и privacy review.

## Security Requirements

### Privacy-first

- Исходные тексты кейсов могут содержать персональные, финансовые, жилищные, страховые и юридически чувствительные данные.
- Данные должны сохраняться только в явно утвержденных слоях хранения.
- Локальные чувствительные данные не должны автоматически отправляться в Supabase без утвержденного migration flow.
- Ошибки и logs не должны раскрывать `source_text`, реальные email, case numbers, суммы, документы или Supabase secrets.

### Least privilege

- `anon` получает no access к пользовательским кейсам.
- `authenticated` получает доступ только к своим rows.
- Admin access не включается по умолчанию.
- Service role не используется для обычного пользовательского flow.
- Любое расширение прав должно быть отдельным review.

### Server-side enforcement

- Auth-sensitive и ownership-sensitive решения должны подтверждаться server-side или database-level enforcement.
- RLS является обязательной database-level границей доступа.
- UI может скрывать чужие данные только как дополнительный слой, но не как основной security boundary.
- Запись и миграция кейсов должны проверять authenticated session.

### Запрет client-only security

Запрещено считать безопасностью:

- фильтр по `user_id` только в React state;
- скрытие чужих rows только на UI;
- доверие к user id из `localStorage`;
- доверие к email из формы;
- проверку ownership только в client helper;
- хранение authorization state в `lifepilot.currentCase` или `lifepilot.caseHistory`.

## Negative Test Cases

Перед включением user-facing Supabase storage нужно проверить негативные сценарии.

### Пользователь читает чужой кейс

Ожидаемый результат:

- authenticated user A не может прочитать row, где `user_id` принадлежит user B;
- прямой select по чужому `id` возвращает пустой результат или RLS-denied response;
- UI не получает чужой `source_text`, `analysis`, `action_plan` или metadata.

### Пользователь обновляет чужой кейс

Ожидаемый результат:

- authenticated user A не может обновить row user B;
- попытка изменить чужой кейс не меняет данные;
- попытка поменять `user_id` на другого пользователя отклоняется RLS/check policy.

### Пользователь удаляет чужой кейс

Ожидаемый результат:

- authenticated user A не может удалить row user B;
- если DELETE не входит в scope, authenticated user не может удалить даже свой кейс;
- delete/archive behavior не появляется без отдельного approved plan.

### Anon доступ

Ожидаемый результат:

- `anon` не может SELECT из `public.cases`;
- `anon` не может INSERT в `public.cases`;
- `anon` не может UPDATE `public.cases`;
- `anon` не может DELETE из `public.cases`;
- отсутствие session не раскрывает существование конкретного кейса.

### Admin foundation без user ownership

Ожидаемый результат:

- active admin session не получает автоматический доступ к user cases;
- `public.admin_users` allowlist не обходит ownership model;
- `/admin` не читает `public.cases` без отдельного RLS/data-access review;
- admin user не может читать чужой пользовательский кейс через обычный user-facing policy.

## Acceptance Criteria

Ownership/RLS spec считается готовым, если:

- Current MVP явно остается localStorage-first.
- `user_id` описан как будущий ownership field для `public.cases`.
- `auth.uid()` описан как основа RLS ownership checks.
- SELECT, INSERT, UPDATE и DELETE requirements описаны отдельно.
- Запрет доступа к чужим данным описан явно.
- Service role boundaries описаны явно.
- Admin access boundaries описаны явно.
- Security requirements покрывают privacy-first, least privilege, server-side enforcement и запрет client-only security.
- Negative test cases покрывают чтение, update, delete, anon access и admin foundation без ownership.
- Rollback considerations описывают сохранение localStorage fallback.
- Документ не требует немедленных code, schema, migration или RLS changes.

Будущая реализация не готова к старту, пока:

- `case-model.md` и database specs не обновлены под финальную schema;
- ADR и active implementation plan не подтверждены;
- migration plan не утвержден;
- RLS policies не описаны SQL-level перед применением;
- testing checklist не обновлен;
- rollback plan не подтвержден.

## Risks

Риски неправильной RLS-конфигурации:

- пользователь может прочитать чужой `source_text` или analysis;
- пользователь может изменить или удалить чужой кейс;
- `anon` может получить доступ к sensitive rows;
- row без `user_id` может стать видимой обычным пользователям;
- admin foundation может случайно стать обходом user ownership;
- client-only фильтр может создать ложное ощущение безопасности;
- migration может присвоить кейс неправильному пользователю;
- service role может попасть в неподходящий runtime или logs;
- rollback может оставить приложение без local fallback, если Supabase отключен.

## Rollback Considerations

При откате должно оставаться безопасным:

- Current MVP localStorage flow;
- чтение `lifepilot.currentCase`;
- чтение `lifepilot.caseHistory`;
- открытие detail view локального кейса;
- отсутствие доступа `anon` к `public.cases`;
- запрет доступа к чужим кейсам;
- независимость Admin Auth Foundation от user case storage.

Rollback не должен требовать:

- удаления локальной истории;
- раскрытия пользовательских кейсов администратору;
- отключения RLS для восстановления UI;
- использования service role key во frontend;
- destructive schema rollback как единственного пути восстановления.

Если Supabase user case storage был частично включен, rollback должен:

- отключить user-facing Supabase flow через утвержденный rollout control, если он есть;
- сохранить локальные кейсы в браузере;
- не удалять server rows без отдельного privacy/data-retention decision;
- задокументировать, какие данные могли быть сохранены в Supabase;
- сохранить безопасные empty/error states для пользователя.
