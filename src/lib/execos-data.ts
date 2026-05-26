import {
  actions as mockActions,
  artifacts as mockArtifacts,
  memory as mockMemory,
  projectById,
  projects as mockProjects,
  sources as mockSources,
  type ActionItem,
  type Artifact,
  type MemoryItem,
  type Project,
  type Source,
} from "@/lib/mock-data";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  objective: string | null;
  status: "planning" | "active" | "at_risk" | "paused" | "completed";
  owner_id: string | null;
  updated_at: string;
};

type SourceRow = {
  id: string;
  project_id: string;
  title: string;
  source_type: Source["kind"] | "link";
  processing_status: Source["status"];
  created_at: string;
  uploaded_by: string | null;
  metadata: Record<string, unknown> | null;
};

type MemoryRow = {
  id: string;
  project_id: string;
  memory_type:
    | "decision"
    | "action"
    | "risk"
    | "dependency"
    | "open_question"
    | "stakeholder_context"
    | "insight"
    | "milestone";
  title: string;
  summary: string;
  owner_name: string | null;
  due_date: string | null;
  confidence: number | null;
  source_reference: string | null;
  created_at: string;
};

type ActionRow = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  owner_name: string | null;
  due_date: string | null;
  status: "open" | "in_progress" | "blocked" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
};

type ArtifactRow = {
  id: string;
  project_id: string;
  artifact_type: string;
  title: string;
  created_at: string;
  created_by: string | null;
};

export type ProjectWorkspaceData = {
  project: Project;
  sources: Source[];
  memory: MemoryItem[];
  actions: ActionItem[];
  artifacts: Artifact[];
  isLive: boolean;
};

function mockWorkspaceData(projectId: string): ProjectWorkspaceData | undefined {
  const project = projectById(projectId);
  if (!project) return undefined;
  return {
    project,
    sources: mockSources.filter((s) => s.projectId === projectId),
    memory: mockMemory.filter((m) => m.projectId === projectId),
    actions: mockActions.filter((a) => a.projectId === projectId),
    artifacts: mockArtifacts.filter((a) => a.projectId === projectId),
    isLive: false,
  };
}

function liveEnabled() {
  return Boolean(hasSupabaseConfig && supabase);
}

function mapProject(row: ProjectRow, counts?: { sources?: number; actions?: number; risks?: number }): Project {
  const openRisks = counts?.risks ?? 0;
  const health: Project["health"] =
    row.status === "at_risk" ? "at_risk" : openRisks > 3 ? "at_risk" : "on_track";

  return {
    id: row.id,
    name: row.name,
    client: "Workspace",
    status: row.status === "paused" ? "on_hold" : row.status === "completed" ? "archived" : "active",
    health,
    owner: row.owner_id ? "Assigned" : "Unassigned",
    updatedAt: row.updated_at,
    summary: row.objective ?? row.description ?? "No project objective has been captured yet.",
    progress: row.status === "completed" ? 100 : row.status === "planning" ? 15 : 45,
    sourceCount: counts?.sources ?? 0,
    openActions: counts?.actions ?? 0,
    openRisks,
  };
}

function mapSource(row: SourceRow): Source {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.title,
    kind: row.source_type === "link" ? "note" : row.source_type,
    status: row.processing_status,
    sizeKb: Number(row.metadata?.sizeKb ?? 0),
    addedBy: row.uploaded_by ? "Team member" : "ExecOS",
    addedAt: row.created_at.slice(0, 10),
  };
}

function mapMemory(row: MemoryRow): MemoryItem {
  const typeMap: Record<MemoryRow["memory_type"], MemoryItem["type"]> = {
    decision: "decision",
    action: "action",
    risk: "risk",
    dependency: "question",
    open_question: "question",
    stakeholder_context: "stakeholder",
    insight: "question",
    milestone: "decision",
  };

  return {
    id: row.id,
    projectId: row.project_id,
    type: typeMap[row.memory_type],
    title: row.title,
    detail: row.summary,
    source: row.source_reference ?? "Project memory",
    owner: row.owner_name ?? undefined,
    priority: row.memory_type === "risk" && (row.confidence ?? 0) > 0.85 ? "high" : undefined,
    date: row.created_at.slice(0, 10),
  };
}

function mapAction(row: ActionRow): ActionItem {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    owner: row.owner_name ?? "Unassigned",
    due: row.due_date ?? row.created_at.slice(0, 10),
    status: row.status,
    priority: row.priority === "urgent" ? "high" : row.priority === "medium" ? "med" : row.priority,
    source: "Project memory",
  };
}

function mapArtifact(row: ArtifactRow): Artifact {
  return {
    id: row.id,
    projectId: row.project_id,
    type: row.artifact_type.replaceAll("_", " "),
    title: row.title,
    createdAt: row.created_at.slice(0, 10),
    createdBy: row.created_by ? "Team member" : "ExecOS",
  };
}

export async function listProjects(): Promise<{ projects: Project[]; isLive: boolean }> {
  if (!liveEnabled()) return { projects: mockProjects, isLive: false };

  const { data: sessionData } = await supabase!.auth.getSession();
  if (!sessionData.session) return { projects: mockProjects, isLive: false };

  const { data, error } = await supabase!
    .from("projects")
    .select("id,name,description,objective,status,owner_id,updated_at")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  const rows = (data ?? []) as ProjectRow[];
  if (rows.length === 0) return { projects: [], isLive: true };

  const projectIds = rows.map((p) => p.id);
  const [{ data: sourceRows }, { data: actionRows }, { data: riskRows }] = await Promise.all([
    supabase!.from("sources").select("project_id").in("project_id", projectIds),
    supabase!.from("action_items").select("project_id,status").in("project_id", projectIds).neq("status", "done"),
    supabase!.from("memory_items").select("project_id,memory_type").in("project_id", projectIds).eq("memory_type", "risk"),
  ]);

  const countByProject = (items: Array<{ project_id: string }> | null | undefined) =>
    (items ?? []).reduce<Record<string, number>>((acc, item) => {
      acc[item.project_id] = (acc[item.project_id] ?? 0) + 1;
      return acc;
    }, {});

  const sourcesByProject = countByProject(sourceRows);
  const actionsByProject = countByProject(actionRows);
  const risksByProject = countByProject(riskRows);

  return {
    projects: rows.map((row) =>
      mapProject(row, {
        sources: sourcesByProject[row.id],
        actions: actionsByProject[row.id],
        risks: risksByProject[row.id],
      }),
    ),
    isLive: true,
  };
}

export async function getProjectWorkspaceData(projectId: string): Promise<ProjectWorkspaceData | undefined> {
  if (!liveEnabled()) return mockWorkspaceData(projectId);

  const { data: sessionData } = await supabase!.auth.getSession();
  if (!sessionData.session) return mockWorkspaceData(projectId);

  const [{ data: projectRows, error: projectError }, sourcesResult, memoryResult, actionsResult, artifactsResult] =
    await Promise.all([
      supabase!.from("projects").select("id,name,description,objective,status,owner_id,updated_at").eq("id", projectId).limit(1),
      supabase!.from("sources").select("id,project_id,title,source_type,processing_status,created_at,uploaded_by,metadata").eq("project_id", projectId).order("created_at", { ascending: false }),
      supabase!.from("memory_items").select("id,project_id,memory_type,title,summary,owner_name,due_date,confidence,source_reference,created_at").eq("project_id", projectId).order("created_at", { ascending: false }),
      supabase!.from("action_items").select("id,project_id,title,description,owner_name,due_date,status,priority,created_at").eq("project_id", projectId).order("created_at", { ascending: false }),
      supabase!.from("artifacts").select("id,project_id,artifact_type,title,created_at,created_by").eq("project_id", projectId).order("created_at", { ascending: false }),
    ]);

  if (projectError) throw projectError;
  if (!projectRows?.[0]) return mockWorkspaceData(projectId);
  if (sourcesResult.error) throw sourcesResult.error;
  if (memoryResult.error) throw memoryResult.error;
  if (actionsResult.error) throw actionsResult.error;
  if (artifactsResult.error) throw artifactsResult.error;

  const sources = ((sourcesResult.data ?? []) as SourceRow[]).map(mapSource);
  const memory = ((memoryResult.data ?? []) as MemoryRow[]).map(mapMemory);
  const actions = ((actionsResult.data ?? []) as ActionRow[]).map(mapAction);

  return {
    project: mapProject(projectRows[0] as ProjectRow, {
      sources: sources.length,
      actions: actions.filter((a) => a.status !== "done").length,
      risks: memory.filter((m) => m.type === "risk").length,
    }),
    sources,
    memory,
    actions,
    artifacts: ((artifactsResult.data ?? []) as ArtifactRow[]).map(mapArtifact),
    isLive: true,
  };
}

export async function ensureSignedInUserWorkspace(fullName?: string) {
  if (!liveEnabled()) return;

  const { data: userData, error: userError } = await supabase!.auth.getUser();
  if (userError) throw userError;
  const user = userData.user;
  if (!user) return;

  const email = user.email ?? "";

  const { error: profileError } = await supabase!.from("profiles").upsert({
    id: user.id,
    email,
    full_name: fullName || email.split("@")[0] || "ExecOS user",
  });
  if (profileError) throw profileError;

  const { data: memberships, error: membershipReadError } = await supabase!
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1);
  if (membershipReadError) throw membershipReadError;
  if (memberships?.length) return;

  const { data: workspace, error: workspaceError } = await supabase!
    .from("workspaces")
    .insert({ name: "ExecOS Workspace", owner_id: user.id })
    .select("id")
    .single();
  if (workspaceError) throw workspaceError;

  const { error: memberError } = await supabase!.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: "owner",
  });
  if (memberError) throw memberError;

  const { data: project, error: projectError } = await supabase!
    .from("projects")
    .insert({
      workspace_id: workspace.id,
      name: "Snowflake Partner Enablement",
      description: "Starter initiative for partner enablement, meeting memory, decisions, and follow-ups.",
      objective: "Create an executive memory layer for recurring partner strategy work.",
      status: "active",
      owner_id: user.id,
    })
    .select("id")
    .single();
  if (projectError) throw projectError;

  const { data: source, error: sourceError } = await supabase!
    .from("sources")
    .insert({
      project_id: project.id,
      uploaded_by: user.id,
      title: "Partner strategy sync transcript",
      source_type: "transcript",
      content_text:
        "Snowflake partner enablement sync. Team aligned on a Q3 enablement pilot, legal review, and field readiness plan.",
      summary:
        "The team agreed to run a Q3 partner enablement pilot, with unresolved risks around legal approval and field readiness.",
      processing_status: "processed",
    })
    .select("id")
    .single();
  if (sourceError) throw sourceError;

  const { error: memoryError } = await supabase!.from("memory_items").insert([
    {
      project_id: project.id,
      source_id: source.id,
      memory_type: "decision",
      title: "Run Q3 partner enablement pilot",
      summary: "The team agreed to pilot partner enablement with one strategic partner before broader rollout.",
      owner_name: "Partner team",
      confidence: 0.92,
      source_reference: "Partner strategy sync transcript",
    },
    {
      project_id: project.id,
      source_id: source.id,
      memory_type: "risk",
      title: "Legal approval may delay enablement assets",
      summary: "Partner-facing materials still need legal review before they can be shared externally.",
      owner_name: "Legal",
      confidence: 0.86,
      source_reference: "Partner strategy sync transcript",
    },
    {
      project_id: project.id,
      source_id: source.id,
      memory_type: "open_question",
      title: "Which field teams join the first rollout?",
      summary: "The pilot needs a named set of field participants and success criteria.",
      owner_name: "Sales leadership",
      confidence: 0.81,
      source_reference: "Partner strategy sync transcript",
    },
  ]);
  if (memoryError) throw memoryError;

  const { error: actionError } = await supabase!.from("action_items").insert([
    {
      project_id: project.id,
      title: "Confirm Q3 pilot success criteria",
      description: "Define measurable outcomes for the partner enablement pilot.",
      owner_name: "Partner team",
      due_date: "2026-06-05",
      priority: "high",
      status: "open",
    },
    {
      project_id: project.id,
      title: "Route enablement assets through legal",
      description: "Submit the partner-facing materials for review and approval.",
      owner_name: "Legal",
      due_date: "2026-06-03",
      priority: "medium",
      status: "in_progress",
    },
  ]);
  if (actionError) throw actionError;

  const { error: artifactError } = await supabase!.from("artifacts").insert({
    project_id: project.id,
    created_by: user.id,
    artifact_type: "executive_brief",
    title: "Snowflake Partner Enablement Brief",
    content:
      "Status: active. Decision: run Q3 pilot. Top risk: legal review may delay external assets. Next step: confirm success criteria and field participants.",
  });
  if (artifactError) throw artifactError;
}
