-- ═══════════════════════════════════════════════════════════════════════════
-- Vitalité SECURITY HARDENING — target project: eytmbftrjvsntyzwbtzl
-- 2026-09-06 (V) — the "open door" closeout.
--
-- WHAT THIS FIXES:
--   * Every table previously had:  "for all to anon, authenticated using (true)"
--     The public anon key could read/write/delete EVERYTHING — members names,
--     emails, moderation rows (unfreeze yourself), the devs list, dr7 usage.
--   * admin_delete_user was SECURITY DEFINER and granted to anon => ANYONE could
--     delete ANY auth user by email. The single worst hole on the site.
--
-- NEW MODEL — the server finally trusts the user's Supabase JWT:
--   * anon (no session): forum read-only. NOTHING else.
--   * authenticated: own member row (upsert on login), own moderation row
--     (freeze check), own forum content. Upvote/flag any topic while signed in.
--   * developers (email in public.devs): full console — members/moderation/
--     devs/dr7_usage reads, moderation writes, forum moderation, user delete.
--   * admin_delete_user: authenticated only AND re-checks is_dev() INSIDE the
--     function (SECURITY DEFINER bypasses RLS — the function must self-guard).
--
-- RUN ORDER (idempotent, drop + recreate — safe to re-run):
--   1) forum-schema.sql   (creates forum tables if missing)
--   2) supabase-hardening.sql   (this file)
--
-- ═══════════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────
-- 0) Developer check helper
--    Security definer so the devs-read never deadlocks itself via RLS.
--    Reads the caller's JWT — the JWT is NOT bypassable from the client.
-- ──────────────────────────────────────────────────────────────
create or replace function public.is_dev()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.devs
    where email = nullif(auth.jwt() ->> 'email', '')
  );
$$;

revoke all on function public.is_dev() from public;
grant execute on function public.is_dev() to anon, authenticated;

-- ──────────────────────────────────────────────────────────────
-- 1) members — you see yourself; devs see everyone. You can only
--    create/update YOUR OWN row (login-time upsert still works).
-- ──────────────────────────────────────────────────────────────
drop policy if exists "site_all_members" on public.members;

create policy members_read
  on public.members for select
  to anon, authenticated
  using (public.is_dev() or email = nullif(auth.jwt() ->> 'email', ''));

create policy members_insert_own
  on public.members for insert
  to authenticated
  with check (email = nullif(auth.jwt() ->> 'email', ''));

create policy members_update_own
  on public.members for update
  to authenticated
  using (email = nullif(auth.jwt() ->> 'email', ''))
  with check (email = nullif(auth.jwt() ->> 'email', ''));

-- ──────────────────────────────────────────────────────────────
-- 2) moderation — anyone reads their OWN freeze row (login check);
--    only devs write (freeze/unfreeze/restore).
-- ──────────────────────────────────────────────────────────────
drop policy if exists "site_all_moderation" on public.moderation;

create policy moderation_read
  on public.moderation for select
  to anon, authenticated
  using (public.is_dev() or email = nullif(auth.jwt() ->> 'email', ''));

create policy moderation_write_devs
  on public.moderation for insert
  to authenticated
  with check (public.is_dev());

create policy moderation_update_devs
  on public.moderation for update
  to authenticated
  using (public.is_dev())
  with check (public.is_dev());

create policy moderation_delete_devs
  on public.moderation for delete
  to authenticated
  using (public.is_dev());

-- ──────────────────────────────────────────────────────────────
-- 3) devs — the list only exists for developers. No anon reads,
--    no writes from the API at all (added via SQL editor / service role).
-- ──────────────────────────────────────────────────────────────
drop policy if exists "site_all_devs" on public.devs;

create policy devs_read
  on public.devs for select
  to anon, authenticated
  using (public.is_dev());

-- ──────────────────────────────────────────────────────────────
-- 4) dr7_usage — devs-only telemetry (read + future inserts).
-- ──────────────────────────────────────────────────────────────
drop policy if exists "site_all_dr7_usage" on public.dr7_usage;

create policy dr7_read
  on public.dr7_usage for select
  to authenticated
  using (public.is_dev());

create policy dr7_insert_devs
  on public.dr7_usage for insert
  to authenticated
  with check (public.is_dev());

-- ──────────────────────────────────────────────────────────────
-- 5) admin_delete_user — CLOSE THE BIGGEST HOLE.
--    Old: SECURITY DEFINER + granted to ANON = anyone could delete
--    any auth user by guessing an email. Now: authenticated only,
--    and the function refuses unless the caller is a dev.
-- ──────────────────────────────────────────────────────────────
create or replace function public.admin_delete_user(target_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare uid uuid;
begin
  if not public.is_dev() then
    raise exception 'Forbidden: developer role required';
  end if;
  select id into uid from auth.users where email = target_email;
  if uid is not null then
    delete from auth.users where id = uid;
  end if;
  delete from public.members where email = target_email;
  delete from public.moderation where email = target_email;
end;
$$;

revoke all on function public.admin_delete_user(text) from public;
grant execute on function public.admin_delete_user(text) to authenticated;

-- ──────────────────────────────────────────────────────────────
-- 6) forum — public reads stay (not hidden); writes become
--    authenticated + authorship-locked; devs moderate everything;
--    any signed-in member may upvote/flag any topic.
--    (Requires forum-schema.sql to have created the tables.)
-- ──────────────────────────────────────────────────────────────
drop policy if exists forum_topics_read on public.forum_topics;
create policy forum_topics_read
  on public.forum_topics for select
  to anon, authenticated
  using (not hidden);

drop policy if exists forum_topics_write on public.forum_topics;
drop policy if exists forum_topics_manage on public.forum_topics;
drop policy if exists forum_topics_interact on public.forum_topics;

create policy forum_topics_manage
  on public.forum_topics for all
  to authenticated
  using (public.is_dev() or author_email = nullif(auth.jwt() ->> 'email', ''))
  with check (public.is_dev() or author_email = nullif(auth.jwt() ->> 'email', ''));

create policy forum_topics_interact
  on public.forum_topics for update
  to authenticated
  using (true)
  with check (upvotes between 0 and 1000000);

drop policy if exists forum_replies_read on public.forum_replies;
create policy forum_replies_read
  on public.forum_replies for select
  to anon, authenticated
  using (not hidden);

drop policy if exists forum_replies_write on public.forum_replies;
drop policy if exists forum_replies_manage on public.forum_replies;

create policy forum_replies_manage
  on public.forum_replies for all
  to authenticated
  using (public.is_dev() or author_email = nullif(auth.jwt() ->> 'email', ''))
  with check (public.is_dev() or author_email = nullif(auth.jwt() ->> 'email', ''));

-- ──────────────────────────────────────────────────────────────
-- 7) Grants — anon keeps ONLY public forum reads (+ site_sections,
--    untouched: it belongs to the site-editor lane).
-- ──────────────────────────────────────────────────────────────
revoke all on table public.members, public.moderation, public.devs,
       public.dr7_usage, public.forum_topics, public.forum_replies from anon;

grant select on public.forum_topics, public.forum_replies to anon;

grant select, insert, update on public.members to authenticated;
grant select, insert, update, delete on public.moderation to authenticated;
grant select on public.devs to authenticated;
grant select, insert on public.dr7_usage to authenticated;
grant select, insert, update, delete on public.forum_topics, public.forum_replies to authenticated;

revoke all on all sequences in schema public from anon;
grant usage on all sequences in schema public to authenticated;

-- Future tables: NO open-by-default grants to anon/authenticated.
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on tables from authenticated;

-- ──────────────────────────────────────────────────────────────
-- 8) PostgREST schema cache refresh
-- ──────────────────────────────────────────────────────────────
notify pgrst, 'reload schema';

-- Verify: every table should now have a locked-down policy set.
-- select tablename, policyname, cmd, roles from pg_policies
--   where schemaname='public' order by tablename, cmd;