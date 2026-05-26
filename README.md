# ExecOS Memory

ExecOS Memory is an AI project memory workspace for executives, founders, operators, PMs, partner leaders, and consultants.

The product loop is:

1. Create a project or initiative workspace.
2. Upload context: files, meeting transcripts, recordings, videos, notes, and links.
3. Extract structured memory: decisions, action items, risks, blockers, dependencies, stakeholders, and open questions.
4. Chat with project context.
5. Generate executive artifacts: briefs, meeting summaries, PRDs, SOPs, project plans, follow-up emails, and meeting prep.

## Current State

This repo contains a Lovable-generated TanStack/Vite UI with Supabase-backed auth, protected routes, seeded demo workspace data, and server functions for project reads/actions. The next layer is storage upload processing and AI generation through Edge Functions or TanStack server functions.

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

The current Supabase schema and RLS policies live in:

```text
supabase/migrations/20260525193528_4a5f6c9c-2ab2-400a-819c-c6d169c0d8c5.sql
```

See `supabase/README.md` for setup notes and the next backend steps.
