-- ═══════════════════════════════════════════════════════════════════════════
-- Vitalité — Q&A widget messages (qna_messages)
-- Backing table for the bottom-left Q&A panel (qna-widget.js):
--   * FAQ answers are static (in the widget); this table stores the
--     merged "Contact / Report" submissions (kind=message|report).
--   * The Developer Console (admin.html) reads them in the 📥 Inbox card.
--
-- Run this in the Supabase dashboard -> SQL Editor, top to bottom.
-- The NOTIFY at the end clears the stale PostgREST schema cache.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.qna_messages (
  id            bigint generated always as identity primary key,
  kind          text        not null default 'message',      -- message | report | question
  category      text,                                        -- e.g. 'Question' | 'Broken link / page' | ...
  name          text,
  email         text,
  message       text        not null,
  reported_item text,                                        -- what was reported (report kind)
  page          text,                                        -- page the visitor was on
  read          boolean     not null default false,          -- dev inbox read flag
  created_at    timestamptz not null default now()
);

comment on table  public.qna_messages is 'Messages/reports from the bottom-left Q&A widget. Read by devs in the Developer Console inbox.';
comment on column public.qna_messages.kind          is 'message | report | question — which tab of the widget submitted it.';
comment on column public.qna_messages.category      is 'Contact type or report reason, e.g. Question / Bug report / Broken link.';
comment on column public.qna_messages.reported_item is 'For reports: what was reported (reason chip selected).';
comment on column public.qna_messages.page          is 'The page the visitor was on when they submitted (basename).';
comment on column public.qna_messages.read          is 'false until a dev opens the message in the inbox.';

create index if not exists qna_messages_inbox_idx
  on public.qna_messages (read, created_at desc);

-- ── Row Level Security ────────────────────────────────────────────────────
-- Same model as the forum: anon/authenticated can insert and read. The
-- Developer Console is gated at the UI layer (auth-gate.js + DEV_EMAILS),
-- matching the site's existing architecture. Visitors never see the table
-- directly — only via the widget, which only inserts.
alter table public.qna_messages enable row level security;

drop policy if exists qna_messages_read on public.qna_messages;
create policy qna_messages_read
  on public.qna_messages
  for select
  to anon, authenticated
  using (true);

drop policy if exists qna_messages_write on public.qna_messages;
create policy qna_messages_write
  on public.qna_messages
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- ── Grants ────────────────────────────────────────────────────────────────
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.qna_messages to anon, authenticated;
grant usage on all sequences in schema public to anon, authenticated;

-- ── Clear the stale PostgREST schema cache ────────────────────────────────
notify pgrst, 'reload schema';

-- Verify (should return 1 row):
-- select table_name from information_schema.tables
--   where table_schema='public' and table_name='qna_messages';