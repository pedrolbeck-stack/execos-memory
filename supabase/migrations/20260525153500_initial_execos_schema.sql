create schema if not exists extensions;
create schema if not exists private;

create extension if not exists vector with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member', 'viewer')),
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  objective text,
  status text not null default 'planning' check (status in ('planning', 'active', 'at_risk', 'paused', 'completed')),
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null,
  title text not null,
  source_type text not null check (source_type in ('file', 'transcript', 'audio', 'video', 'note', 'link')),
  storage_path text,
  content_text text,
  summary text,
  processing_status text not null default 'uploaded' check (processing_status in ('uploaded', 'processing', 'processed', 'failed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.source_chunks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  token_count integer,
  embedding extensions.vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (source_id, chunk_index)
);

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  source_id uuid references public.sources(id) on delete set null,
  title text not null,
  meeting_date timestamptz,
  attendees jsonb not null default '[]'::jsonb,
  summary text,
  created_at timestamptz not null default now()
);

create table public.memory_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  source_id uuid references public.sources(id) on delete set null,
  memory_type text not null check (memory_type in ('decision', 'action', 'risk', 'dependency', 'open_question', 'stakeholder_context', 'insight', 'milestone')),
  title text not null,
  summary text not null,
  owner_name text,
  due_date date,
  confidence numeric not null default 0.8 check (confidence >= 0 and confidence <= 1),
  source_reference text,
  embedding extensions.vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.action_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  memory_item_id uuid references public.memory_items(id) on delete set null,
  title text not null,
  description text,
  owner_name text,
  due_date date,
  status text not null default 'open' check (status in ('open', 'in_progress', 'blocked', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  created_at timestamptz not null default now()
);

create table public.artifacts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  artifact_type text not null check (artifact_type in ('executive_brief', 'meeting_summary', 'prd', 'sop', 'project_plan', 'follow_up_email', 'meeting_prep')),
  title text not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  title text,
  created_at timestamptz not null default now()
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index workspace_members_workspace_id_idx on public.workspace_members(workspace_id);
create index workspace_members_user_id_idx on public.workspace_members(user_id);
create index projects_workspace_id_idx on public.projects(workspace_id);
create index sources_project_id_idx on public.sources(project_id);
create index source_chunks_project_id_idx on public.source_chunks(project_id);
create index source_chunks_source_id_idx on public.source_chunks(source_id);
create index meetings_project_id_idx on public.meetings(project_id);
create index memory_items_project_id_idx on public.memory_items(project_id);
create index memory_items_memory_type_idx on public.memory_items(memory_type);
create index action_items_project_id_idx on public.action_items(project_id);
create index artifacts_project_id_idx on public.artifacts(project_id);
create index chat_threads_project_id_idx on public.chat_threads(project_id);
create index chat_messages_thread_id_idx on public.chat_messages(thread_id);

create index source_chunks_embedding_hnsw_idx
  on public.source_chunks
  using hnsw (embedding extensions.vector_cosine_ops)
  where embedding is not null;

create index memory_items_embedding_hnsw_idx
  on public.memory_items
  using hnsw (embedding extensions.vector_cosine_ops)
  where embedding is not null;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_set_updated_at
before update on public.projects
for each row execute function private.set_updated_at();

create or replace function private.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = (select auth.uid())
  );
$$;

create or replace function private.has_workspace_role(target_workspace_id uuid, allowed_roles text[])
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = (select auth.uid())
      and wm.role = any(allowed_roles)
  );
$$;

create or replace function private.can_access_project(target_project_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.projects p
    join public.workspace_members wm on wm.workspace_id = p.workspace_id
    where p.id = target_project_id
      and wm.user_id = (select auth.uid())
  );
$$;

create or replace function private.can_edit_project(target_project_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.projects p
    join public.workspace_members wm on wm.workspace_id = p.workspace_id
    where p.id = target_project_id
      and wm.user_id = (select auth.uid())
      and wm.role in ('owner', 'admin', 'member')
  );
$$;

create or replace function private.can_access_chat_thread(target_thread_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.chat_threads ct
    where ct.id = target_thread_id
      and private.can_access_project(ct.project_id)
  );
$$;

grant usage on schema private to authenticated;
grant execute on function private.is_workspace_member(uuid) to authenticated;
grant execute on function private.has_workspace_role(uuid, text[]) to authenticated;
grant execute on function private.can_access_project(uuid) to authenticated;
grant execute on function private.can_edit_project(uuid) to authenticated;
grant execute on function private.can_access_chat_thread(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;
alter table public.sources enable row level security;
alter table public.source_chunks enable row level security;
alter table public.meetings enable row level security;
alter table public.memory_items enable row level security;
alter table public.action_items enable row level security;
alter table public.artifacts enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (id = (select auth.uid()));

create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (id = (select auth.uid()));

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "workspaces_select_members"
on public.workspaces for select
to authenticated
using (owner_id = (select auth.uid()) or private.is_workspace_member(id));

create policy "workspaces_insert_owner"
on public.workspaces for insert
to authenticated
with check (owner_id = (select auth.uid()));

create policy "workspaces_update_admins"
on public.workspaces for update
to authenticated
using (private.has_workspace_role(id, array['owner', 'admin']))
with check (private.has_workspace_role(id, array['owner', 'admin']));

create policy "workspaces_delete_owners"
on public.workspaces for delete
to authenticated
using (private.has_workspace_role(id, array['owner']));

create policy "workspace_members_select_members"
on public.workspace_members for select
to authenticated
using (private.is_workspace_member(workspace_id));

create policy "workspace_members_insert_initial_owner"
on public.workspace_members for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and role = 'owner'
  and exists (
    select 1
    from public.workspaces w
    where w.id = workspace_id
      and w.owner_id = (select auth.uid())
  )
);

create policy "workspace_members_manage_admins"
on public.workspace_members for all
to authenticated
using (private.has_workspace_role(workspace_id, array['owner', 'admin']))
with check (private.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "projects_select_members"
on public.projects for select
to authenticated
using (private.is_workspace_member(workspace_id));

create policy "projects_insert_members"
on public.projects for insert
to authenticated
with check (private.has_workspace_role(workspace_id, array['owner', 'admin', 'member']));

create policy "projects_update_editors"
on public.projects for update
to authenticated
using (
  owner_id = (select auth.uid())
  or private.has_workspace_role(workspace_id, array['owner', 'admin', 'member'])
)
with check (private.has_workspace_role(workspace_id, array['owner', 'admin', 'member']));

create policy "projects_delete_admins"
on public.projects for delete
to authenticated
using (private.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "sources_select_project_members"
on public.sources for select
to authenticated
using (private.can_access_project(project_id));

create policy "sources_insert_project_editors"
on public.sources for insert
to authenticated
with check (private.can_edit_project(project_id));

create policy "sources_update_project_editors"
on public.sources for update
to authenticated
using (private.can_edit_project(project_id))
with check (private.can_edit_project(project_id));

create policy "sources_delete_project_editors"
on public.sources for delete
to authenticated
using (private.can_edit_project(project_id));

create policy "source_chunks_select_project_members"
on public.source_chunks for select
to authenticated
using (private.can_access_project(project_id));

create policy "source_chunks_insert_project_editors"
on public.source_chunks for insert
to authenticated
with check (private.can_edit_project(project_id));

create policy "source_chunks_update_project_editors"
on public.source_chunks for update
to authenticated
using (private.can_edit_project(project_id))
with check (private.can_edit_project(project_id));

create policy "source_chunks_delete_project_editors"
on public.source_chunks for delete
to authenticated
using (private.can_edit_project(project_id));

create policy "meetings_project_access"
on public.meetings for all
to authenticated
using (private.can_access_project(project_id))
with check (private.can_edit_project(project_id));

create policy "memory_items_project_access"
on public.memory_items for all
to authenticated
using (private.can_access_project(project_id))
with check (private.can_edit_project(project_id));

create policy "action_items_project_access"
on public.action_items for all
to authenticated
using (private.can_access_project(project_id))
with check (private.can_edit_project(project_id));

create policy "artifacts_project_access"
on public.artifacts for all
to authenticated
using (private.can_access_project(project_id))
with check (private.can_edit_project(project_id));

create policy "chat_threads_project_access"
on public.chat_threads for all
to authenticated
using (private.can_access_project(project_id))
with check (private.can_edit_project(project_id));

create policy "chat_messages_thread_access"
on public.chat_messages for all
to authenticated
using (private.can_access_chat_thread(thread_id))
with check (private.can_access_chat_thread(thread_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-sources',
  'project-sources',
  false,
  524288000,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'text/vtt',
    'audio/mpeg',
    'audio/mp4',
    'audio/wav',
    'video/mp4',
    'video/quicktime'
  ]
)
on conflict (id) do nothing;

create policy "project_sources_select_project_members"
on storage.objects for select
to authenticated
using (
  bucket_id = 'project-sources'
  and private.can_access_project(((storage.foldername(name))[1])::uuid)
);

create policy "project_sources_insert_project_editors"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'project-sources'
  and private.can_edit_project(((storage.foldername(name))[1])::uuid)
);

create policy "project_sources_update_project_editors"
on storage.objects for update
to authenticated
using (
  bucket_id = 'project-sources'
  and private.can_edit_project(((storage.foldername(name))[1])::uuid)
)
with check (
  bucket_id = 'project-sources'
  and private.can_edit_project(((storage.foldername(name))[1])::uuid)
);

create policy "project_sources_delete_project_editors"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'project-sources'
  and private.can_edit_project(((storage.foldername(name))[1])::uuid)
);

create or replace function public.match_source_chunks(
  query_embedding extensions.vector(1536),
  match_count integer default 8,
  filter_project_id uuid default null
)
returns table (
  id uuid,
  project_id uuid,
  source_id uuid,
  content text,
  similarity double precision,
  metadata jsonb
)
language sql
stable
as $$
  select
    sc.id,
    sc.project_id,
    sc.source_id,
    sc.content,
    1 - (sc.embedding <=> query_embedding) as similarity,
    sc.metadata
  from public.source_chunks sc
  where sc.embedding is not null
    and (filter_project_id is null or sc.project_id = filter_project_id)
  order by sc.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function public.match_source_chunks(extensions.vector, integer, uuid) to authenticated;
