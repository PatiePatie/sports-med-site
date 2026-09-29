-- ═══════════════════════════════════════════════════════════════════════════
--  Vitalité classroom mode  ·  Supabase schema, strict RLS and realtime
--  Paste this whole file into the Supabase SQL Editor and run it once.
--
--  It is written to be safe to run more than once: every object is dropped
--  before it is created, so re-running rebuilds rather than failing.
--
--  WHY THIS IS STRICT WHERE THE REST OF THE SITE IS NOT
--  The existing tables (forum_topics, forum_replies) have permissive policies
--  and trust an author_email string that the client can forge. That is fine for
--  a public forum. It is not fine for a teacher's view of their students'
--  reading and quiz data, so every table here is gated on auth.uid():
--  a student can only ever read and write their OWN rows, and a teacher can
--  only ever read rows for classrooms they actually own.
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────── 0 · cleanup
drop table if exists live_answers    cascade;
drop table if exists live_sessions  cascade;
drop table if exists progress_events cascade;
drop table if exists attempts        cascade;
drop table if exists questions       cascade;
drop table if exists assignments     cascade;
drop table if exists classroom_members cascade;
drop table if exists classrooms      cascade;
drop table if exists class_messages  cascade;


-- ═══════════════════════════════════════════ 1 · a tiny role helper
-- A member is a teacher if they created the classroom, or were promoted.
-- A SECURITY DEFINER function avoids a recursive policy on classroom_members
-- (a policy that reads the table it governs is the classic infinite loop).
create or replace function public.is_teacher(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.classroom_members m
    where m.classroom_id = cid
      and m.user_id = auth.uid()
      and m.role in ('teacher', 'assistant')
  );
$$;

create or replace function public.in_classroom(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.classroom_members m
    where m.classroom_id = cid and m.user_id = auth.uid()
  );
$$;

grant execute on function public.is_teacher(uuid) to authenticated;
grant execute on function public.in_classroom(uuid) to authenticated;


-- ═══════════════════════════════════════════ 2 · classrooms
create table public.classrooms (
  id            uuid primary key default gen_random_uuid(),
  name          text        not null,
  course        text        not null check (course in ('vt', 'ib', 'g10')),
  join_code     text        not null unique,
  owner_id      uuid        not null references auth.users(id) on delete cascade,
  archived      boolean     not null default false,
  created_at    timestamptz not null default now()
);

comment on table public.classrooms is
  'A class. course picks which of the three tracks its progress is measured against.';

-- section scoping: the teacher may restrict a class to part of the course.
create table public.classroom_members (
  classroom_id  uuid not null references public.classrooms(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          text not null default 'student' check (role in ('student','assistant','teacher')),
  display_name  text,
  joined_at     timestamptz not null default now(),
  last_seen_at  timestamptz,
  primary key (classroom_id, user_id)
);

create table public.class_messages (
  id            uuid primary key default gen_random_uuid(),
  classroom_id  uuid not null references public.classrooms(id) on delete cascade,
  author_id     uuid not null references auth.users(id) on delete cascade,
  body          text not null,
  created_at    timestamptz not null default now()
);


-- ═══════════════════════════════════════════ 3 · release schedule
-- One row per released unit, in the order the teacher opened it up.
-- A unit id is the same id progress-tracker.js uses: vt:ch3:0, ib:A.2.1:1, g10:s2:0
create table public.assignments (
  id            uuid primary key default gen_random_uuid(),
  classroom_id  uuid not null references public.classrooms(id) on delete cascade,
  unit_id       text not null,           -- e.g. 'ib:A.2.1:1'; '*' means the whole course
  title         text,
  due_at        timestamptz,
  released      boolean not null default false,
  release_order integer,                 -- null = released immediately
  target_pct    integer check (target_pct between 0 and 100),
  created_at    timestamptz not null default now(),
  unique (classroom_id, unit_id)
);

comment on column public.assignments.unit_id is
  'Matches the unit ids in progress-tracker.js. Use * for the entire course.';


-- ═══════════════════════════════════════════ 4 · questions
-- source: existing = already in the site banks, teacher = hand written,
--         ai = generated, which must be approved before it can be published.
create table public.questions (
  id            uuid primary key default gen_random_uuid(),
  classroom_id  uuid references public.classrooms(id) on delete cascade,  -- null = shared pool
  author_id     uuid references auth.users(id) on delete set null,
  course        text not null check (course in ('vt','ib','g10','any')),
  unit_id       text,
  prompt        text not null,
  choices       jsonb not null default '[]'::jsonb,   -- array of 4 strings
  answer_index  smallint check (answer_index between 0 and 3),
  explanation   text,
  source        text not null default 'teacher' check (source in ('existing','teacher','ai')),
  approved      boolean not null default false,
  created_at    timestamptz not null default now(),
  check (jsonb_array_length(choices) = 4)
);

create table public.attempts (
  id            uuid primary key default gen_random_uuid(),
  classroom_id  uuid not null references public.classrooms(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  question_id   uuid not null references public.questions(id) on delete cascade,
  chosen_index  smallint not null,
  correct       boolean not null,
  answered_at   timestamptz not null default now()
);


-- ═══════════════════════════════════════════ 5 · progress
-- The mirror of sm_progress_v1, per student. One row per unit they have opened.
create table public.progress_events (
  id            bigint generated always as identity primary key,
  classroom_id  uuid not null references public.classrooms(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  course        text not null check (course in ('vt','ib','g10')),
  unit_id       text not null,
  group_id      text,                       -- ch7 / A.2.1 / s3
  depth         real not null default 0,   -- 0..1 how far they scrolled
  dwell_ms      integer not null default 0,
  read          boolean not null default false,
  updated_at    timestamptz not null default now(),
  unique (classroom_id, user_id, unit_id)
);

create index progress_events_lookup
  on public.progress_events (classroom_id, read, course);


-- ═══════════════════════════════════════════ 6 · live sessions (Kahoot)
-- State lives in the database, not in the teacher's tab, so closing the tab or
-- losing connection does not end the session for everyone else.
create table public.live_sessions (
  id            uuid primary key default gen_random_uuid(),
  classroom_id  uuid not null references public.classrooms(id) on delete cascade,
  teacher_id    uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  course        text not null check (course in ('vt','ib','g10')),
  state         text not null default 'lobby'
                check (state in ('lobby','question','lock','reveal','done')),
  current_q     smallint,                   -- index into the question list
  question_ids  uuid[] not null default '{}',
  reveal_at     timestamptz,                -- when the leaderboard unlocks
  started_at    timestamptz,
  created_at    timestamptz not null default now()
);

create table public.live_answers (
  id            bigint generated always as identity primary key,
  session_id    uuid not null references public.live_sessions(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  question_id   uuid not null references public.questions(id) on delete cascade,
  chosen_index  smallint not null,
  ms_taken      integer,                    -- time from question shown to answered
  answered_at   timestamptz not null default now(),
  unique (session_id, user_id, question_id)
);

create index live_answers_session on public.live_answers (session_id);


-- ═══════════════════════════════════════════ 7 · RLS, on everywhere
alter table public.classrooms        enable row level security;
alter table public.classroom_members enable row level security;
alter table public.class_messages    enable row level security;
alter table public.assignments       enable row level security;
alter table public.questions         enable row level security;
alter table public.attempts          enable row level security;
alter table public.progress_events   enable row level security;
alter table public.live_sessions     enable row level security;
alter table public.live_answers      enable row level security;

-- classrooms ------------------------------------------------------------
drop policy if exists classrooms_read on public.classrooms;
create policy classrooms_read on public.classrooms for select
  using (public.in_classroom(id));

drop policy if exists classrooms_create on public.classrooms;
create policy classrooms_create on public.classrooms for insert
  with check (owner_id = auth.uid());

drop policy if exists classrooms_update on public.classrooms;
create policy classrooms_update on public.classrooms for update
  using (public.is_teacher(id))
  with check (public.is_teacher(id));

drop policy if exists classrooms_delete on public.classrooms;
create policy classrooms_delete on public.classrooms for delete
  using (owner_id = auth.uid());

-- members ---------------------------------------------------------------
-- anyone signed in may see the member rows of a classroom they belong to,
-- which is what lets a roster render; but only a teacher can add or remove.
drop policy if exists members_read on public.classroom_members;
create policy members_read on public.classroom_members for select
  using (public.in_classroom(classroom_id));

drop policy if exists members_join on public.classroom_members;
create policy members_join on public.classroom_members for insert
  with check (
    user_id = auth.uid()                                   -- only yourself
    and exists (select 1 from public.classrooms c
                where c.id = classroom_id and c.archived = false)
  );

drop policy if exists members_update on public.classroom_members;
create policy members_update on public.classroom_members for update
  using (public.is_teacher(classroom_id));

drop policy if exists members_delete on public.classroom_members;
create policy members_delete on public.classroom_members for delete
  using (public.is_teacher(classroom_id) or user_id = auth.uid());

-- messages --------------------------------------------------------------
drop policy if exists messages_read on public.class_messages;
create policy messages_read on public.class_messages for select
  using (public.in_classroom(classroom_id));

drop policy if exists messages_write on public.class_messages;
create policy messages_write on public.class_messages for insert
  with check (author_id = auth.uid() and public.is_teacher(classroom_id));

-- assignments -----------------------------------------------------------
drop policy if exists assignments_read on public.assignments;
create policy assignments_read on public.assignments for select
  using (public.in_classroom(classroom_id));

drop policy if exists assignments_write on public.assignments;
create policy assignments_write on public.assignments for insert
  with check (public.is_teacher(classroom_id));

drop policy if exists assignments_update on public.assignments;
create policy assignments_update on public.assignments for update
  using (public.is_teacher(classroom_id));

drop policy if exists assignments_delete on public.assignments;
create policy assignments_delete on public.assignments for delete
  using (public.is_teacher(classroom_id));

-- questions -------------------------------------------------------------
-- the shared pool (classroom_id is null) is readable by any signed in user;
-- a classroom's own drafts are readable only by its teachers.
drop policy if exists questions_read on public.questions;
create policy questions_read on public.questions for select
  using (
    classroom_id is null
    or public.is_teacher(classroom_id)
    or public.in_classroom(classroom_id)
  );

drop policy if exists questions_write on public.questions;
create policy questions_write on public.questions for insert
  with check (author_id = auth.uid() and (classroom_id is null or public.is_teacher(classroom_id)));

drop policy if exists questions_update on public.questions;
create policy questions_update on public.questions for update
  using (author_id = auth.uid() or (classroom_id is not null and public.is_teacher(classroom_id)));

drop policy if exists questions_delete on public.questions;
create policy questions_delete on public.questions for delete
  using (author_id = auth.uid() or (classroom_id is not null and public.is_teacher(classroom_id)));

-- attempts --------------------------------------------------------------
-- a student may only ever write and read their own attempts
drop policy if exists attempts_read on public.attempts;
create policy attempts_read on public.attempts for select
  using (user_id = auth.uid() or public.is_teacher(classroom_id));

drop policy if exists attempts_write on public.attempts;
create policy attempts_write on public.attempts for insert
  with check (user_id = auth.uid() and public.in_classroom(classroom_id));

-- progress --------------------------------------------------------------
drop policy if exists progress_read on public.progress_events;
create policy progress_read on public.progress_events for select
  using (user_id = auth.uid() or public.is_teacher(classroom_id));

drop policy if exists progress_write on public.progress_events;
create policy progress_write on public.progress_events for insert
  with check (user_id = auth.uid() and public.in_classroom(classroom_id));

drop policy if exists progress_update on public.progress_events;
create policy progress_update on public.progress_events for update
  using (user_id = auth.uid() or public.is_teacher(classroom_id))
  with check (user_id = auth.uid() or public.is_teacher(classroom_id));

-- live sessions ---------------------------------------------------------
drop policy if exists live_sessions_read on public.live_sessions;
create policy live_sessions_read on public.live_sessions for select
  using (public.in_classroom(classroom_id));

drop policy if exists live_sessions_create on public.live_sessions;
create policy live_sessions_create on public.live_sessions for insert
  with check (teacher_id = auth.uid() and public.is_teacher(classroom_id));

drop policy if exists live_sessions_update on public.live_sessions;
create policy live_sessions_update on public.live_sessions for update
  using (teacher_id = auth.uid());

drop policy if exists live_sessions_delete on public.live_sessions;
create policy live_sessions_delete on public.live_sessions for delete
  using (teacher_id = auth.uid());

-- live answers ----------------------------------------------------------
-- students write only their own answer; everyone in the room may read the
-- room's answers, which is what the live leaderboard is built from.
drop policy if exists live_answers_read on public.live_answers;
create policy live_answers_read on public.live_answers for select
  using (
    user_id = auth.uid()
    or exists (select 1 from public.live_sessions s
               where s.id = session_id
                 and public.in_classroom(s.classroom_id))
  );

drop policy if exists live_answers_write on public.live_answers;
create policy live_answers_write on public.live_answers for insert
  with check (user_id = auth.uid());


-- ═══════════════════════════════════════════ 8 · realtime
-- Supabase only broadcasts changes on tables that are in the publication, so
-- without this the live quiz would poll instead of updating instantly.
-- The two drop/add lines make re-running the file safe.
do $$
begin
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime'
                   and schemaname = 'public'
                   and tablename = 'live_sessions') then
    alter publication supabase_realtime add table public.live_sessions;
  end if;
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime'
                   and schemaname = 'public'
                   and tablename = 'live_answers') then
    alter publication supabase_realtime add table public.live_answers;
  end if;
end $$;


-- ═══════════════════════════════════════════ 9 · a convenience view
-- The teacher's class table: one row per student with their read count.
-- Defined with security_invoker so RLS still applies to whoever queries it,
-- rather than a definer view quietly bypassing the policies above.
create or replace view public.classroom_roster
with (security_invoker = true) as
select
  m.classroom_id,
  m.user_id,
  m.role,
  m.display_name,
  m.joined_at,
  m.last_seen_at,
  c.course,
  count(p.unit_id) filter (where p.read) as read_units,
  count(p.unit_id) as tracked_units
from public.classroom_members m
join public.classrooms c on c.id = m.classroom_id
left join public.progress_events p
  on p.classroom_id = m.classroom_id and p.user_id = m.user_id
group by m.classroom_id, m.user_id, m.role, m.display_name, m.joined_at,
         m.last_seen_at, c.course;
