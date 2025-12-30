-- Add notes and is_home fields to charging_sessions table
alter table public.charging_sessions
add column if not exists notes text,
add column if not exists is_home boolean default false;

-- Add comment for documentation
comment on column public.charging_sessions.notes is 'Optional notes/comments for the charging session';
comment on column public.charging_sessions.is_home is 'Whether this was a home charge (true) or external/public charge (false)';

