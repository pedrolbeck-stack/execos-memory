
-- =========================================================
-- ENUMS
-- =========================================================
create type public.app_role as enum ('admin', 'member');
create type public.workspace_role as enum ('owner', 'admin', 'member', 'viewer');
create type public.project_status as enum ('active', 'on_hold', 'archived');
create type public.project_health as enum ('on_track', 'at_risk', 'off_track');
create type public.source_kind as enum ('file', 'transcript', 'audio', 'video', 'note', 'url');
create type public.source_status as enum ('uploaded', 'processing', 'processed', 'failed');
create type public.memory_type as enum ('decision', 'risk', 'action', 'question', 'stakeholder', 'summary');
create type public.priority_level as enum ('low', 'med', 'high');
create type public.action_status as enum ('open', 'in_progress', 'done', 'blocked');
create type public.artifact_kind as enum ('exec_brief', 'meeting_summary', 'prd', 'sop', 'project_plan', 'followup_email', 'meeting_prep');
create type public.chat_role as enum ('user', 'assistant', 'system');

-- =========================================================
-- updated_at helper
-- =========================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- =========================================================
-- PROFILES
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  title text,
  timezone text default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

create policy "profiles_select_own_or_workspace" on public.profiles for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- =========================================================
-- USER ROLES (global app roles, separate table)
-- =========================================================
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "user_roles_select_own" on public.user_roles for select to authenticated using (user_id = auth.uid());

-- =========================================================
-- WORKSPACES
-- =========================================================
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan text not null default 'pro',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.workspaces enable row level security;
create trigger workspaces_updated_at before update on public.workspaces for each row execute function public.set_updated_at();

create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.workspace_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);
alter table public.workspace_members enable row level security;
create index on public.workspace_members (user_id);
create index on public.workspace_members (workspace_id);

-- Security definer membership helper (avoids recursive RLS)
create or replace function public.is_workspace_member(_user_id uuid, _workspace_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workspace_members
    where user_id = _user_id and workspace_id = _workspace_id
  )
$$;

create policy "workspaces_select_member" on public.workspaces for select to authenticated
  using (public.is_workspace_member(auth.uid(), id));
create policy "workspaces_insert_any_auth" on public.workspaces for insert to authenticated with check (true);
create policy "workspaces_update_member" on public.workspaces for update to authenticated
  using (public.is_workspace_member(auth.uid(), id));

create policy "wm_select_own" on public.workspace_members for select to authenticated
  using (user_id = auth.uid() or public.is_workspace_member(auth.uid(), workspace_id));
create policy "wm_insert_self" on public.workspace_members for insert to authenticated
  with check (user_id = auth.uid());
create policy "wm_delete_self" on public.workspace_members for delete to authenticated
  using (user_id = auth.uid());

-- =========================================================
-- PROJECTS
-- =========================================================
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  client text,
  status public.project_status not null default 'active',
  health public.project_health not null default 'on_track',
  owner_name text,
  summary text,
  progress int not null default 0 check (progress between 0 and 100),
  due_date date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.projects enable row level security;
create index on public.projects (workspace_id);
create trigger projects_updated_at before update on public.projects for each row execute function public.set_updated_at();

create or replace function public.project_workspace(_project_id uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select workspace_id from public.projects where id = _project_id
$$;

create policy "projects_select_member" on public.projects for select to authenticated
  using (public.is_workspace_member(auth.uid(), workspace_id));
create policy "projects_insert_member" on public.projects for insert to authenticated
  with check (public.is_workspace_member(auth.uid(), workspace_id));
create policy "projects_update_member" on public.projects for update to authenticated
  using (public.is_workspace_member(auth.uid(), workspace_id));
create policy "projects_delete_member" on public.projects for delete to authenticated
  using (public.is_workspace_member(auth.uid(), workspace_id));

-- =========================================================
-- Generic project-scoped RLS pattern macro (manual policies per table)
-- =========================================================

-- SOURCES
create table public.sources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  kind public.source_kind not null default 'file',
  title text not null,
  status public.source_status not null default 'uploaded',
  storage_path text,
  mime text,
  bytes bigint,
  uploaded_by uuid references auth.users(id) on delete set null,
  uploader_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.sources enable row level security;
create index on public.sources (project_id);
create trigger sources_updated_at before update on public.sources for each row execute function public.set_updated_at();
create policy "sources_select" on public.sources for select to authenticated
  using (public.is_workspace_member(auth.uid(), public.project_workspace(project_id)));
create policy "sources_insert" on public.sources for insert to authenticated
  with check (public.is_workspace_member(auth.uid(), public.project_workspace(project_id)));
create policy "sources_update" on public.sources for update to authenticated
  using (public.is_workspace_member(auth.uid(), public.project_workspace(project_id)));
create policy "sources_delete" on public.sources for delete to authenticated
  using (public.is_workspace_member(auth.uid(), public.project_workspace(project_id)));

-- SOURCE CHUNKS
create table public.source_chunks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  idx int not null,
  content text not null,
  token_count int,
  created_at timestamptz not null default now()
);
alter table public.source_chunks enable row level security;
create index on public.source_chunks (source_id);
create policy "chunks_select" on public.source_chunks for select to authenticated
  using (exists (
    select 1 from public.sources s
    where s.id = source_id and public.is_workspace_member(auth.uid(), public.project_workspace(s.project_id))
  ));
create policy "chunks_insert" on public.source_chunks for insert to authenticated
  with check (exists (
    select 1 from public.sources s
    where s.id = source_id and public.is_workspace_member(auth.uid(), public.project_workspace(s.project_id))
  ));

-- MEETINGS
create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  occurred_at timestamptz,
  source_id uuid references public.sources(id) on delete set null,
  attendees jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.meetings enable row level security;
create index on public.meetings (project_id);
create policy "meetings_select" on public.meetings for select to authenticated
  using (public.is_workspace_member(auth.uid(), public.project_workspace(project_id)));
create policy "meetings_cud" on public.meetings for all to authenticated
  using (public.is_workspace_member(auth.uid(), public.project_workspace(project_id)))
  with check (public.is_workspace_member(auth.uid(), public.project_workspace(project_id)));

-- MEMORY ITEMS
create table public.memory_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  type public.memory_type not null,
  title text not null,
  body text,
  priority public.priority_level,
  owner_name text,
  source_label text,
  source_id uuid references public.sources(id) on delete set null,
  occurred_on date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.memory_items enable row level security;
create index on public.memory_items (project_id, type);
create trigger memory_items_updated_at before update on public.memory_items for each row execute function public.set_updated_at();
create policy "memory_select" on public.memory_items for select to authenticated
  using (public.is_workspace_member(auth.uid(), public.project_workspace(project_id)));
create policy "memory_cud" on public.memory_items for all to authenticated
  using (public.is_workspace_member(auth.uid(), public.project_workspace(project_id)))
  with check (public.is_workspace_member(auth.uid(), public.project_workspace(project_id)));

-- ACTION ITEMS
create table public.action_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  owner_name text,
  due_date date,
  status public.action_status not null default 'open',
  priority public.priority_level not null default 'med',
  source_label text,
  source_id uuid references public.sources(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.action_items enable row level security;
create index on public.action_items (project_id, status);
create trigger action_items_updated_at before update on public.action_items for each row execute function public.set_updated_at();
create policy "actions_select" on public.action_items for select to authenticated
  using (public.is_workspace_member(auth.uid(), public.project_workspace(project_id)));
create policy "actions_cud" on public.action_items for all to authenticated
  using (public.is_workspace_member(auth.uid(), public.project_workspace(project_id)))
  with check (public.is_workspace_member(auth.uid(), public.project_workspace(project_id)));

-- ARTIFACTS
create table public.artifacts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  kind public.artifact_kind not null,
  title text not null,
  body text,
  created_by uuid references auth.users(id) on delete set null,
  creator_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.artifacts enable row level security;
create index on public.artifacts (project_id);
create trigger artifacts_updated_at before update on public.artifacts for each row execute function public.set_updated_at();
create policy "artifacts_select" on public.artifacts for select to authenticated
  using (public.is_workspace_member(auth.uid(), public.project_workspace(project_id)));
create policy "artifacts_cud" on public.artifacts for all to authenticated
  using (public.is_workspace_member(auth.uid(), public.project_workspace(project_id)))
  with check (public.is_workspace_member(auth.uid(), public.project_workspace(project_id)));

-- CHAT
create table public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null default 'New conversation',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.chat_threads enable row level security;
create index on public.chat_threads (project_id);
create policy "threads_select" on public.chat_threads for select to authenticated
  using (public.is_workspace_member(auth.uid(), public.project_workspace(project_id)));
create policy "threads_cud" on public.chat_threads for all to authenticated
  using (public.is_workspace_member(auth.uid(), public.project_workspace(project_id)))
  with check (public.is_workspace_member(auth.uid(), public.project_workspace(project_id)));

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  role public.chat_role not null,
  content text not null,
  citations jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.chat_messages enable row level security;
create index on public.chat_messages (thread_id);
create policy "messages_select" on public.chat_messages for select to authenticated
  using (exists (
    select 1 from public.chat_threads t
    where t.id = thread_id and public.is_workspace_member(auth.uid(), public.project_workspace(t.project_id))
  ));
create policy "messages_insert" on public.chat_messages for insert to authenticated
  with check (exists (
    select 1 from public.chat_threads t
    where t.id = thread_id and public.is_workspace_member(auth.uid(), public.project_workspace(t.project_id))
  ));

-- =========================================================
-- DEMO WORKSPACE (fixed UUID so new signups get added to it)
-- =========================================================
insert into public.workspaces (id, name, slug, plan) values
  ('00000000-0000-0000-0000-000000000001', 'Apex Operations', 'apex-ops', 'pro');

-- Demo projects (no owner; visible to all members of the demo workspace)
insert into public.projects (id, workspace_id, name, client, status, health, owner_name, summary, progress) values
  ('11111111-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Project Atlas — Series B Raise','Internal · Finance','active','on_track','M. Chen','Coordinate Series B fundraise: data room readiness, investor narrative alignment, board approval.',68),
  ('11111111-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','Northwind ERP Migration','Northwind Logistics','active','at_risk','R. Patel','Cutover from legacy SAP to Oracle Fusion across 14 warehouses. Phase 2 pilot underway in EMEA.',41),
  ('11111111-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','Helix Product Launch','Acme BioTech','active','on_track','S. Okafor','Q3 GTM launch of Helix diagnostic platform; regulatory + commercial workstreams.',54),
  ('11111111-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000001','Orion Restructure','Orion Industries','active','off_track','J. Werner','Org redesign across 3 BUs, severance plan, transition services agreement with buyer.',22),
  ('11111111-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000001','Kestrel Board Prep Q2','Internal · CEO Office','active','on_track','M. Chen','Q2 board materials, narrative, financial review, strategic priorities update.',80),
  ('11111111-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000001','Vega EU Expansion','Internal · Corp Dev','on_hold','at_risk','L. Bianchi','Market entry analysis for DACH region; partner shortlist and entity setup planning.',30);

-- Seed sources (Northwind heavy)
insert into public.sources (project_id, kind, title, status, bytes, uploader_name) values
  ('11111111-0000-0000-0000-000000000002','transcript','EMEA Steering — 2026-05-24.vtt','processed',319488,'R. Patel'),
  ('11111111-0000-0000-0000-000000000002','file','Cutover Plan v4.docx','processed',865280,'R. Patel'),
  ('11111111-0000-0000-0000-000000000002','audio','Sponsor Call 5-22.mp3','processing',18862080,'R. Patel'),
  ('11111111-0000-0000-0000-000000000002','file','Risk Register.xlsx','processed',124928,'M. Chen'),
  ('11111111-0000-0000-0000-000000000002','video','Warehouse Walkthrough.mp4','uploaded',421888000,'R. Patel'),
  ('11111111-0000-0000-0000-000000000002','file','Vendor SOW redline.pdf','failed',1843200,'J. Werner'),
  ('11111111-0000-0000-0000-000000000001','note','Investor Q&A draft.md','processed',14336,'M. Chen'),
  ('11111111-0000-0000-0000-000000000001','transcript','Board meeting — 5-21.vtt','processed',419840,'M. Chen'),
  ('11111111-0000-0000-0000-000000000003','file','FDA correspondence pack.pdf','processed',2200000,'S. Okafor'),
  ('11111111-0000-0000-0000-000000000005','file','Q2 Board deck v2.pptx','processed',4800000,'M. Chen');

-- Memory items (Northwind)
insert into public.memory_items (project_id, type, title, body, priority, owner_name, source_label, occurred_on) values
  ('11111111-0000-0000-0000-000000000002','decision','Defer APAC cutover to Q4','Steering committee approved moving APAC go-live from Sep 15 to Nov 3 due to integration gaps.',null,'R. Patel','EMEA Steering — 5/24','2026-05-24'),
  ('11111111-0000-0000-0000-000000000002','risk','Master data quality below threshold','Vendor master dedupe at 78%; target 95% before cutover. May block invoice processing.','high',null,'Data Quality Audit','2026-05-22'),
  ('11111111-0000-0000-0000-000000000002','risk','Sponsor capacity constrained in June','Executive sponsor on extended leave 6/8–6/22, reducing decision velocity.','med',null,'Sponsor Call 5-22','2026-05-22'),
  ('11111111-0000-0000-0000-000000000002','action','Finalize cutover window with APAC ops','Need Tokyo + Singapore confirmation by 5/30.','high','K. Tanaka','EMEA Steering — 5/24','2026-05-24'),
  ('11111111-0000-0000-0000-000000000002','question','Will Finance accept parallel run of 4 weeks?','CFO requested justification; current plan is 6 weeks.',null,null,'Steering Notes','2026-05-24'),
  ('11111111-0000-0000-0000-000000000002','question','What is fallback if Oracle environment slips?','No documented rollback path beyond Phase 1.',null,null,'Risk Register','2026-05-20'),
  ('11111111-0000-0000-0000-000000000002','stakeholder','K. Tanaka — APAC Ops Lead','Decision authority for APAC cutover scheduling. Prefers async written updates.',null,null,'Stakeholder Map','2026-05-10'),
  ('11111111-0000-0000-0000-000000000002','stakeholder','P. Müller — Works Council DE','Required sign-off before any role changes in DE warehouses.',null,null,'Stakeholder Map','2026-05-10'),
  ('11111111-0000-0000-0000-000000000002','decision','Adopt phased license model','Approved 60/40 split between Phase 1 and Phase 2 to defer $1.2M.',null,null,'Cutover Plan v4','2026-05-23'),
  ('11111111-0000-0000-0000-000000000001','decision','Lead investor terms accepted at $14 pre','Term sheet countersigned; closing target Aug 30.',null,'M. Chen','Board meeting — 5-21','2026-05-21'),
  ('11111111-0000-0000-0000-000000000001','risk','Diligence pack still missing 2025 cohort retention','Lead investor flagged; needed by 5/30.','high',null,'Investor Q&A draft','2026-05-23'),
  ('11111111-0000-0000-0000-000000000003','decision','Launch sequence: EU first, US Q4','Regulatory readiness drives geo sequence.',null,'S. Okafor','Launch SteerCo','2026-05-19');

-- Action items
insert into public.action_items (project_id, title, owner_name, due_date, status, priority, source_label) values
  ('11111111-0000-0000-0000-000000000002','Finalize APAC cutover window','K. Tanaka','2026-05-30','in_progress','high','EMEA Steering'),
  ('11111111-0000-0000-0000-000000000002','Dedupe vendor master to 95%','D. Silva','2026-06-07','open','high','Data Quality Audit'),
  ('11111111-0000-0000-0000-000000000002','Draft fallback rollback plan','R. Patel','2026-06-03','open','high','Risk Register'),
  ('11111111-0000-0000-0000-000000000002','Schedule Works Council session DE','P. Müller','2026-05-29','blocked','med','Stakeholder Map'),
  ('11111111-0000-0000-0000-000000000002','Send sponsor brief for June absence','M. Chen','2026-05-28','open','med','Sponsor Call'),
  ('11111111-0000-0000-0000-000000000002','Validate parallel run duration with CFO','M. Chen','2026-06-01','in_progress','med','Steering Notes'),
  ('11111111-0000-0000-0000-000000000002','Confirm training delivery model APAC','K. Tanaka','2026-06-10','open','low','Cutover Plan'),
  ('11111111-0000-0000-0000-000000000002','Close out Phase 1 lessons learned','R. Patel','2026-05-26','done','low','Internal'),
  ('11111111-0000-0000-0000-000000000001','Send 2025 retention cohort to lead investor','M. Chen','2026-05-30','in_progress','high','Investor Q&A draft'),
  ('11111111-0000-0000-0000-000000000003','Confirm EU notified-body slot','S. Okafor','2026-06-05','open','high','Launch SteerCo');

-- Artifacts
insert into public.artifacts (project_id, kind, title, body, creator_name) values
  ('11111111-0000-0000-0000-000000000002','exec_brief','Northwind ERP — Week of May 19','Status: At risk. Key wins this week: phased license model approved, APAC cutover deferral aligned. Key risks: data quality, sponsor capacity. Asks: CFO sign-off on 6-week parallel run.','M. Chen'),
  ('11111111-0000-0000-0000-000000000002','meeting_summary','EMEA Steering Committee 5/24','Decisions: APAC cutover deferred to Q4; phased license model approved. Actions: 4 new items assigned. Open questions: parallel run duration, rollback path.','AI'),
  ('11111111-0000-0000-0000-000000000002','project_plan','Cutover Plan v4 — synthesized','Phase 1: EMEA cutover Aug 12. Phase 2: NA cutover Sep 28. Phase 3: APAC cutover Nov 3.','AI'),
  ('11111111-0000-0000-0000-000000000002','followup_email','Re: APAC cutover decision — to K. Tanaka','Hi Keiko — confirming steering committee approved deferring APAC go-live to Nov 3. Next step is your confirmation of the cutover window with Tokyo and Singapore ops by 5/30.','M. Chen'),
  ('11111111-0000-0000-0000-000000000001','exec_brief','Atlas Series B — Investor update','On track. Term sheet countersigned at $14 pre. Closing target Aug 30. Diligence 90% complete; one cohort dataset outstanding.','M. Chen');

-- =========================================================
-- Auto-create profile + add to demo workspace on signup
-- =========================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));

  insert into public.user_roles (user_id, role) values (new.id, 'member');

  insert into public.workspace_members (workspace_id, user_id, role)
  values ('00000000-0000-0000-0000-000000000001', new.id, 'owner');

  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- STORAGE BUCKET
-- =========================================================
insert into storage.buckets (id, name, public) values ('project-sources', 'project-sources', false);

create policy "project_sources_read" on storage.objects for select to authenticated
  using (
    bucket_id = 'project-sources'
    and exists (
      select 1 from public.projects p
      where p.id::text = split_part(name, '/', 2)
        and public.is_workspace_member(auth.uid(), p.workspace_id)
    )
  );

create policy "project_sources_write" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'project-sources'
    and exists (
      select 1 from public.projects p
      where p.id::text = split_part(name, '/', 2)
        and public.is_workspace_member(auth.uid(), p.workspace_id)
    )
  );

create policy "project_sources_delete" on storage.objects for delete to authenticated
  using (
    bucket_id = 'project-sources'
    and exists (
      select 1 from public.projects p
      where p.id::text = split_part(name, '/', 2)
        and public.is_workspace_member(auth.uid(), p.workspace_id)
    )
  );
