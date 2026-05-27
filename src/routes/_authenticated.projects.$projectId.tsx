import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Upload,
  FileText,
  Mic,
  Video,
  StickyNote,
  FileType,
  Sparkles,
  Send,
  Download,
  Plus,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Users,
  GitCommit,
  Loader2,
  XCircle,
  Link2,
  MonitorUp,
  Square,
  Radio,
  Wand2,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getProject } from "@/lib/projects.functions";
import { toggleAction } from "@/lib/actions.functions";
import { createSource } from "@/lib/sources.functions";
import { createArtifact } from "@/lib/artifacts.functions";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/projects/$projectId")({
  component: ProjectWorkspace,
});

const ARTIFACT_TYPES = [
  { key: "exec_brief", label: "Executive Brief", desc: "One-page narrative for leadership: status, risks, asks." },
  { key: "meeting_summary", label: "Meeting Summary", desc: "Decisions, actions, open questions from a meeting." },
  { key: "project_plan", label: "Project Plan", desc: "Workstreams, milestones, owners, dependencies." },
  { key: "prd", label: "PRD", desc: "Problem, goals, requirements, scope, and acceptance criteria." },
  { key: "sop", label: "SOP", desc: "Step-by-step operating procedure derived from project memory." },
  { key: "swot", label: "SWOT", desc: "Strengths, weaknesses, opportunities, and threats." },
  { key: "sprint_plan", label: "Sprint Planning", desc: "Sprint goal, backlog candidates, owners, risks, and ceremonies." },
  { key: "followup_email", label: "Follow-up Email", desc: "Drafted recap email to a stakeholder." },
  { key: "meeting_prep", label: "Meeting Prep", desc: "Briefing pack with context, talking points, decisions needed." },
];

type SourceStatus = "uploaded" | "processing" | "processed" | "failed";

const statusBadge: Record<SourceStatus, { label: string; cls: string; icon: any }> = {
  uploaded: { label: "Uploaded", cls: "text-slate-700 bg-slate-50 border-slate-200", icon: Upload },
  processing: { label: "Processing", cls: "text-blue-700 bg-blue-50 border-blue-200", icon: Loader2 },
  processed: { label: "Processed", cls: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  failed: { label: "Failed", cls: "text-red-700 bg-red-50 border-red-200", icon: XCircle },
};

const kindIcon: Record<string, any> = {
  file: FileText,
  transcript: FileType,
  audio: Mic,
  video: Video,
  note: StickyNote,
  url: Link2,
};

function ProjectWorkspace() {
  const { projectId } = Route.useParams();
  const fetchProject = useServerFn(getProject);
  const q = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject({ data: { projectId } }),
  });

  if (q.isLoading) {
    return (
      <AppShell>
        <div className="p-10 text-center text-sm text-muted-foreground">Loading project…</div>
      </AppShell>
    );
  }

  if (q.isError || !q.data) {
    return (
      <AppShell>
        <div className="p-10 text-center">
          <div className="text-sm font-medium">Project not found</div>
          <Link to="/" className="mt-2 inline-block text-xs text-muted-foreground underline">
            Back to dashboard
          </Link>
        </div>
      </AppShell>
    );
  }

  const { project, sources, memory, actions, artifacts } = q.data;

  return (
    <AppShell>
      <div className="border-b bg-background px-4 pt-4 lg:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Dashboard
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight">{project.name}</h1>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {project.client ?? "—"} · Owner {project.owner_name ?? "Unassigned"} · Updated{" "}
              {new Date(project.updated_at).toLocaleString()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {String(project.health).replace("_", " ")}
            </Badge>
            <Button size="sm" variant="outline">
              <Upload className="h-3.5 w-3.5" /> Add source
            </Button>
            <Button size="sm">
              <Sparkles className="h-3.5 w-3.5" /> Generate artifact
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="h-9 bg-transparent p-0">
            {[
              ["overview", "Overview"],
              ["sources", `Sources · ${sources.length}`],
              ["memory", `Memory · ${memory.length}`],
              ["actions", `Actions · ${actions.length}`],
              ["artifacts", `Artifacts · ${artifacts.length}`],
              ["console", "AI Console"],
            ].map(([v, l]) => (
              <TabsTrigger
                key={v as string}
                value={v as string}
                className="rounded-none border-b-2 border-transparent bg-transparent px-3 text-xs font-medium text-muted-foreground shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                {l}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-0 p-4 lg:p-6">
            <OverviewTab project={project} memory={memory} actions={actions} />
          </TabsContent>
          <TabsContent value="sources" className="mt-0 p-4 lg:p-6">
            <SourcesTab sources={sources} projectId={projectId} />
          </TabsContent>
          <TabsContent value="memory" className="mt-0 p-4 lg:p-6">
            <MemoryTab memory={memory} />
          </TabsContent>
          <TabsContent value="actions" className="mt-0 p-4 lg:p-6">
            <ActionsTab actions={actions} projectId={projectId} />
          </TabsContent>
          <TabsContent value="artifacts" className="mt-0 p-4 lg:p-6">
            <ArtifactsTab
              actions={actions}
              artifacts={artifacts}
              memory={memory}
              project={project}
              projectId={projectId}
            />
          </TabsContent>
          <TabsContent value="console" className="mt-0">
            <ConsoleTab projectName={project.name} />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function OverviewTab({ project, memory, actions }: any) {
  const decisions = memory.filter((m: any) => m.type === "decision");
  const risks = memory.filter((m: any) => m.type === "risk");
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="p-4 lg:col-span-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Executive summary
        </div>
        <p className="mt-2 text-sm leading-relaxed text-foreground/90">
          {project.summary}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-4">
          <div>
            <div className="text-[11px] uppercase text-muted-foreground">Progress</div>
            <div className="mt-1 text-lg font-semibold">{project.progress}%</div>
            <Progress value={project.progress} className="mt-1 h-1.5" />
          </div>
          <div>
            <div className="text-[11px] uppercase text-muted-foreground">Open actions</div>
            <div className="mt-1 text-lg font-semibold">
              {actions.filter((a: any) => a.status !== "done").length}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase text-muted-foreground">Open risks</div>
            <div className="mt-1 text-lg font-semibold">{risks.length}</div>
          </div>
        </div>
      </Card>
      <Card className="p-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Latest decisions
        </div>
        <div className="mt-2 space-y-3">
          {decisions.length === 0 && (
            <div className="text-xs text-muted-foreground">No decisions captured yet.</div>
          )}
          {decisions.slice(0, 4).map((d: any) => (
            <div key={d.id} className="border-l-2 border-foreground/80 pl-3">
              <div className="text-sm font-medium">{d.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {d.occurred_on ?? new Date(d.created_at).toLocaleDateString()} · {d.source_label ?? "—"}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-4 lg:col-span-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Top risks
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {risks.length === 0 && (
            <div className="text-xs text-muted-foreground">No risks flagged.</div>
          )}
          {risks.map((r: any) => (
            <div key={r.id} className="rounded-md border p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-sm font-medium">{r.title}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{r.body}</p>
              <div className="mt-2 text-[10px] uppercase text-muted-foreground">
                Source: {r.source_label ?? "—"}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

type CaptureKind = "screen" | "voice" | "meeting";

function SourcesTab({ sources, projectId }: { sources: any[]; projectId: string }) {
  const qc = useQueryClient();
  const addSource = useServerFn(createSource);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const [capture, setCapture] = useState<{ kind: CaptureKind; label: string } | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [meetingNotes, setMeetingNotes] = useState("");

  const sourceMutation = useMutation({
    mutationFn: (vars: {
      bytes?: number;
      content?: string;
      kind: "audio" | "video" | "note";
      mime?: string;
      storagePath?: string;
      title: string;
    }) => addSource({ data: { projectId, ...vars } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["project", projectId] }),
  });

  async function saveCapture(kind: CaptureKind, blob: Blob) {
    const sourceKind = kind === "voice" ? "audio" : "video";
    const id = crypto.randomUUID();
    const storagePath = `${projectId}/${id}-${kind}.webm`;
    const title =
      kind === "voice"
        ? `Voice note ${new Date().toLocaleString()}`
        : kind === "meeting"
          ? `Meeting companion capture ${new Date().toLocaleString()}`
          : `Screen capture ${new Date().toLocaleString()}`;

    const { error: uploadError } = await supabase.storage
      .from("project-sources")
      .upload(storagePath, blob, {
        contentType: blob.type || "video/webm",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    await sourceMutation.mutateAsync({
      bytes: blob.size,
      kind: sourceKind,
      mime: blob.type || "video/webm",
      storagePath,
      title,
    });
  }

  async function startCapture(kind: CaptureKind) {
    setCaptureError(null);
    if (!navigator.mediaDevices || typeof MediaRecorder === "undefined") {
      setCaptureError("This browser does not support recording. Try Chrome or Edge.");
      return;
    }

    try {
      const stream =
        kind === "voice"
          ? await navigator.mediaDevices.getUserMedia({ audio: true })
          : await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });

      chunksRef.current = [];
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" });
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        setCapture(null);
        void saveCapture(kind, blob)
          .then(() => toast.success("Capture saved as a project source"))
          .catch((error) => {
            setCaptureError(error instanceof Error ? error.message : "Could not save capture.");
            toast.error("Could not save capture");
          });
      };
      recorder.start();
      setCapture({
        kind,
        label:
          kind === "voice"
            ? "Voice recording"
            : kind === "meeting"
              ? "Meeting companion"
              : "Screen capture",
      });
    } catch (error) {
      setCaptureError(error instanceof Error ? error.message : "Capture permission was not granted.");
    }
  }

  function stopCapture() {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }

  async function saveMeetingNote() {
    if (!meetingNotes.trim()) return;
    await sourceMutation.mutateAsync({
      kind: "note",
      content: meetingNotes,
      title: `Meeting companion notes ${new Date().toLocaleString()}`,
      mime: "text/plain",
      bytes: meetingNotes.length,
    });
    setMeetingNotes("");
    toast.success("Meeting notes saved as project context");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="p-4">
        <div className="text-sm font-semibold">Capture context</div>
        <p className="mt-1 text-xs text-muted-foreground">
          Record voice, capture your screen, or run a lightweight meeting companion.
        </p>
        <div className="mt-3 rounded-md border bg-muted/30 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-medium">
                {capture ? `${capture.label} running` : "Meeting companion ready"}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {capture
                  ? "Stop when the meeting or capture is complete. ExecOS saves it as source context."
                  : "Start with screen, meeting, or voice capture."}
              </div>
            </div>
            {capture && <Radio className="h-4 w-4 animate-pulse text-red-600" />}
          </div>
          {captureError && (
            <div className="mt-2 rounded border border-destructive/30 bg-destructive/5 p-2 text-[11px] text-destructive">
              {captureError}
            </div>
          )}
          <div className="mt-3 grid gap-2">
            {capture ? (
              <Button size="sm" variant="destructive" onClick={stopCapture}>
                <Square className="h-3.5 w-3.5" /> Stop and save
              </Button>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={() => startCapture("meeting")}>
                  <Video className="h-3.5 w-3.5" /> Start meeting companion
                </Button>
                <Button size="sm" variant="outline" onClick={() => startCapture("screen")}>
                  <MonitorUp className="h-3.5 w-3.5" /> Capture screen/video
                </Button>
                <Button size="sm" variant="outline" onClick={() => startCapture("voice")}>
                  <Mic className="h-3.5 w-3.5" /> Record voice note
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <textarea
            value={meetingNotes}
            onChange={(e) => setMeetingNotes(e.target.value)}
            placeholder="Add live meeting notes, transcript snippets, or context..."
            className="min-h-24 w-full resize-none rounded-md border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring"
          />
          <Button variant="outline" size="sm" className="w-full justify-start">
            <FileType className="h-3.5 w-3.5" /> Paste transcript
          </Button>
          <Button
            disabled={!meetingNotes.trim() || sourceMutation.isPending}
            onClick={saveMeetingNote}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <StickyNote className="h-3.5 w-3.5" /> Save meeting note
          </Button>
        </div>
      </Card>
      <Card className="lg:col-span-2">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="text-sm font-semibold">Sources ({sources.length})</div>
          <Input placeholder="Filter sources…" className="h-7 w-48 text-xs" />
        </div>
        <div className="divide-y text-sm">
          {sources.length === 0 && (
            <div className="p-6 text-center text-xs text-muted-foreground">No sources yet.</div>
          )}
          {sources.map((s: any) => {
            const KindIcon = kindIcon[s.kind] ?? FileText;
            const sb = statusBadge[s.status as SourceStatus];
            const SIcon = sb.icon;
            return (
              <div key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                <KindIcon className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{s.title}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {s.uploader_name ?? "—"} ·{" "}
                    {new Date(s.created_at).toLocaleDateString()} ·{" "}
                    {s.bytes ? `${(s.bytes / 1024 / 1024).toFixed(1)} MB` : "—"}
                  </div>
                </div>
                <Badge variant="outline" className={cn("h-5 gap-1 px-1.5 text-[10px]", sb.cls)}>
                  <SIcon className={cn("h-3 w-3", s.status === "processing" && "animate-spin")} />
                  {sb.label}
                </Badge>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

const memoryGroups = [
  { key: "decision", label: "Decisions", icon: GitCommit, color: "border-l-foreground" },
  { key: "risk", label: "Risks", icon: AlertTriangle, color: "border-l-amber-500" },
  { key: "action", label: "Actions", icon: CheckCircle2, color: "border-l-blue-500" },
  { key: "question", label: "Open Questions", icon: HelpCircle, color: "border-l-violet-500" },
  { key: "stakeholder", label: "Stakeholders", icon: Users, color: "border-l-emerald-500" },
];

function MemoryTab({ memory }: any) {
  return (
    <div className="grid gap-4 xl:grid-cols-5 lg:grid-cols-3 sm:grid-cols-2">
      {memoryGroups.map((g) => {
        const items = memory.filter((m: any) => m.type === g.key);
        const Icon = g.icon;
        return (
          <Card key={g.key} className="flex flex-col">
            <div className="flex items-center justify-between border-b px-3 py-2">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Icon className="h-3.5 w-3.5" />
                {g.label}
                <span className="text-muted-foreground">({items.length})</span>
              </div>
              <Button size="icon" variant="ghost" className="h-6 w-6">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <ScrollArea className="max-h-[520px] flex-1">
              <div className="space-y-2 p-2">
                {items.length === 0 && (
                  <div className="p-4 text-center text-[11px] text-muted-foreground">No items yet</div>
                )}
                {items.map((m: any) => (
                  <div
                    key={m.id}
                    className={cn("rounded-md border bg-background p-2.5 border-l-2", g.color)}
                  >
                    <div className="text-xs font-medium">{m.title}</div>
                    <p className="mt-1 line-clamp-3 text-[11px] text-muted-foreground">{m.body}</p>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="truncate">{m.source_label ?? "—"}</span>
                      <span>{m.occurred_on ?? ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        );
      })}
    </div>
  );
}

const actionStatusCls: Record<string, string> = {
  open: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-emerald-100 text-emerald-700",
  blocked: "bg-red-100 text-red-700",
};

function ActionsTab({ actions, projectId }: { actions: any[]; projectId: string }) {
  const qc = useQueryClient();
  const toggle = useServerFn(toggleAction);
  const m = useMutation({
    mutationFn: (vars: { actionId: string; status: any }) => toggle({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["project", projectId] }),
  });
  return (
    <Card>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="text-sm font-semibold">Action items</div>
        <Button size="sm" variant="outline">
          <Plus className="h-3.5 w-3.5" /> New action
        </Button>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-[11px] uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-2 text-left font-medium">Title</th>
            <th className="px-4 py-2 text-left font-medium">Owner</th>
            <th className="px-4 py-2 text-left font-medium">Due</th>
            <th className="px-4 py-2 text-left font-medium">Priority</th>
            <th className="px-4 py-2 text-left font-medium">Status</th>
            <th className="px-4 py-2 text-left font-medium">Source</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {actions.length === 0 && (
            <tr>
              <td colSpan={6} className="p-6 text-center text-xs text-muted-foreground">
                No action items yet.
              </td>
            </tr>
          )}
          {actions.map((a: any) => (
            <tr key={a.id} className="hover:bg-muted/30">
              <td className="px-4 py-2.5 font-medium">{a.title}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{a.owner_name ?? "—"}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{a.due_date ?? "—"}</td>
              <td className="px-4 py-2.5">
                <Badge variant="outline" className="text-[10px] capitalize">
                  {a.priority}
                </Badge>
              </td>
              <td className="px-4 py-2.5">
                <button
                  disabled={m.isPending}
                  onClick={() =>
                    m.mutate({
                      actionId: a.id,
                      status: a.status === "done" ? "open" : "done",
                    })
                  }
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-medium capitalize",
                    actionStatusCls[a.status],
                  )}
                >
                  {String(a.status).replace("_", " ")}
                </button>
              </td>
              <td className="px-4 py-2.5 text-xs text-muted-foreground">{a.source_label ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function buildArtifactDraft(kind: string, project: any, memory: any[], actions: any[]) {
  const decisions = memory.filter((item) => item.type === "decision");
  const risks = memory.filter((item) => item.type === "risk");
  const questions = memory.filter((item) => item.type === "question");
  const openActions = actions.filter((item) => item.status !== "done");
  const list = (items: any[], fallback: string) =>
    items.length
      ? items.slice(0, 5).map((item) => `- ${item.title}`).join("\n")
      : `- ${fallback}`;

  const common = `Project: ${project.name}
Status: ${project.health}
Summary: ${project.summary ?? "No summary captured yet."}`;

  const drafts: Record<string, { body: string; title: string }> = {
    exec_brief: {
      title: `${project.name} executive brief`,
      body: `${common}

Key decisions
${list(decisions, "No decisions captured yet.")}

Top risks
${list(risks, "No risks flagged yet.")}

Open actions
${list(openActions, "No open actions.")}

Executive ask
- Confirm the next decision owner and the highest-risk dependency before the next sync.`,
    },
    meeting_summary: {
      title: `${project.name} meeting summary`,
      body: `${common}

Decisions
${list(decisions, "No decisions captured in this context.")}

Actions
${list(openActions, "No action items captured.")}

Open questions
${list(questions, "No open questions captured.")}

Suggested follow-up
- Send owners a recap with decisions, due dates, and unresolved questions.`,
    },
    project_plan: {
      title: `${project.name} project plan`,
      body: `${common}

Workstreams
- Discovery and source ingestion
- Decision and risk tracking
- Stakeholder follow-up
- Executive reporting

Milestones
- Validate scope
- Confirm owners
- Resolve top risks
- Publish executive update

Dependencies
${list(risks, "No dependencies identified yet.")}`,
    },
    prd: {
      title: `${project.name} PRD`,
      body: `${common}

Problem
- The team needs a reliable system of record for decisions, context, and execution.

Goals
- Preserve project memory
- Reduce missed follow-ups
- Generate reusable work products

Requirements
- Capture source context
- Extract memory items
- Generate artifacts
- Track action ownership

Acceptance criteria
- Users can retrieve prior decisions and generate a brief from current context.`,
    },
    sop: {
      title: `${project.name} SOP`,
      body: `${common}

Procedure
1. Create or select the project workspace.
2. Add meeting, file, transcript, voice, or screen context.
3. Review extracted decisions, risks, actions, and questions.
4. Assign owners and confirm due dates.
5. Generate the appropriate artifact.
6. Send follow-up and review before the next meeting.`,
    },
    swot: {
      title: `${project.name} SWOT`,
      body: `${common}

Strengths
- Existing project context is centralized.
- Decisions and actions are visible.

Weaknesses
${list(questions, "Unclear open questions still need triage.")}

Opportunities
- Turn recurring meetings into reusable executive memory.
- Improve stakeholder alignment and follow-through.

Threats
${list(risks, "No threats captured yet.")}`,
    },
    sprint_plan: {
      title: `${project.name} sprint plan`,
      body: `${common}

Sprint goal
- Resolve the highest-priority risks and convert project memory into executable follow-up.

Backlog candidates
${list(openActions, "No backlog candidates captured yet.")}

Ceremonies
- Planning: confirm scope and owners
- Mid-sprint check: review risks and blockers
- Review: publish executive brief
- Retro: capture lessons learned`,
    },
    followup_email: {
      title: `${project.name} follow-up email`,
      body: `Subject: Follow-up on ${project.name}

Hi team,

Sharing a quick recap from the latest project context.

Decisions:
${list(decisions, "No decisions captured yet.")}

Open actions:
${list(openActions, "No open actions.")}

Risks:
${list(risks, "No risks flagged.")}

Please confirm owners and any changes before the next sync.`,
    },
    meeting_prep: {
      title: `${project.name} meeting prep`,
      body: `${common}

Before the meeting
- Review open decisions and overdue actions.
- Confirm which risks need executive attention.

Talking points
${list(decisions, "Confirm the main decision to make.")}

Questions to ask
${list(questions, "What changed since the last meeting?")}

Recommended close
- Confirm owners, due dates, and the next review point.`,
    },
  };

  return drafts[kind] ?? drafts.exec_brief;
}

function ArtifactsTab({
  actions,
  artifacts,
  memory,
  project,
  projectId,
}: {
  actions: any[];
  artifacts: any[];
  memory: any[];
  project: any;
  projectId: string;
}) {
  const qc = useQueryClient();
  const create = useServerFn(createArtifact);
  const mutation = useMutation({
    mutationFn: (kind: string) => {
      const draft = buildArtifactDraft(kind, project, memory, actions);
      return create({
        data: {
          projectId,
          kind: kind as any,
          title: draft.title,
          body: draft.body,
        },
      });
    },
    onSuccess: () => {
      toast.success("Artifact generated");
      qc.invalidateQueries({ queryKey: ["project", projectId] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not generate artifact");
    },
  });

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="p-4 lg:col-span-1">
        <div className="text-sm font-semibold">Generate new artifact</div>
        <p className="mt-1 text-xs text-muted-foreground">
          Synthesized from current project memory and sources.
        </p>
        <div className="mt-3 space-y-2">
          {ARTIFACT_TYPES.map((t) => (
            <button
              key={t.key}
              disabled={mutation.isPending}
              onClick={() => mutation.mutate(t.key)}
              className="w-full rounded-md border bg-background p-2.5 text-left text-xs hover:bg-muted"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{t.label}</span>
                {mutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                ) : (
                  <Wand2 className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{t.desc}</div>
            </button>
          ))}
        </div>
      </Card>
      <Card className="lg:col-span-2">
        <div className="border-b px-4 py-3 text-sm font-semibold">Recent artifacts</div>
        <div className="divide-y">
          {artifacts.length === 0 && (
            <div className="p-6 text-center text-xs text-muted-foreground">No artifacts yet.</div>
          )}
          {artifacts.map((a: any) => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{a.title}</div>
                <div className="text-[11px] text-muted-foreground">
                  {a.kind.replace("_", " ")} ·{" "}
                  {new Date(a.created_at).toLocaleDateString()} · {a.creator_name ?? "—"}
                </div>
              </div>
              <Button size="sm" variant="ghost">
                <Download className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ConsoleTab({ projectName }: { projectName: string }) {
  const [input, setInput] = useState("");
  return (
    <div className="flex h-[calc(100vh-220px)] flex-col">
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="text-xs text-muted-foreground">
            Ask anything about <span className="font-medium text-foreground">{projectName}</span>. The
            AI answers using project memory and sources. (Live AI wiring coming next.)
          </div>
          <Card className="p-4 text-sm text-muted-foreground">
            <p className="text-foreground">
              Try: "Summarize the last steering meeting" · "What decisions are still pending?" ·
              "Draft a follow-up to the sponsor."
            </p>
          </Card>
        </div>
      </div>
      <div className="border-t bg-background p-3 lg:p-4">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <Input
            placeholder={`Ask about ${projectName}…`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-10"
          />
          <Button size="sm">
            <Send className="h-3.5 w-3.5" /> Send
          </Button>
        </div>
      </div>
    </div>
  );
}
