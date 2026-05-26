
-- 1. Fix set_updated_at search_path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Revoke EXECUTE on SECURITY DEFINER helpers (used only inside RLS / triggers)
REVOKE EXECUTE ON FUNCTION public.is_workspace_member(uuid, uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.project_workspace(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

-- 3. Restrict profiles SELECT to self + shared workspace members
DROP POLICY IF EXISTS profiles_select_own_or_workspace ON public.profiles;
CREATE POLICY profiles_select_own_or_workspace
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.workspace_members wm1
    JOIN public.workspace_members wm2 ON wm1.workspace_id = wm2.workspace_id
    WHERE wm1.user_id = auth.uid() AND wm2.user_id = profiles.id
  )
);

-- 4. Remove always-true workspaces INSERT policy
DROP POLICY IF EXISTS workspaces_insert_any_auth ON public.workspaces;
CREATE POLICY workspaces_insert_authenticated
ON public.workspaces
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Fix storage policies for project-sources: path is "{project_id}/..." in objects.name
DROP POLICY IF EXISTS project_sources_read ON storage.objects;
DROP POLICY IF EXISTS project_sources_write ON storage.objects;
DROP POLICY IF EXISTS project_sources_delete ON storage.objects;

CREATE POLICY project_sources_read
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-sources'
  AND EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = (split_part(storage.objects.name, '/', 1))::uuid
      AND public.is_workspace_member(auth.uid(), p.workspace_id)
  )
);

CREATE POLICY project_sources_write
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-sources'
  AND EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = (split_part(storage.objects.name, '/', 1))::uuid
      AND public.is_workspace_member(auth.uid(), p.workspace_id)
  )
);

CREATE POLICY project_sources_update
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-sources'
  AND EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = (split_part(storage.objects.name, '/', 1))::uuid
      AND public.is_workspace_member(auth.uid(), p.workspace_id)
  )
)
WITH CHECK (
  bucket_id = 'project-sources'
  AND EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = (split_part(storage.objects.name, '/', 1))::uuid
      AND public.is_workspace_member(auth.uid(), p.workspace_id)
  )
);

CREATE POLICY project_sources_delete
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-sources'
  AND EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = (split_part(storage.objects.name, '/', 1))::uuid
      AND public.is_workspace_member(auth.uid(), p.workspace_id)
  )
);
