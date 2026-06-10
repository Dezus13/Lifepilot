# LocalStorage to Supabase Migration

## Назначение

Этот документ проектирует безопасный переход от Current MVP, где пользовательские кейсы работают localStorage-first, к будущему Supabase user-case storage.

Current MVP остается localStorage-first. Пользовательские экраны создания, результата, черновика, истории и detail view продолжают использовать `lifepilot.currentCase` и `lifepilot.caseHistory` в браузерном `localStorage`. Этот spec не меняет код, UI, routes, Supabase schema, migrations, RLS policies, Auth/Admin реализацию или текущую логику хранения.

Документ связан с:

- `docs/specs/case-model.md`;
- `docs/specs/data-storage.md`;
- `docs/specs/case-ownership-rls.md`;
- `docs/architecture/adr-supabase-user-case-storage.md`;
- `docs/plans/active/supabase-user-cases-plan.md`;
- `docs/supabase-foundation.md`.

## Scope

В scope этого migration spec входит:

- описать фазовый переход от локального хранения к user-owned Supabase storage;
- определить условия для user auth перед server persistence;
- определить правила Supabase write path и read path;
- определить правила миграции локальной истории;
- определить dual-write strategy;
- определить fallback и recovery behavior;
- определить rollback strategy;
- определить acceptance criteria для будущей implementation-задачи;
- зафиксировать риски, которые нужно закрыть до реализации.

Этот документ является проектным spec. Реализация требует отдельного approved active implementation plan, обновления связанных specs/architecture/testing и отдельного migration/RLS review.

## Out Of Scope

На этом этапе не выполняются:

- изменение кода приложения;
- изменение UI;
- изменение routes;
- изменение текущей localStorage-логики;
- изменение Auth/Admin Foundation;
- создание или изменение Supabase schema;
- создание migrations;
- изменение RLS policies;
- подключение Supabase к user-facing flow;
- автоматическая миграция реальных локальных данных;
- удаление локальной истории;
- delete/archive/restore кейсов;
- конфликт-резолюшен для разных версий одного кейса;
- admin-доступ к пользовательским кейсам;
- billing, usage limits или тарифы;
- OCR, PDF parser, file upload или external AI/API processing.

## Migration Strategy

Переход должен быть поэтапным. Нельзя заменять `localStorage` на Supabase одномоментно.

### Phase 1: localStorage only

Текущий Current MVP.

Требования:

- `localStorage` является единственным рабочим user-facing хранилищем;
- `lifepilot.currentCase` хранит текущий кейс;
- `lifepilot.caseHistory` хранит локальную историю;
- Supabase Foundation остается schema/client foundation и не становится источником пользовательской истории;
- `readSupabaseCases()` не заменяет локальную историю;
- user-facing Auth не требуется для текущего MVP.

Exit criteria:

- MVP flow стабилен без Supabase user storage;
- документация явно разделяет Current MVP и future Supabase stage;
- локальная история открывается без backend, auth или database.

### Phase 2: user auth

Перед server persistence нужен user-facing Auth stage, отдельный от Admin Auth Foundation.

Требования:

- пользовательская identity должна быть основана на Supabase Auth user;
- admin identity из `public.admin_users` не является user ownership;
- auth session не хранится в `lifepilot.currentCase` или `lifepilot.caseHistory`;
- пользователь может продолжить local-first flow без принудительной миграции локальной истории;
- ownership model должен быть согласован с `docs/specs/case-ownership-rls.md`.

Exit criteria:

- user-facing Auth scope утвержден отдельно;
- ownership через `user_id` и `auth.uid()` описан до записи кейсов;
- fallback без login остается безопасным.

### Phase 3: Supabase write path

На этом этапе новые кейсы могут получать server persistence после успешной authenticated session и утвержденных RLS policies.

Требования:

- write path разрешен только для authenticated user;
- new server rows должны принадлежать `auth.uid()`;
- локальное сохранение не удаляется после успешного server write;
- ошибка server write не должна ломать локальный кейс;
- повторная попытка записи должна быть idempotent;
- write path не должен использовать service role key во frontend.

Exit criteria:

- новые authenticated cases могут быть сохранены в Supabase без потери local fallback;
- RLS negative tests запрещают доступ к чужим данным;
- ошибки Supabase не удаляют локальные данные.

### Phase 4: read path

После стабилизации write path можно добавлять чтение user-owned истории из Supabase.

Требования:

- read path разрешен только authenticated user;
- Supabase history должна возвращать только rows, где `user_id = auth.uid()`;
- local history остается доступной как fallback;
- UI должен различать local-only, server-saved и unavailable/error states, если это входит в будущий UX scope;
- `anon` не получает read access;
- admin foundation не становится read path для user cases.

Exit criteria:

- authenticated user видит только свои server cases;
- local history открывается при Supabase/network/RLS ошибке;
- direct access к чужому case id не раскрывает данные.

### Phase 5: local history migration

Локальная история переносится только после явного пользовательского подтверждения и успешной authenticated session.

Требования:

- автоматическая отправка локальных данных запрещена;
- пользователь должен ясно подтвердить миграцию локальной истории;
- каждый migrated local case должен получить связь с authenticated `user_id`;
- повторная миграция не должна создавать дубликаты;
- partial success должен быть безопасно отображен и не удалять локальную историю;
- конфликтные записи должны быть определены отдельным будущим документом.

Exit criteria:

- локальные кейсы могут быть перенесены без дубликатов;
- локальная история сохраняется после миграции;
- пользователь понимает, какие данные будут отправлены на сервер.

### Phase 6: stabilization

Этап стабилизации проверяет, что Supabase storage можно считать рабочим дополнительным или основным источником в утвержденном scope.

Требования:

- пройти RLS positive/negative checks;
- пройти fallback checks для Supabase unavailable, network failure, auth failure и RLS rejection;
- проверить старые local-only кейсы;
- проверить idempotency повторной миграции;
- обновить testing checklist;
- сохранить rollback path к localStorage.

Exit criteria:

- документация, testing и implementation согласованы;
- local fallback не сломан;
- rollback не требует удаления пользовательской истории.

## Dual-Write Strategy

Dual-write означает одновременное или последовательное сохранение одного нового кейса в `localStorage` и Supabase.

### Когда разрешена

Dual-write может быть разрешена только после того, как:

- user-facing Auth реализован и authenticated session подтверждена;
- ownership model утвержден;
- RLS policies утверждены и протестированы;
- Supabase write path имеет fallback на localStorage;
- idempotency strategy описана и реализована;
- пользовательский flow не теряет кейс при server error.

Допустимое направление для нового кейса:

1. Сохранить кейс локально.
2. Попытаться сохранить server row для authenticated user.
3. Связать локальный кейс с server row только после успешного ответа.
4. При ошибке оставить local-only кейс доступным.

### Когда запрещена

Dual-write запрещена, если:

- пользователь не authenticated;
- ownership нельзя подтвердить через `auth.uid()`;
- RLS policies не утверждены;
- отсутствует idempotency strategy;
- Supabase unavailable или config отсутствует;
- запись требует service role key во frontend;
- пользователь не понимает, что новый кейс сохраняется на сервере;
- это миграция старой локальной истории без явного подтверждения пользователя.

### Как избежать дубликатов

Будущая реализация должна иметь stable idempotency key для каждого local case.

Возможные направления для будущего review:

- сохранить локальный `id` как client-generated source id в отдельном server field;
- хранить migration metadata, связывающую local id и server id;
- применять уникальное ограничение по `(user_id, local_source_id)` или эквивалентную проверку;
- перед повторной записью искать существующую migrated/server-linked запись;
- не создавать новую server row при retry, если предыдущая попытка уже была успешной.

Окончательная unique/idempotency модель должна быть описана в отдельном schema/migration plan до создания migrations.

### Idempotency requirements

Idempotency обязательна для:

- повторной отправки после network timeout;
- повторной миграции того же local case;
- восстановления после partial success;
- повторного открытия приложения после failed/unknown write state.

Минимальные требования:

- один local case не должен создавать несколько server rows для одного пользователя;
- retry должен быть безопасен;
- unknown state должен решаться через проверку existing server row или future reconciliation flow;
- idempotency key не должен содержать sensitive `sourceText`;
- idempotency не должна основываться только на title или timestamp.

## Fallback Strategy

Fallback должен сохранять доступ пользователя к локальным кейсам и не раскрывать данные.

### Supabase unavailable

Если Supabase недоступен:

- новый кейс сохраняется локально;
- server persistence помечается как unavailable, если такой статус будет введен;
- история открывается из `localStorage`;
- пользовательские данные не удаляются;
- технические детали Supabase не раскрываются пользователю.

### Network failure

Если сеть недоступна или запрос оборвался:

- локальное сохранение остается источником восстановления;
- retry должен быть безопасен и idempotent;
- unknown write result не должен приводить к повторным дубликатам;
- recovery должен проверять, была ли server row уже создана, если такая проверка утверждена будущим implementation plan.

### Auth failure

Если authenticated session отсутствует, истекла или не подтверждена:

- Supabase write/read path запрещен;
- localStorage flow продолжает работать;
- локальные кейсы не отправляются автоматически после повторного login;
- миграция локальной истории требует нового явного подтверждения, если session была восстановлена.

### RLS rejection

Если Supabase отклоняет запрос через RLS:

- приложение должно считать server operation failed;
- локальный кейс должен сохраниться;
- чужие данные не должны раскрываться;
- пользователь не должен видеть policy details;
- событие должно быть пригодно для диагностики без PII в logs.

### Recovery flow

Будущий recovery flow должен:

- сохранить local history как источник восстановления;
- позволить retry только idempotent-операций;
- показывать безопасный partial-success state, если часть кейсов была сохранена;
- не удалять локальные кейсы до отдельного retention decision;
- не использовать service role key во frontend;
- не требовать отключения RLS для восстановления пользовательского flow.

## Rollback Strategy

Rollback должен возвращать user-facing flow к localStorage без потери локальной истории.

### Возврат к localStorage

При rollback:

- `lifepilot.currentCase` снова остается рабочим текущим кейсом;
- `lifepilot.caseHistory` остается рабочей историей;
- Supabase read/write path отключается через утвержденный rollout control, если он есть;
- пользовательский flow не должен зависеть от server rows.

### Сохранение пользовательских данных

Rollback не должен:

- удалять локальную историю;
- автоматически удалять server rows без отдельного privacy/data-retention decision;
- скрывать local-only кейсы;
- требовать destructive schema rollback как единственный путь восстановления.

### Отключение server persistence

Отключение server persistence должно:

- остановить новые Supabase writes;
- остановить Supabase reads как рабочий источник истории;
- сохранить safe empty/error states;
- не менять Admin Auth Foundation;
- не требовать service role key во frontend.

### Сохранение истории

История должна оставаться доступной:

- из `localStorage` для local-only и migrated cases;
- без user-facing Auth, если пользователь возвращается к Current MVP mode;
- без server sync;
- без автоматического пересчета анализа или повторной отправки данных.

## Migration Rules

Правила миграции локальной истории:

- пользователь явно подтверждает миграцию;
- автоматическая отправка локальных данных запрещена;
- миграция разрешена только при подтвержденной authenticated session;
- каждый migrated case получает ownership только через authenticated user id;
- повторная миграция не создает дубликаты;
- local history не удаляется сразу после migration success;
- partial success не скрывает не перенесенные local cases;
- sensitive text не используется как idempotency key;
- конфликтные записи должны быть определены отдельным будущим документом;
- миграция не должна менять смысл анализа, risk level, priority, status или action plan без отдельного review.

## Acceptance Criteria

Migration spec считается готовым, если:

- Current MVP явно остается localStorage-first.
- Описаны Phase 1 through Phase 6.
- Supabase user storage описан как future stage.
- User-facing Auth указан как prerequisite для server persistence.
- Dual-write strategy описывает разрешенные и запрещенные условия.
- Idempotency requirements запрещают duplicate server rows для одного local case.
- Fallback strategy покрывает Supabase unavailable, network failure, auth failure и RLS rejection.
- Rollback strategy сохраняет `localStorage` и пользовательскую историю.
- Migration rules запрещают автоматическую отправку локальных данных.
- Конфликтные записи вынесены в будущий отдельный документ.
- Out of scope явно запрещает code, UI, routes, schema, migrations и RLS changes.
- Документ согласован с roadmap, MVP definition, Supabase Foundation, ADR, ownership/RLS spec и active plan.

Будущая implementation-задача не готова к старту, пока:

- не утвержден отдельный active implementation plan;
- не обновлены specs для final schema и data flow;
- не утверждены SQL-level RLS policies;
- не создан testing checklist для Supabase migration stage;
- не описан duplicate/conflict resolution;
- не подтвержден rollout/rollback control;
- не определена privacy/data-retention policy для server rows и local history.

## Risks

Основные риски migration stage:

- автоматическая миграция может отправить чувствительные локальные данные без понятного согласия пользователя;
- dual-write может создать дубликаты без stable idempotency;
- network timeout может оставить неизвестное состояние server write;
- RLS rejection может быть неправильно обработан как empty history;
- auth session может истечь во время migration;
- local history может быть удалена слишком рано;
- server rows могут остаться после rollback без data-retention решения;
- конфликтные записи между local и server versions могут быть смешаны без отдельной стратегии;
- Admin Auth Foundation может быть ошибочно воспринят как доступ к user cases;
- service role key может попасть в неправильный runtime, если recovery/migration делать через frontend.

## Документы, которые нужно создать или обновить перед реализацией

Перед implementation stage нужны:

- final schema/migration plan для ownership и idempotency fields;
- SQL-level RLS policy spec/checklist;
- user-facing Auth spec или update existing auth docs с четким разделением от Admin Auth Foundation;
- Supabase migration testing checklist;
- duplicate/conflict resolution spec;
- rollout/feature-flag и rollback runbook, если будет использоваться staged rollout;
- privacy/data-retention decision для migrated server rows и local history.
