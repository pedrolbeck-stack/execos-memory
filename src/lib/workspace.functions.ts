import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getCurrentWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, title")
      .eq("id", userId)
      .maybeSingle();

    const { data: memberships, error } = await supabase
      .from("workspace_members")
      .select("role, workspace:workspaces(id, name, slug, plan)")
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);

    const workspaces = (memberships ?? [])
      .map((m: any) => m.workspace ? { ...m.workspace, role: m.role } : null)
      .filter(Boolean);

    return {
      profile,
      workspaces,
      activeWorkspace: workspaces[0] ?? null,
    };
  });
