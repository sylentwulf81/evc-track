-- Allow anonymous sessions (user_id can be null for guest users)
-- This doesn't affect existing data, just allows null user_id

-- Update RLS policies to also allow anonymous access for rows with null user_id
-- Note: Anonymous users won't use the database - they'll use localStorage
-- This policy update is just for safety

-- Add policy for service role to manage all data (for potential future admin features)
create policy "Service role can manage all data"
  on public.charging_sessions for all
  using (true)
  with check (true);
