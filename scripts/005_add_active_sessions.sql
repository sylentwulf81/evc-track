-- Add status column and active session fields
alter table public.charging_sessions 
add column if not exists status text check (status in ('active', 'completed')) default 'completed';

-- Make end_percent and cost nullable for active sessions
alter table public.charging_sessions 
alter column end_percent drop not null;

alter table public.charging_sessions 
alter column cost drop not null;

-- Add session_start distinct from charged_at (which is usually completion time)
alter table public.charging_sessions
add column if not exists session_start timestamp with time zone;

-- Update existing records to be completed
update public.charging_sessions 
set status = 'completed' 
where status is null;
