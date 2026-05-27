import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const artifactKindSchema = z.enum([
  "exec_brief",
  "meeting_summary",
  "prd",
  "sop",
  "project_plan",
  "followup_email",
  "meeting_prep",
  "swot",
  "sprint_plan",
]);

const dbArtifactKind: Record<z.infer<typeof artifactKindSchema>, string> = {
  exec_brief: "exec_brief",
  meeting_summary: "meeting_summary",
  prd: "prd",
  sop: "sop",
  project_plan: "project_plan",
  followup_email: "followup_email",
  meeting_prep: "meeting_prep",
  swot: "exec_brief",
  sprint_plan: "project_plan",
};

export const createArtifact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      projectId: z.string().uuid(),
      kind: artifactKindSchema,
      title: z.string().min(1).max(255),
      body: z.string().min(1).max(20000),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();

    const { data: artifact, error } = await supabase
      .from("artifacts")
      .insert({
        project_id: data.projectId,
        kind: dbArtifactKind[data.kind] as any,
        title: data.title,
        body: data.body,
        created_by: userId,
        creator_name: profile?.full_name ?? "ExecOS",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { artifact };
  });
