-- Create charging_sessions table
create table if not exists public.charging_sessions (
  id uuid primary key default gen_random_uuid(),
  cost integer not null,
  start_percent integer not null check (start_percent >= 0 and start_percent <= 100),
  end_percent integer not null check (end_percent >= 0 and end_percent <= 100),
  charged_at timestamp with time zone not null default now(),
  created_at timestamp with time zone default now()
);

-- Add index for faster queries by date
create index if not exists charging_sessions_charged_at_idx on public.charging_sessions (charged_at desc);
