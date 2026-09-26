-- ═══════════════════════════════════════════════════════════════════════════
-- Vitalité — AI usage log (ai_usage)
-- One row per call to api.vitaliteplan.com, written from the browser by
-- ai-usage.js. Only sizes and timings are kept, never the question or reply
-- text. The dev console (admin.html → AI usage) reads it; nobody else can.
-- Replaces the old dr7_usage table (Dr7.ai is no longer used; that table
-- was never written to and is left in place, untouched).
--
-- Until this has been run, ai-usage.js keeps a per-browser log instead and
-- the dev console shows that (with a note saying so).
--
-- Run in the Supabase dashboard -> SQL Editor (safe to re-run).
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.ai_usage (
  id          bigint       generated always as identity primary key,
  created_at  timestamptz  not null default now(),
  assistant   text         not null check (assistant in ('vitaxamine','vitaline','checkup','other')),
  model       text         check (char_length(model) <= 80),
  ok          boolean      not null default true,
  status      smallint,
  latency_ms  integer      check (latency_ms between 0 and 600000),
  q_chars     integer      check (q_chars between 0 and 100000),
  r_chars     integer      check (r_chars between 0 and 100000),
  est_in      integer      check (est_in between 0 and 100000),   -- estimated tokens in the question
  est_out     integer      check (est_out between 0 and 100000),  -- estimated tokens in the reply
  lang        text         check (lang in ('en','zh')),
  page        text         check (char_length(page) <= 80),
  rejected    boolean      not null default false,                 -- clinical off-topic gate fired
  rag         boolean      not null default false,
  user_id     uuid         default auth.uid()
);

create index if not exists ai_usage_time_idx on public.ai_usage (created_at desc);

alter table public.ai_usage enable row level security;

-- anyone using the site may add a row (it only carries sizes and timings)
drop policy if exists ai_usage_insert on public.ai_usage;
create policy ai_usage_insert on public.ai_usage
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

-- only devs read it
drop policy if exists ai_usage_select on public.ai_usage;
create policy ai_usage_select on public.ai_usage
  for select to authenticated
  using (is_dev());

grant insert on public.ai_usage to anon, authenticated;
grant select on public.ai_usage to authenticated;
