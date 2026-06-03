create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'admin' check (role = 'admin'),
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

revoke all on table public.admin_users from anon;
revoke all on table public.admin_users from authenticated;
grant select on table public.admin_users to authenticated;

create policy "admin users can read own active admin row"
on public.admin_users
for select
to authenticated
using (
  auth.uid() = auth_user_id
  and status = 'active'
  and role = 'admin'
);
