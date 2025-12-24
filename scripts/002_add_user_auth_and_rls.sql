-- Add user_id column to charging_sessions table
alter table public.charging_sessions add column user_id uuid references auth.users(id) on delete cascade;

-- Create index for user queries
create index if not exists charging_sessions_user_id_idx on public.charging_sessions (user_id);

-- Enable Row Level Security
alter table public.charging_sessions enable row level security;

-- Create policy: Users can only view their own charging sessions
create policy "Users can view own charging sessions"
  on public.charging_sessions for select
  using (auth.uid() = user_id);

-- Create policy: Users can only insert their own charging sessions
create policy "Users can insert own charging sessions"
  on public.charging_sessions for insert
  with check (auth.uid() = user_id);

-- Create policy: Users can only update their own charging sessions
create policy "Users can update own charging sessions"
  on public.charging_sessions for update
  using (auth.uid() = user_id);

-- Create policy: Users can only delete their own charging sessions
create policy "Users can delete own charging sessions"
  on public.charging_sessions for delete
  using (auth.uid() = user_id);
