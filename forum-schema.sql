-- ═══════════════════════════════════════════════════════════════════════════
-- Vitalité — forum (forum_topics + forum_replies)
-- Backing tables for the community forum on social.html (forum.js).
--
-- Run this in the Supabase dashboard -> SQL Editor, top to bottom.
-- The NOTIFY at the end clears the stale PostgREST schema cache that currently
-- makes the REST endpoints 404 (same fix as site_sections).
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.forum_topics (
  id            bigint generated always as identity primary key,
  category      text        not null default 'general',
  title         text        not null,
  body          text        not null default '',
  author_email  text        not null,
  author_name   text,
  upvotes       integer     not null default 0,
  flagged       boolean     not null default false,
  hidden        boolean     not null default false,
  created_at    timestamptz not null default now()
);

comment on table  public.forum_topics              is 'Forum threads from the Vitalité community page.';
comment on column public.forum_topics.category     is 'general | injury | nutrition | training | study — matches CATS in forum.js';
comment on column public.forum_topics.author_email is 'Lowercase member email (sm_user) used to author the topic.';
comment on column public.forum_topics.upvotes      is 'Incremented by forum.js upvote guard (one per device via localStorage).';
comment on column public.forum_topics.flagged      is 'Set by the Report button; surfaces in the Developer Console moderation card.';
comment on column public.forum_topics.hidden       is 'true = hidden by a moderator; the public list filters it out.';

create table if not exists public.forum_replies (
  id            bigint generated always as identity primary key,
  topic_id      bigint      not null references public.forum_topics (id) on delete cascade,
  author_email  text        not null,
  author_name   text,
  body          text        not null default '',
  flagged       boolean     not null default false,
  hidden        boolean     not null default false,
  created_at    timestamptz not null default now()
);

comment on table public.forum_replies is 'Replies to forum topics. Cascades on topic delete.';

create index if not exists forum_replies_topic_idx
  on public.forum_replies (topic_id, created_at);

create index if not exists forum_replies_mod_idx
  on public.forum_replies (flagged) where flagged and not hidden;

create index if not exists forum_topics_mod_idx
  on public.forum_topics (flagged) where flagged and not hidden;

create index if not exists forum_topics_live_idx
  on public.forum_topics (created_at desc) where not hidden;

-- ── Row Level Security ────────────────────────────────────────────────────
-- Visitors read the public forum anonymously; posting is done with the anon
-- key today (same trade-off as site_sections) — the console authenticates the
-- author only via sm_user metadata. Tighten once a real Supabase session
-- exists on the site.
alter table public.forum_topics  enable row level security;
alter table public.forum_replies enable row level security;

drop policy if exists forum_topics_read on public.forum_topics;
create policy forum_topics_read
  on public.forum_topics
  for select
  to anon, authenticated
  using (not hidden);

drop policy if exists forum_topics_write on public.forum_topics;
create policy forum_topics_write
  on public.forum_topics
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists forum_replies_read on public.forum_replies;
create policy forum_replies_read
  on public.forum_replies
  for select
  to anon, authenticated
  using (not hidden);

drop policy if exists forum_replies_write on public.forum_replies;
create policy forum_replies_write
  on public.forum_replies
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- ── Grants ────────────────────────────────────────────────────────────────
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.forum_topics  to anon, authenticated;
grant select, insert, update, delete on public.forum_replies to anon, authenticated;
grant usage on all sequences in schema public to anon, authenticated;

-- ── Clear the stale PostgREST schema cache ────────────────────────────────
notify pgrst, 'reload schema';

-- Verify (should return 2 rows):
-- select table_name from information_schema.tables
--   where table_schema='public' and table_name in ('forum_topics','forum_replies');