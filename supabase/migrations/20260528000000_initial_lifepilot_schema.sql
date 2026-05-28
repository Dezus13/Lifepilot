create table public.cases (
  id uuid primary key default gen_random_uuid(),
  title text,
  category text,
  source_text text not null,
  summary text,
  risk_level text,
  priority_level text,
  status text,
  deadline_status text,
  action_plan jsonb,
  analysis jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.cases enable row level security;
