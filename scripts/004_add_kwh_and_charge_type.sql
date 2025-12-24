-- Add kwh and charge_type columns to charging_sessions table

alter table public.charging_sessions
add column if not exists kwh numeric(10, 2),
add column if not exists charge_type text check (charge_type in ('fast', 'standard'));

-- Add comment for documentation
comment on column public.charging_sessions.kwh is 'Kilowatt-hours of energy delivered (optional)';
comment on column public.charging_sessions.charge_type is 'Type of charge: fast or standard (optional)';
