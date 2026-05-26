import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);

    // Aggregate counts in parallel (small dataset; fine for now)
    const ids = (projects ?? []).map((p) => p.id);
    if (ids.length === 0) return { projects: [] };

    const [{ data: sources }, { data: actions }, { data: risks }] = await Promise.all([
      supabase.from("sources").select("project_id, status").in("project_id", ids),
      supabase.from("action_items").select("project_id, status").in("project_id", ids),
      supabase.from("memory_items").select("project_id, type").in("project_id", ids).eq("type", "risk"),
    ]);

    const count = (rows: any[] | null, key: string, match?: (r: any) => boolean) =>
      (rows ?? []).reduce((acc: Record<string, number>, r: any) => {
        if (match && !match(r)) return acc;
        acc[r[key]] = (acc[r[key]] ?? 0) + 1;
        return acc;
      }, {});

    const sourceCounts = count(sources, "project_id");
    const openActionCounts = count(actions, "project_id", (a) => a.status !== "done");
    const riskCounts = count(risks, "project_id");

    return {
      projects: (projects ?? []).map((p) => ({
        ...p,
        source_count: sourceCounts[p.id] ?? 0,
        open_actions: openActionCounts[p.id] ?? 0,
        open_risks: riskCounts[p.id] ?? 0,
      })),
    };
  });

export const getProject = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ projectId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const [project, sources, memory, actions, artifacts] = await Promise.all([
      supabase.from("projects").select("*").eq("id", data.projectId).maybeSingle(),
      supabase.from("sources").select("*").eq("project_id", data.projectId).order("created_at", { ascending: false }),
      supabase.from("memory_items").select("*").eq("project_id", data.projectId).order("created_at", { ascending: false }),
      supabase.from("action_items").select("*").eq("project_id", data.projectId).order("due_date", { ascending: true }),
      supabase.from("artifacts").select("*").eq("project_id", data.projectId).order("created_at", { ascending: false }),
    ]);

    if (!project.data) throw new Error("Project not found");
    return {
      project: project.data,
      sources: sources.data ?? [],
      memory: memory.data ?? [],
      actions: actions.data ?? [],
      artifacts: artifacts.data ?? [],
    };
  });

export const createProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      workspaceId: z.string().uuid(),
      name: z.string().min(1).max(160),
      client: z.string().max(160).optional(),
      summary: z.string().max(2000).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        workspace_id: data.workspaceId,
        name: data.name,
        client: data.client ?? null,
        summary: data.summary ?? null,
        created_by: userId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { project };
  });
