# Supabase Setup

This folder holds the first durable backend contract for ExecOS Memory.

## Apply The Migration

Create a Supabase project, then apply `supabase/migrations/20260525153500_initial_execos_schema.sql` from the Supabase SQL editor or the Supabase CLI.

The migration creates:

- workspace/project/source/memory/action/artifact/chat tables
- `source_chunks` and `memory_items` vector columns for retrieval
- private helper functions for workspace/project access checks
- RLS policies on every public table
- a private `project-sources` storage bucket
- storage object policies scoped by project id in the first folder segment

Expected storage path format:

```text
<project_id>/<source_id>/<filename>
```

## Environment

Copy `.env.example` and fill in:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
OPENAI_API_KEY=
```

Only expose the Supabase URL and publishable key to the browser. Keep `OPENAI_API_KEY` inside Supabase Edge Functions or another trusted backend.

## Next Backend Steps

1. Add `.env.local` with the Supabase URL and publishable key.
2. Install dependencies after the `@supabase/supabase-js` package change.
3. Replace the remaining mock-only interactions with Supabase mutations:
   - new project
   - source upload
   - artifact creation
   - chat messages
4. Add Edge Functions for source processing:
   - transcribe audio/video
   - chunk source text
   - create embeddings
   - extract decisions, risks, actions, dependencies, open questions, stakeholders, and insights
5. Add artifact generation Edge Functions for executive briefs, PRDs, SOPs, project plans, follow-up emails, and meeting prep.
