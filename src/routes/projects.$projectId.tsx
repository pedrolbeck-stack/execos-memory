import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
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
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ARTIFACT_TYPES, type SourceStatus } from "@/lib/mock-data";
import { getProjectWorkspaceData } from "@/lib/execos-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects/$projectId")({
  component: ProjectWorkspace,
  loader: async ({ params }) => {
    const data = await getProjectWorkspaceData(params.projectId);
    if (!data) throw notFound();
    return data;
  },
});

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
};

function ProjectWorkspace() {
  const { project, sources, memory, actions, artifacts, isLive } = Route.useLoaderData();

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
              {project.client} · Owner {project.owner} · Updated{" "}
              {new Date(project.updatedAt).toLocaleString()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {project.health.replace("_", " ")}
            </Badge>
            <Badge variant="outline" className={isLive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}>
              {isLive ? "Live" : "Demo"}
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
                key={v}
                value={v}
                className="rounded-none border-b-2 border-transparent bg-transparent px-3 text-xs font-medium text-muted-foreground shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                {l}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="p-0 lg:p-0">
            <TabsContent value="overview" className="mt-0 p-4 lg:p-6">
              <OverviewTab project={project} memory={memory} actions={actions} />
            </TabsContent>
            <TabsContent value="sources" className="mt-0 p-4 lg:p-6">
              <SourcesTab sources={sources} />
            </TabsContent>
            <TabsContent value="memory" className="mt-0 p-4 lg:p-6">
              <MemoryTab memory={memory} />
            </TabsContent>
            <TabsContent value="actions" className="mt-0 p-4 lg:p-6">
              <ActionsTab actions={actions} />
            </TabsContent>
            <TabsContent value="artifacts" className="mt-0 p-4 lg:p-6">
              <ArtifactsTab artifacts={artifacts} />
            </TabsContent>
            <TabsContent value="console" className="mt-0">
              <ConsoleTab projectName={project.name} />
            </TabsContent>
          </div>
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
          {project.summary} Steering committee approved deferring APAC cutover to Q4 due to
          integration gaps. Two high-priority risks remain open: master data quality below
          threshold and constrained sponsor capacity through June. The team is tracking 9 open
          actions with 3 due this week. Recommended next move: confirm parallel run duration with
          CFO and validate fallback rollback path before Friday's steering review.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-4">
          <div>
            <div className="text-[11px] uppercase text-muted-foreground">Progress</div>
            <div className="mt-1 text-lg font-semibold">{project.progress}%</div>
            <Progress value={project.progress} className="mt-1 h-1.5" />
          </div>
          <div>
            <div className="text-[11px] uppercase text-muted-foreground">Open actions</div>
            <div className="mt-1 text-lg font-semibold">{actions.length}</div>
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
          {decisions.slice(0, 4).map((d: any) => (
            <div key={d.id} className="border-l-2 border-foreground/80 pl-3">
              <div className="text-sm font-medium">{d.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {d.date} · {d.source}
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
          {risks.map((r: any) => (
            <div key={r.id} className="rounded-md border p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-sm font-medium">{r.title}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{r.detail}</p>
              <div className="mt-2 text-[10px] uppercase text-muted-foreground">
                Source: {r.source}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SourcesTab({ sources }: any) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="p-4">
        <div className="text-sm font-semibold">Add sources</div>
        <p className="mt-1 text-xs text-muted-foreground">
          Drop files, paste transcripts, upload meeting recordings, or add quick notes.
        </p>
        <div className="mt-3 rounded-md border-2 border-dashed p-6 text-center text-xs text-muted-foreground">
          <Upload className="mx-auto h-5 w-5" />
          <div className="mt-2">Drop files here or click to browse</div>
          <div className="text-[10px]">PDF, DOCX, TXT, MD, VTT, MP3, MP4 up to 500 MB</div>
        </div>
        <div className="mt-3 space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <FileType className="h-3.5 w-3.5" /> Paste transcript
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Mic className="h-3.5 w-3.5" /> Record meeting
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <StickyNote className="h-3.5 w-3.5" /> Add quick note
          </Button>
        </div>
      </Card>
      <Card className="lg:col-span-2">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="text-sm font-semibold">Sources ({sources.length})</div>
          <Input placeholder="Filter sources…" className="h-7 w-48 text-xs" />
        </div>
        <div className="divide-y text-sm">
          {sources.map((s: any) => {
            const KindIcon = kindIcon[s.kind] ?? FileText;
            const sb = statusBadge[s.status as SourceStatus];
            const SIcon = sb.icon;
            return (
              <div key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                <KindIcon className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{s.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {s.addedBy} · {s.addedAt} · {(s.sizeKb / 1024).toFixed(1)} MB
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
                  <div className="p-4 text-center text-[11px] text-muted-foreground">
                    No items yet
                  </div>
                )}
                {items.map((m: any) => (
                  <div
                    key={m.id}
                    className={cn("rounded-md border bg-background p-2.5 border-l-2", g.color)}
                  >
                    <div className="text-xs font-medium">{m.title}</div>
                    <p className="mt-1 line-clamp-3 text-[11px] text-muted-foreground">
                      {m.detail}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="truncate">{m.source}</span>
                      <span>{m.date}</span>
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

function ActionsTab({ actions }: any) {
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
          {actions.map((a: any) => (
            <tr key={a.id} className="hover:bg-muted/30">
              <td className="px-4 py-2.5 font-medium">{a.title}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{a.owner}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{a.due}</td>
              <td className="px-4 py-2.5">
                <Badge variant="outline" className="text-[10px] capitalize">
                  {a.priority}
                </Badge>
              </td>
              <td className="px-4 py-2.5">
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-medium capitalize",
                    actionStatusCls[a.status],
                  )}
                >
                  {a.status.replace("_", " ")}
                </span>
              </td>
              <td className="px-4 py-2.5 text-xs text-muted-foreground">{a.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function ArtifactsTab({ artifacts }: any) {
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
              className="w-full rounded-md border bg-background p-2.5 text-left text-xs hover:bg-muted"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{t.label}</span>
                <Sparkles className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{t.desc}</div>
            </button>
          ))}
        </div>
      </Card>
      <Card className="lg:col-span-2">
        <div className="border-b px-4 py-3 text-sm font-semibold">Recent artifacts</div>
        <div className="divide-y">
          {artifacts.map((a: any) => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{a.title}</div>
                <div className="text-[11px] text-muted-foreground">
                  {a.type} · {a.createdAt} · {a.createdBy}
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
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    {
      role: "ai",
      text: `Hi — I have full context on ${projectName}, including 87 sources and the memory graph. Ask about decisions, risks, owners, or generate a draft.`,
    },
  ]);
  const [input, setInput] = useState("");
  const suggestions = [
    "Summarize the last steering meeting",
    "What are the top 3 risks and proposed mitigations?",
    "Draft a status update for the executive sponsor",
    "Who owns the APAC cutover decision?",
  ];

  function send(text: string) {
    if (!text.trim()) return;
    setMessages((m) => [
      ...m,
      { role: "user", text },
      {
        role: "ai",
        text: "Drawing from EMEA Steering (5/24), Cutover Plan v4, and Risk Register — the top open thread is APAC cutover window confirmation. K. Tanaka owns the decision; due 5/30. Two high-priority risks (master data quality, sponsor capacity) feed directly into this. Recommend a 15-minute async update to the steering committee today.",
      },
    ]);
    setInput("");
  }

  return (
    <div className="grid h-[calc(100vh-13rem)] grid-cols-1 lg:grid-cols-4">
      <div className="hidden border-r p-4 lg:block">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Context scope
        </div>
        <div className="mt-2 space-y-1.5 text-xs">
          <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> All sources (87)</label>
          <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Memory graph</label>
          <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Action items</label>
          <label className="flex items-center gap-2"><input type="checkbox" /> Archived items</label>
        </div>
        <Separator className="my-4" />
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Threads
        </div>
        <div className="mt-2 space-y-1 text-xs">
          {["Risk synthesis 5/24", "APAC timeline review", "Board prep notes"].map((t) => (
            <div key={t} className="truncate rounded px-2 py-1 hover:bg-muted">{t}</div>
          ))}
        </div>
      </div>
      <div className="flex flex-col lg:col-span-3">
        <ScrollArea className="flex-1">
          <div className="mx-auto max-w-3xl space-y-4 p-4 lg:p-6">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" && "justify-end")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    m.role === "user"
                      ? "bg-foreground text-background"
                      : "border bg-background",
                  )}
                >
                  {m.text}
                  {m.role === "ai" && (
                    <div className="mt-2 flex flex-wrap gap-1 border-t pt-2 text-[10px] text-muted-foreground">
                      <Badge variant="outline" className="h-4 px-1 text-[9px]">EMEA Steering 5/24</Badge>
                      <Badge variant="outline" className="h-4 px-1 text-[9px]">Cutover Plan v4</Badge>
                      <Badge variant="outline" className="h-4 px-1 text-[9px]">Risk Register</Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="border-t bg-background p-3 lg:p-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-end gap-2"
            >
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask anything about ${projectName}…`}
                className="min-h-[44px] resize-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
