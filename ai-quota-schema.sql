-- ═══════════════════════════════════════════════════════════════════════
-- ai-quota-schema.sql — server-side AI daily quota (run once in Supabase)
-- ═══════════════════════════════════════════════════════════════════════
-- Why this exists: the client showed a remaining-quota number, but nothing
-- actually counted anything — the worker had no metering at all, so the
-- number was decoration. This makes the free limit real.
--
-- Run this in the Supabase SQL editor for project eytmbftrjvsntyzwbtzl.
--
-- DESIGN
--   ai_daily      one row per (uid, day) with the running count.
--   uid           the signed-in Supabase user id when there is one, otherwise
--                 an opaque hash of IP + user-agent computed in the worker.
--                 Anonymous visitors are metered by that hash.
--   ai_touch()    the only way to increment. SECURITY DEFINER so the anon
--                 key can call it without being able to read or write the
--                 table directly, and it does the limit check and the
--                 increment in ONE transaction so two simultaneous requests
--                 cannot both slip past the cap.
--   entitlements  optional. If this table does not exist yet the function
--                 still works: everyone is simply treated as free, which is
--                 the safe default until billing exists.
--
-- FREE TIER = 5 calls/day. Change FREE_LIMIT below when you like.

create table if not exists public.ai_daily (
  uid         text        not null,
  day         date        not null default current_date,
  n           integer     not null default 0,
  updated_at  timestamptz not null default now(),
  primary key (uid, day)
);

alter table public.ai_daily enable row level security;
-- no policies on purpose: the anon key cannot touch this table at all.
-- The worker reaches it only through ai_touch(), which is SECURITY DEFINER.

create or replace function public.ai_touch(p_uid text, p_limit integer default 5)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today  date := current_date;
  v_n      integer;
  v_plan   text := 'free';
  v_left   integer;
begin
  -- Paid plans are unmetered. If the entitlements table is not there yet this
  -- quietly stays 'free', which is the safe default.
  begin
    select coalesce(max(e.plan::text), 'free') into v_plan
      from public.entitlements e
     where e.user_id = p_uid::uuid
       and (e.until is null or e.until > now())
       and e.plan in ('plus','teacher','admin');
  exception when others then
    v_plan := 'free';
  end;

  if v_plan <> 'free' then
    return jsonb_build_object('allowed', true, 'plan', v_plan, 'left', null, 'unlimited', true);
  end;

  insert into public.ai_daily (uid, day, n) values (p_uid, v_today, 1)
    on conflict (uid, day) do update set n = public.ai_daily.n + 1, updated_at = now()
    returning n into v_n;

  v_left := greatest(0, p_limit - v_n);

  -- Over the cap: leave the counter where it is and refuse. Do not decrement.
  if v_n > p_limit then
    return jsonb_build_object('allowed', false, 'plan', 'free', 'left', 0, 'limit', p_limit, 'unlimited', false);
  end if;

  return jsonb_build_object('allowed', true, 'plan', 'free', 'left', v_left, 'limit', p_limit, 'unlimited', false);
end;
$$;

revoke all on function public.ai_touch(text, integer) from public;
grant execute on function public.ai_touch(text, integer) to anon, authenticated;

-- Optional: what the entitlements table should look like when billing lands.
-- Uncomment once you actually have the table.
--
-- create table if not exists public.entitlements (
--   user_id uuid primary key references auth.users(id) on delete cascade,
--   plan     text not null default 'free',
--   until    timestamptz,
--   seats    integer,
--   created_at timestamptz not null default now()
-- );
-- alter table public.entitlements enable row level security;
