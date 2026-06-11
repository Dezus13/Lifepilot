# SQL RLS Policy Spec для `public.cases`

## Назначение

Этот документ описывает SQL-level RLS policy contract для будущего user-facing Supabase storage таблицы `public.cases`.

Документ не создает SQL, migrations или policies. Он фиксирует требования, которые должны быть превращены в reviewed SQL только в отдельной implementation-задаче.

Current MVP остается localStorage-first. `localStorage` продолжает быть рабочим хранилищем пользовательского MVP до утвержденной реализации Supabase user-case storage.

## Scope

В scope входит:

- SELECT policy contract;
- INSERT policy contract;
- UPDATE policy contract;
- DELETE policy contract;
- anonymous access restrictions;
- ownership through `user_id = auth.uid()`;
- запрет изменения `user_id` через UPDATE;
- admin boundary;
- service role boundary;
- positive и negative test requirements.

## Out Of Scope

Документ не разрешает:

- писать SQL;
- создавать migrations;
- менять schema;
- применять RLS policies;
- менять код, UI или routes;
- подключать Supabase к user-facing flow;
- добавлять admin-доступ к user cases;
- добавлять delete/archive/restore flow.

## Policy Principles

- RLS для `public.cases` должен быть включен до user-facing read/write path.
- Default posture: deny by default.
- `anon` не получает доступ к user cases.
- `authenticated` получает доступ только к rows, где `user_id = auth.uid()`.
- `auth.uid()` является единственным database-level user identity для ownership.
- Email, client-side user id, localStorage value и UI state не являются authorization boundary.
- `public.admin_users` не дает автоматического доступа к user cases.
- Service role key запрещен во frontend.

## SELECT Policy Contract

Назначение: разрешить authenticated user читать только собственные active case rows.

Требования:

- role: `authenticated`;
- condition: `user_id = auth.uid()`;
- ordinary read path должен исключать rows, где `deleted_at is not null`;
- `anon` не получает SELECT;
- rows без `user_id` не видны ordinary authenticated users;
- direct lookup by чужой `id` не возвращает чужие данные;
- admin session не получает SELECT к user cases через `public.admin_users`.

Expected behavior:

- user A видит только rows user A;
- user B не видит rows user A;
- unauthenticated browser не видит rows;
- soft-deleted rows не появляются в обычной истории.

## INSERT Policy Contract

Назначение: разрешить authenticated user создавать только собственные case rows.

Требования:

- role: `authenticated`;
- check: `user_id = auth.uid()`;
- `user_id` обязателен для new user-owned rows;
- `anon` не получает INSERT;
- client не может создать row для другого `user_id`;
- client не может создать row без ownership;
- `local_source_id`, если передан, не должен содержать sensitive text;
- insert должен соблюдать constraints из `supabase-schema-v1.md`.

Expected behavior:

- authenticated user может создать row только для себя;
- попытка создать row с чужим `user_id` отклоняется;
- попытка anon insert отклоняется;
- retry insert не должен создавать duplicate row при существующем `(user_id, local_source_id)`.

## UPDATE Policy Contract

Назначение: разрешить authenticated user обновлять только собственные case rows в утвержденном scope.

Требования:

- role: `authenticated`;
- using condition: existing row belongs to `auth.uid()`;
- check condition: updated row still belongs to `auth.uid()`;
- `user_id` нельзя менять через UPDATE;
- `anon` не получает UPDATE;
- user A не может обновить row user B;
- soft delete через `deleted_at` разрешается только если отдельный delete/archive/restore scope утвержден;
- update fields должны быть ограничены future implementation scope.

Expected behavior:

- own row update succeeds only when all constraints pass;
- changing `user_id` is rejected;
- direct update by чужой `id` is rejected;
- rows без `user_id` are not updatable by ordinary authenticated users.

## DELETE Policy Contract

Назначение: запретить physical DELETE до отдельного delete/archive/restore plan.

Требования:

- `anon` не получает DELETE;
- `authenticated` не получает DELETE в initial user-case storage scope;
- admin session не получает DELETE through user-facing policies;
- physical delete requires separate privacy/security/data-retention review;
- future delete/archive/restore behavior must update specs, RLS policy contract, testing checklist and runbook.

Expected behavior:

- user cannot delete own row physically in initial scope;
- user cannot delete чужой row;
- admin cannot delete user cases through `public.admin_users` allowlist;
- rollback does not require disabling RLS or deleting data.

## Admin Boundary

`public.admin_users` используется только для Admin Auth Foundation.

Требования:

- `public.admin_users` не является ownership model для `public.cases`;
- active admin row не дает automatic SELECT/INSERT/UPDATE/DELETE к user cases;
- `/admin` не должен читать `public.cases` без отдельного RLS/data-access review;
- future admin access, если понадобится, должен иметь отдельные policies, audit expectations и privacy review.

## Service Role Boundary

Требования:

- service role key запрещен во frontend;
- service role key не нужен для ordinary user-facing CRUD;
- service role key не должен попадать в browser bundle, logs, markdown с реальными значениями или `localStorage`;
- server-side maintenance use, если понадобится, должен быть отдельным approved security review.

## Positive Test Cases

- authenticated user A selects own active row.
- authenticated user A inserts row with `user_id = auth.uid()`.
- authenticated user A updates own row without changing `user_id`.
- soft-deleted row is excluded from ordinary history read.
- retry insert with same `(user_id, local_source_id)` does not create duplicate row.

## Negative Test Cases

- `anon` SELECT returns no user case data.
- `anon` INSERT is rejected.
- `anon` UPDATE is rejected.
- `anon` DELETE is rejected.
- user A cannot SELECT row owned by user B.
- user A cannot INSERT row with user B id.
- user A cannot UPDATE row owned by user B.
- user A cannot change `user_id` on own row.
- user A cannot DELETE own or чужой row in initial scope.
- admin session cannot read user cases through `public.admin_users`.
- row without `user_id` is invisible to ordinary authenticated users.

## Acceptance Criteria

Policy spec is implementation-ready when:

- SELECT, INSERT, UPDATE and DELETE contracts are documented;
- `anon` access is forbidden for every operation;
- ownership is based only on `user_id = auth.uid()`;
- UPDATE cannot reassign ownership;
- admin boundary is documented;
- service role boundary is documented;
- positive and negative test cases are documented;
- document contains no executable SQL.

## Related Documents

- [case-ownership-rls.md](./case-ownership-rls.md);
- [supabase-schema-v1.md](./supabase-schema-v1.md);
- [public-cases-migration-plan.md](./public-cases-migration-plan.md);
- [user-auth-spec.md](./user-auth-spec.md);
- [../testing/supabase-checklist.md](../testing/supabase-checklist.md);
- [../architecture/supabase-production-runbook.md](../architecture/supabase-production-runbook.md).
