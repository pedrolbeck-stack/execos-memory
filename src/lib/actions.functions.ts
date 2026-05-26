import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const toggleAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      actionId: z.string().uuid(),
      status: z.enum(["open", "in_progress", "done", "blocked"]),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("action_items")
      .update({ status: data.status })
      .eq("id", data.actionId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
