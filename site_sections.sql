-- ═══════════════════════════════════════════════════════════════════════════
-- Vitalité — site_sections
-- Backing table for the Developer Console's Site Editor (site-editor.js).
-- Published section overrides are read by every visitor via site-content.js.
--
-- Run this in the Supabase dashboard -> SQL Editor, top to bottom.
-- The NOTIFY at the end clears the stale PostgREST schema cache that currently
-- makes the REST endpoints 404.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.site_sections (
  page        text        not null,
  section     text        not null,
  en_html     text        not null default '',
  zh_html     text        not null default '',
  published   boolean     not null default false,
  version     integer     not null default 1,
  updated_by  text,
  updated_at  timestamptz not null default now(),
  primary key (page, section)
);

comment on table  public.site_sections            is 'Visual Site Editor overrides. One row per (page, section) from the SECTIONS registry in site-editor.js.';
comment on column public.site_sections.page       is 'Registry page key: landing | guide | exam | usabo | toc | social | infirmary';
comment on column public.site_sections.section    is 'DOM id of the <section> being overridden, e.g. hero, ch3, landing-cta';
comment on column public.site_sections.en_html    is 'Sanitized container innerHTML with data-en text baked into leaf nodes';
comment on column public.site_sections.zh_html    is 'Same markup with data-zh text baked into leaf nodes';
comment on column public.site_sections.published  is 'false = row exists but visitors still see the static markup';

create index if not exists site_sections_live_idx
  on public.site_sections (page)
  where published;

-- ── Row Level Security ────────────────────────────────────────────────────
-- Reads are public (visitors are anonymous). Writes come from the console,
-- which today authenticates with the anon key, so anon must be able to write.
-- Tighten this to `to authenticated` plus a devs-table check once the console
-- carries a real Supabase session.
alter table public.site_sections enable row level security;

drop policy if exists site_sections_read_published on public.site_sections;
create policy site_sections_read_published
  on public.site_sections
  for select
  to anon, authenticated
  using (published);

drop policy if exists site_sections_write on public.site_sections;
create policy site_sections_write
  on public.site_sections
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- ── Grants ────────────────────────────────────────────────────────────────
grant usage on schema public to anon, authenticated;
grant select, insert, update on public.site_sections to anon, authenticated;

-- ── Clear the stale PostgREST schema cache ────────────────────────────────
-- Without this the REST endpoint keeps answering 404 / PGRST205 even though
-- the table exists. This is the known-blocked step.
notify pgrst, 'reload schema';

-- Verify (should return the table):
-- select page, section, published, version, updated_by, updated_at
--   from public.site_sections order by page, section;
