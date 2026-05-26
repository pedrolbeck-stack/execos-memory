# ExecOS Memory

ExecOS Memory is an AI project memory workspace for executives, founders, operators, PMs, partner leaders, and consultants.

The product loop is:

1. Create a project or initiative workspace.
2. Upload context: files, meeting transcripts, recordings, videos, notes, and links.
3. Extract structured memory: decisions, action items, risks, blockers, dependencies, stakeholders, and open questions.
4. Chat with project context.
5. Generate executive artifacts: briefs, meeting summaries, PRDs, SOPs, project plans, follow-up emails, and meeting prep.

## Current State

This repo currently contains a Lovable-generated TanStack/Vite UI with mock fallback data plus the first Supabase connection layer for auth and project reads. The next layer is Supabase-backed mutations, storage uploads, and AI processing through Edge Functions.

## Local Development

Install dependencies with your preferred JS package manager, then run the Vite dev server:

```bash
bun install
bun run dev
```

or:

```bash
npm install
npm run dev
```

## Backend Contract

The initial Supabase schema and RLS policies live in:

```text
supabase/migrations/20260525153500_initial_execos_schema.sql
```

See `supabase/README.md` for setup notes and the next backend steps.
