-- ═══════════════════════════════════════════════════════════════════════════
--  classroom-v2.sql — ADDITIVE ONLY. Safe to run on a database that already
--  has classroom-schema.sql applied, and safe to run more than once.
--
--  Deliberately NOT part of classroom-schema.sql: that file drops and rebuilds
--  every table, so re-running it to pick up a change would destroy any
--  classrooms, members, assignments and questions already created. This file
--  only ever adds columns.
--
--  Why: the questions table stores one language. The site is bilingual
--  everywhere else, and the seed pool pulled from the site's own banks is
--  bilingual, so a teacher would otherwise create English questions and see
--  them in 中文 mode too.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.questions add column if not exists prompt_zh     text;
alter table public.questions add column if not exists choices_zh   jsonb not null default '[]'::jsonb;
alter table public.questions add column if not exists explanation_zh text;

-- Backfill nothing: existing rows keep whatever language they were written in,
-- and the UI falls back to the English column when a Chinese one is empty.

-- Index for the classroom quiz picker: published questions for one classroom.
create index if not exists questions_classroom_approved
  on public.questions (classroom_id, approved);

-- Sessions need to be findable by classroom without scanning the table.
create index if not exists live_sessions_classroom
  on public.live_sessions (classroom_id, state);
