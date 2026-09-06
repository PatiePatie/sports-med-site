-- ═══════════════════════════════════════════════════════════════════════════
-- Vitalité — Notification replies (qna_replies) + user link on qna_messages
-- Backing tables for the top-right notification bell (notif-bell.js):
--   * qna_messages.user_id — links a message to the signed-in user who sent it.
--   * qna_replies        — dev replies attached to a Q&A message; the owner
--                          sees them in the bell, and the dev console can
--                          write them from the Q&A Inbox card.
--
-- Run this in the Supabase dashboard -> SQL Editor, top to bottom
-- (AFTER qna-widget-schema.sql — it depends on qna_messages).
-- ═══════════════════════════════════════════════════════════════════════════

-- 1) Link Q&A messages to the authenticated user who submitted them.
alter table public.qna_messages
  add column if not exists user_id uuid;

comment on column public.qna_messages.user_id is 'auth.uid() of the signed-in user who sent the message; used to route dev replies back via the notification bell.';

-- 2) Dev replies. One row per reply, attached to a message.
create table if not exists public.qna_replies (
  id         bigint        generated always as identity primary key,
  message_id bigint        not null references public.qna_messages(id) on delete cascade,
  body       text          not null,
  dev_email  text          not null,
  read       boolean       not null default false,   -- false until the owner opens the bell
  created_at timestamptz   not null default now()
);

comment on table  public.qna_replies is 'Dev replies to Q&A messages; surfaced to the message owner via the notification bell.';
comment on column public.qna_replies.read is 'false until the message owner opens the bell and views the reply.';

create index if not exists qna_replies_message_idx on public.qna_replies (message_id);
create index if not exists qna_replies_inbox_idx  on public.qna_replies (read, created_at desc);

-- ── Row Level Security ────────────────────────────────────────────────────
-- Sharper than the rest of the site: the reply is only visible to the
-- message owner (by auth.uid() or by matching the message email) and to
-- devs (is_dev()). Only devs can write a reply. Only owner/dev can flip read.
alter table public.qna_replies enable row level security;

drop policy if exists qna_replies_select on public.qna_replies;
create policy qna_replies_select
  on public.qna_replies
  for select
  to authenticated
  using (
    is_dev()
    or exists (
      select 1 from public.qna_messages m
      where m.id = qna_replies.message_id
        and (
          m.user_id = auth.uid()
          or lower(m.email) = lower(nullif(auth.jwt() ->> 'email', ''))
        )
    )
  );

drop policy if exists qna_replies_insert on public.qna_replies;
create policy qna_replies_insert
  on public.qna_replies
  for insert
  to authenticated
  with check (is_dev());

drop policy if exists qna_replies_update on public.qna_replies;
create policy qna_replies_update
  on public.qna_replies
  for update
  to authenticated
  using (
    is_dev()
    or exists (
      select 1 from public.qna_messages m
      where m.id = qna_replies.message_id
        and (
          m.user_id = auth.uid()
          or lower(m.email) = lower(nullif(auth.jwt() ->> 'email', ''))
        )
    )
  )
  with check (
    is_dev()
    or exists (
      select 1 from public.qna_messages m
      where m.id = qna_replies.message_id
        and (
          m.user_id = auth.uid()
          or lower(m.email) = lower(nullif(auth.jwt() ->> 'email', ''))
        )
    )
  );

-- ── Grants ────────────────────────────────────────────────────────────────
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.qna_replies to authenticated;
grant usage on sequence public.qna_replies_id_seq to authenticated;

-- ── Clear the stale PostgREST schema cache ────────────────────────────────
notify pgrst, 'reload schema';

-- Verify (should return 1 row):
-- select table_name from information_schema.tables
--   where table_schema='public' and table_name='qna_replies';