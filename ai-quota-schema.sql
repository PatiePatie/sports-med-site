-- ============================================================================
-- AI DAILY QUOTA -- the ONLY file you need to run. Paste the SQL below into
-- the Supabase SQL Editor and press Run ONCE.
--
-- Project:  eytmbftrjvsntyzwbtzl
-- Editor:   https://supabase.com/dashboard/project/eytmbftrjvsntyzwbtzl/sql/new
--
-- SAFE TO RUN TWICE -- every statement below is idempotent.
--
-- WHAT IT DOES
--   1. Creates one table, ai_daily, holding a call count per person per day.
--   2. Locks that table with RLS so the public anon key cannot read or write
--      it directly.
--   3. Creates ai_touch(), the only way to add to the count. It runs as the
--      database owner (SECURITY DEFINER), which is how the anon key can call
--      it while still being unable to touch the table.
--      The increment and the limit check happen in ONE transaction, so two
--      simultaneous requests cannot both slip past the cap.
--   4. Grants EXECUTE to anon and authenticated only.
--
-- FREE TIER = 5 CALLS/DAY. Change the 5 below if you want a different cap.
-- ============================================================================


-- 1. the counter table -------------------------------------------------------
create table if not exists public.ai_daily (
  uid         text        not null,
  day         date        not null default current_date,
  n           integer     not null default 0,
  updated_at  timestamptz not null default now(),
  primary key (uid, day)
);

-- 2. lock the table down ----------------------------------------------------
alter table public.ai_daily enable row level security;

-- 3. the increment + limit check -------------------------------------------
create or replace function public.ai_touch(p_uid text, p_limit integer default 5)
returns jsonb
language plpgsql
security definer
set search_path = public
as $aiq$
declare
  v_n integer;
begin
  insert into public.ai_daily (uid, day, n) values (p_uid, current_date, 1)
    on conflict (uid, day) do update
      set n = public.ai_daily.n + 1, updated_at = now()
    returning n into v_n;

  if v_n > p_limit then
    return jsonb_build_object('allowed', false, 'left', 0, 'limit', p_limit);
  end if;

  return jsonb_build_object('allowed', true, 'left', p_limit - v_n, 'limit', p_limit);
end;
$aiq$;

-- 4. who may call it --------------------------------------------------------
revoke all on function public.ai_touch(text, integer) from public;
grant execute on function public.ai_touch(text, integer) to anon, authenticated;


-- ============================================================================
-- VERIFY -- run this afterwards, in a NEW query tab.
-- You want anon_can_call = t. If it is f, the function exists but nothing can
-- reach it, and the quota will silently never apply.
--
--   select has_function_privilege(
--            'anon','public.ai_touch(text,integer)','EXECUTE') as anon_can_call;
--
-- Optional, confirms the cap is real. 6 calls with a limit of 5 should end
-- with allowed = false:
--
--   select public.ai_touch('test-user-12345', 5);
--
-- Clean up that test row afterwards:
--
--   delete from public.ai_daily where uid = 'test-user-12345';
--
-- STILL TO DO AFTER THIS: this only creates the meter. The worker that calls
-- it is committed to the repo but NOT yet deployed, so nothing enforces the
-- limit until that happens. The browser already caps free users at 5/day
-- locally, so this is extra safety rather than an urgent fix.
-- ============================================================================
