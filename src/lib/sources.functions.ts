import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const createSource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      projectId: z.string().uuid(),
      title: z.string().min(1).max(255),
      kind: z.enum(["file", "transcript", "audio", "video", "note", "url"]),
      bytes: z.number().int().min(0).optional(),
      content: z.string().max(20000).optional(),
      mime: z.string().max(255).optional(),
      storagePath: z.string().max(500).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles").select("full_name").eq("id", userId).maybeSingle();
    const { data: source, error } = await supabase
      .from("sources")
      .insert({
        project_id: data.projectId,
        title: data.title,
        kind: data.kind,
        bytes: data.bytes ?? null,
        mime: data.mime ?? null,
        storage_path: data.storagePath ?? null,
        uploaded_by: userId,
        uploader_name: profile?.full_name ?? null,
        status: "uploaded",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    if (data.content?.trim()) {
      const { error: chunkError } = await supabase.from("source_chunks").insert({
        source_id: source.id,
        idx: 0,
        content: data.content.trim(),
        token_count: Math.ceil(data.content.trim().length / 4),
      });
      if (chunkError) throw new Error(chunkError.message);
    }

    return { source };
  });
