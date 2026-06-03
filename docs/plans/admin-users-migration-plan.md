# План migration для public.admin_users

## Назначение

Этот документ описывает migration plan для таблицы `public.admin_users` перед реализацией Auth/Admin Foundation.

Единственный source of truth для решений:

- [../architecture/auth-admin-foundation-decision-review.md](../architecture/auth-admin-foundation-decision-review.md);
- [../specs/database-auth-model.md](../specs/database-auth-model.md);
- [../specs/admin-spec.md](../specs/admin-spec.md);
- [../specs/security-model.md](../specs/security-model.md).

Этот документ не создает migration и не меняет Supabase schema. Реальная migration должна быть создана только после отдельного approval на Auth/Admin implementation.

## Граница migration

Migration нужна только для admin authorization.

Она не должна:

- менять текущую таблицу `public.cases`;
- добавлять user-facing accounts;
- мигрировать `localStorage` историю;
- создавать связь кейсов с пользователями;
- добавлять audit log без отдельного решения;
- давать browser anon client прямой SELECT к `public.admin_users`;
- подключать admin page к чтению или записи `public.cases`.

## Таблица `public.admin_users`

Планируемая таблица:

- `public.admin_users`.

Назначение:

- хранить allowlist email;
- связать Supabase Auth user с admin-доступом LifePilot;
- хранить единственную app-level роль `admin`;
- разрешать отключение доступа через `status = disabled`.

## Планируемые поля

| Поле | Тип | Ограничение | Назначение |
| --- | --- | --- | --- |
| `id` | `uuid` | primary key | Уникальный id admin-записи |
| `auth_user_id` | `uuid` | not null, unique, foreign key | Ссылка на `auth.users(id)` |
| `email` | `text` | not null, unique | Email администратора |
| `role` | `text` | not null | App-level роль |
| `status` | `text` | not null | Состояние admin-доступа |
| `created_at` | `timestamptz` | not null | Дата создания |
| `updated_at` | `timestamptz` | not null | Дата обновления |

Допустимые значения:

- `role`: `admin`;
- `status`: `active`, `disabled`.

## Constraints

Migration должна предусмотреть:

- primary key на `id`;
- unique constraint на `auth_user_id`;
- unique constraint на `email`;
- not null для `auth_user_id`;
- not null для `email`;
- not null для `role`;
- not null для `status`;
- check constraint для `role = admin`;
- check constraint для `status in ('active', 'disabled')`;
- foreign key `auth_user_id REFERENCES auth.users(id) ON DELETE CASCADE`;
- дефолтные значения для `id`, `created_at` и `updated_at`, если это соответствует принятому migration style проекта.

Foreign key обязателен. Если migration не может добавить `auth_user_id REFERENCES auth.users(id) ON DELETE CASCADE`, Auth/Admin implementation должна быть остановлена до отдельного architecture review.

## RLS plan

RLS для `public.admin_users` должен быть включен.

Правила:

- `anon` не получает прямой SELECT к `public.admin_users`;
- `authenticated` не получает прямой SELECT к `public.admin_users`;
- browser client не получает прямой SELECT к `public.admin_users`;
- admin-доступ не проверяется client-side чтением allowlist;
- admin validation выполняется только server-side;
- server-side check читает `public.admin_users` и проверяет `status = active`, затем `role = admin`;
- service role key запрещен для MVP Auth Foundation.

План прямых table policies:

- deny direct SELECT for `anon`;
- deny direct SELECT for `authenticated`;
- deny INSERT, UPDATE и DELETE for `anon`;
- deny INSERT, UPDATE и DELETE for `authenticated`.

Любые будущие admin-management операции с `public.admin_users` должны проходить отдельный review.

## Seed и реальные email

Реальные admin email не должны попадать в GitHub.

Нельзя коммитить:

- реальные email в migration seed;
- реальные Supabase keys;
- service role key;
- production credentials;
- `.env.local`;
- `.env`.

Если нужен initial admin, способ создания должен быть утвержден отдельно:

- через Supabase dashboard;
- через безопасный server-side процесс;
- через migration без реальных персональных данных, если это возможно и утверждено.

## Порядок работ после approval

1. Подтвердить approval на Auth/Admin implementation.
2. Создать migration для `public.admin_users`.
3. Включить RLS для `public.admin_users`.
4. Добавить mandatory foreign key к `auth.users(id)`.
5. Добавить constraints из этого плана.
6. Добавить RLS deny policies для `anon` и `authenticated`.
7. Не добавлять реальные admin email в GitHub.
8. Проверить migration локально или в утвержденной Supabase среде.
9. Обновить docs, если фактическая migration отличается от плана.

## Критерии готовности migration

Migration считается готовой только когда:

- `public.admin_users` создана;
- constraints соответствуют [../specs/database-auth-model.md](../specs/database-auth-model.md);
- `auth_user_id` имеет foreign key на `auth.users(id)`;
- RLS включен;
- `anon` и `authenticated` не имеют прямого table access к allowlist;
- service role key не используется во frontend;
- service role key не используется для MVP Auth Foundation;
- реальные admin email и секреты не закоммичены;
- основной local-first MVP не изменен.
