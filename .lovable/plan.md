# Plan: Wire ExecOS to Lovable Cloud (Supabase)

Goal: turn the mock-only prototype into a real multi-tenant workspace app — auth, full schema, RLS, seed data, and live queries on every screen.

## 1. Enable Cloud
Call the Cloud enable tool to provision Supabase (database, auth, storage, server runtime). No user setup needed.

## 2. Auth
- Email + password only (matches existing `/login` screen).
- Add a `profiles` table auto-created on signup via trigger (id → `auth.users`, full_name, avatar_url, title, timezone).
- Add `_authenticated` layout route that gates the dashboard and project pages; unauth users bounce to `/login`.
- Wire `supabase.auth.onAuthStateChange` at root to invalidate router + query cache.
- Real signup form on `/login` (toggle between sign-in / sign-up), plus working logout in app shell.

## 3. Database schema (with RLS on every table)

```text
profiles              one row per auth user
workspaces            tenant container (name, slug, plan)
workspace_members     user_id + workspace_id + role (owner/admin/member/viewer)
projects              workspace_id, name, status, owner, summary, due_date
sources               project_id, kind (file/transcript/recording/note/url),
                      title, status (uploaded|processing|processed|failed),
                      storage_path, mime, bytes, uploaded_by
source_chunks         source_id, idx, content, token_count, embedding (vector, nullable for now)
meetings              project_id, title, occurred_at, source_id, attendees jsonb
memory_items          project_id, type (decision|risk|stakeholder|question|summary),
                      title, body, confidence, source_id, created_by
action_items          project_id, title, owner, due_date, status, source_id
artifacts             project_id, kind (brief|email|plan|update), title, body, created_by
chat_threads          project_id, title, created_by
chat_messages         thread_id, role (user|assistant|system), content, citations jsonb
```

Roles use a separate `app_role` enum + `user_roles` table with a `has_role()` SECURITY DEFINER function (never store roles on profiles). Workspace membership uses a `is_workspace_member(uid, wsid)` SECURITY DEFINER helper to keep RLS non-recursive.

RLS pattern for every project-scoped table:
`USING (is_workspace_member(auth.uid(), (SELECT workspace_id FROM projects WHERE id = project_id)))`

## 4. Storage
One bucket `project-sources` (private). RLS: only workspace members of the owning project can read/write objects under `{workspace_id}/{project_id}/...`.

## 5. Server functions (`src/lib/*.functions.ts`)
All reads/writes go through `createServerFn` + `requireSupabaseAuth` — no direct table queries from components. Initial set:
- `workspaces.functions.ts` — list, create, switch active
- `projects.functions.ts` — list, get, create, update status
- `sources.functions.ts` — list, create (returns signed upload URL), update status
- `memory.functions.ts` — list by project + type, create, update
- `actions.functions.ts` — list, toggle status, create
- `artifacts.functions.ts` — list, create, get
- `chat.functions.ts` — list threads, get messages, send message (stub assistant reply for now)
- `meetings.functions.ts` — list, get, create

`src/start.ts` gets `attachSupabaseAuth` registered in `functionMiddleware`.

## 6. Seed mock data
Migration inserts a demo workspace ("Apex Operations"), 4 projects, ~15 sources across statuses, ~25 memory_items, ~12 action_items, a few meetings/artifacts/chat threads — mirroring the current `mock-data.ts`. On first signup, a trigger adds the new user to the demo workspace as `owner` so the app feels populated immediately. After this, `src/lib/mock-data.ts` is deleted.

## 7. Screen rewiring
- `/` (dashboard) — live workspace + project list via `useSuspenseQuery`.
- `/projects/$projectId` — live project, sources, memory_items, actions, artifacts, chat tabs.
- `/login` — real Supabase email/password sign-in + sign-up toggle.
- App shell — show real user (profile.full_name, avatar), workspace switcher from live `workspace_members`.
- Source upload — real upload to `project-sources` bucket, row inserted with `status='uploaded'`. AI processing stays a placeholder (status transitions wired but no model call yet).

## 8. Out of scope (explicit)
- Real AI extraction (embeddings + LLM calls) — statuses stay placeholder; we'll wire Lovable AI Gateway in a follow-up.
- Realtime subscriptions, invitations/email, billing, audit log.

## Technical notes
- All tables: `id uuid pk default gen_random_uuid()`, `created_at timestamptz default now()`, `updated_at` with trigger.
- Cascading deletes from `projects` down to chunks/messages.
- `source_chunks.embedding` defined as `vector(1536)` nullable (pgvector); index added later when AI is wired.
- Indexes on every FK and on `(project_id, type)` for memory_items, `(project_id, status)` for actions.
- Server fns return plain DTOs only (no Supabase client instances).
- New users are auto-added to the demo workspace via `handle_new_user()` trigger so the app isn't empty on first login.

Confirm and I'll switch to build mode and start with the Cloud enable + migration.
