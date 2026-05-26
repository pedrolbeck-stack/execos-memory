# Supabase Setup

This folder holds the first durable backend contract for ExecOS Memory.

## Apply The Migration

Create a Supabase project, then apply `supabase/migrations/20260525193528_4a5f6c9c-2ab2-400a-819c-c6d169c0d8c5.sql` from the Supabase SQL editor or the Supabase CLI.

The migration creates:

- workspace/project/source/memory/action/artifact/chat tables
- demo workspace data for the first authenticated experience
- helper functions for workspace/project access checks
- RLS policies on every public table
- a private `project-sources` storage bucket
- storage object policies scoped by project id in the storage path

Expected storage path format:

```text
projects/<project_id>/<filename>
```

## Environment

Copy `.env.example` and fill in:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
OPENAI_API_KEY=
```

Only expose the `VITE_` variables to the browser. Keep `OPENAI_API_KEY` inside Supabase Edge Functions or another trusted backend.

## Next Backend Steps

1. Add `.env.local` with Supabase URL and publishable key values for both client and server-side names.
2. Install dependencies.
3. Replace the remaining placeholder interactions with real mutations:
   - source upload
   - artifact creation
   - chat messages
4. Add AI processing:
   - transcribe audio/video
   - chunk source text
   - create embeddings
   - extract decisions, risks, actions, questions, stakeholders, and summaries
5. Add artifact generation Edge Functions for executive briefs, PRDs, SOPs, project plans, follow-up emails, and meeting prep.
