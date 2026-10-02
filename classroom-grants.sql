-- ═══════════════════════════════════════════════════════════════════════
-- classroom-grants.sql — fix "permission denied for table classrooms"
-- ═══════════════════════════════════════════════════════════════════════
-- WHY YOU NEED THIS
--   classroom-schema.sql creates the tables, enables RLS and writes sensible
--   policies — but it never grants TABLE privileges to the roles PostgREST
--   actually connects as. It only granted EXECUTE on two helper functions.
--   The result is that every read and every write fails with exactly:
--       {"code":"42501","message":"permission denied for table classrooms",
--        "hint":"... GRANT SELECT ON public.classrooms TO anon; ..."}
--   Verified against the live database: the tables EXIST (there is no
--   "relation does not exist"), so re-running the schema is not the fix.
--
--   *** DO NOT RE-RUN classroom-schema.sql TO FIX THIS. ***
--   That file starts with `drop table if exists ... cascade` for all nine
--   classroom tables, so running it would DELETE every real classroom, its
--   roster, its assignments, its question bank and its live-quiz history.
--   This file only grants privileges. It drops nothing.
--
-- HOW TO USE
--   Supabase dashboard -> SQL Editor -> New query -> paste -> Run.
--   Safe to run more than once; every statement is idempotent.
--
-- WHO GETS WHAT
--   authenticated  the signed-in roles. Teachers and students both sign in,
--                  because a classroom is tied to real accounts so a teacher
--                  sees only their own students.
--   anon           deliberately NOTHING. Nothing in Classroom works signed
--                  out, so granting the anonymous role read access would only
--                  widen the surface for no benefit.
--
-- RLS STILL APPLIES
--   These grants only let a request REACH the table. Every row is then judged
--   by the policies already in classroom-schema.sql, so a teacher still cannot
--   read another teacher's classroom.
-- ═══════════════════════════════════════════════════════════════════════

-- ── 1. table privileges ──────────────────────────────────────────────────
grant select, insert, update, delete on table
  public.classrooms,
  public.classroom_members,
  public.class_messages,
  public.assignments,
  public.questions,
  public.attempts,
  public.progress_events,
  public.live_sessions,
  public.live_answers
to authenticated;

-- ── 2. identity sequences ────────────────────────────────────────────────
-- progress_events and live_answers use `generated always as identity`, so
-- Postgres needs USAGE on the sequence to hand out an id on INSERT. Without
-- this you swap one error for another: "permission denied for sequence".
do $$
declare t text;
begin
  foreach t in array array[
    'progress_events_id_seq','live_answers_id_seq'
  ] loop
    begin
      execute format('grant usage, select on sequence public.%I to authenticated', t);
    exception when others then
      -- sequence may not exist on a project created from an older schema
      raise notice 'skipped sequence % (%)', t, sqlerrm;
    end;
  end loop;
end $$;

-- ── 3. the helper functions the RLS policies call ────────────────────────
-- Already granted by the schema, repeated so this file stands on its own.
grant execute on function public.is_teacher(uuid) to authenticated;
grant execute on function public.in_classroom(uuid) to authenticated;

-- ── 4. confirm what landed ───────────────────────────────────────────────
-- Every row below should read "authenticated". If any says "anon" instead,
-- something granted to the wrong role earlier and this needs a look.
select table_name, grantee, string_agg(privilege_type, ', ' order by privilege_type) as privileges
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in (
    'classrooms','classroom_members','class_messages','assignments',
    'questions','attempts','progress_events','live_sessions','live_answers'
  )
  and grantee = 'authenticated'
group by table_name, grantee
order by table_name;
