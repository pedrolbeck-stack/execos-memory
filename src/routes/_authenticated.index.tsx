import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { listProjects } from "@/lib/projects.functions";
import { getCurrentWorkspace } from "@/lib/workspace.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/")({ component: Dashboard });

const healthColor: Record<string, string> = {
  on_track: "text-emerald-700 bg-emerald-50 border-emerald-200",
  at_risk: "text-amber-700 bg-amber-50 border-amber-200",
  off_track: "text-red-700 bg-red-50 border-red-200",
};
const healthLabel: Record<string, string> = {
  on_track: "On track",
  at_risk: "At risk",
  off_track: "Off track",
};

function Stat({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: any;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </Card>
  );
}

function Dashboard() {
  const list = useServerFn(listProjects);
  const ws = useServerFn(getCurrentWorkspace);

  const projectsQ = useQuery({ queryKey: ["projects"], queryFn: () => list() });
  const wsQ = useQuery({ queryKey: ["workspace"], queryFn: () => ws() });

  const projects = projectsQ.data?.projects ?? [];
  const openActions = projects.reduce((s: number, p: any) => s + (p.open_actions ?? 0), 0);
  const openRisks = projects.reduce((s: number, p: any) => s + (p.open_risks ?? 0), 0);
  const totalSources = projects.reduce((s: number, p: any) => s + (p.source_count ?? 0), 0);
  const atRisk = projects.filter((p: any) => p.health !== "on_track").length;

  const firstName =
    wsQ.data?.profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <AppShell>
      <div className="border-b bg-background px-4 py-4 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <h1 className="mt-0.5 text-xl font-semibold tracking-tight">
              Good morning, {firstName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {projects.length} active projects · {atRisk} not on track · {openActions} open actions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileText className="h-3.5 w-3.5" /> Daily digest
            </Button>
            <Button size="sm">
              <Sparkles className="h-3.5 w-3.5" /> Ask across all projects
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-4 lg:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Active projects" value={String(projects.length)} sub={`${atRisk} need attention`} icon={Activity} />
          <Stat label="Open actions" value={String(openActions)} icon={CheckCircle2} />
          <Stat label="Open risks" value={String(openRisks)} icon={AlertTriangle} />
          <Stat label="Sources indexed" value={String(totalSources)} icon={Clock} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight">Projects</h2>
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                View all <ArrowUpRight className="h-3 w-3" />
              </Button>
            </div>
            <Card className="divide-y">
              {projectsQ.isLoading && (
                <div className="p-6 text-center text-xs text-muted-foreground">Loading projects…</div>
              )}
              {!projectsQ.isLoading && projects.length === 0 && (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No projects yet. Create your first project to get started.
                </div>
              )}
              {projects.map((p: any) => (
                <Link
                  key={p.id}
                  to="/projects/$projectId"
                  params={{ projectId: p.id }}
                  className="block px-4 py-3 hover:bg-muted/40"
                >
                  <div className="flex items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{p.name}</span>
                        <Badge
                          variant="outline"
                          className={cn("h-5 px-1.5 text-[10px]", healthColor[p.health])}
                        >
                          {healthLabel[p.health]}
                        </Badge>
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {p.client ?? "—"} · Owner {p.owner_name ?? "Unassigned"}
                      </div>
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{p.summary}</p>
                    </div>
                    <div className="hidden w-40 shrink-0 sm:block">
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Progress</span>
                        <span>{p.progress}%</span>
                      </div>
                      <Progress value={p.progress} className="mt-1 h-1.5" />
                    </div>
                    <div className="hidden w-32 shrink-0 text-right text-xs text-muted-foreground md:block">
                      <div>{p.open_actions} actions</div>
                      <div>{p.open_risks} risks</div>
                    </div>
                  </div>
                </Link>
              ))}
            </Card>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold tracking-tight">Workspace</h2>
            <Card className="p-4 text-sm">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Active workspace
              </div>
              <div className="mt-1 font-semibold">
                {wsQ.data?.activeWorkspace?.name ?? "—"}
              </div>
              <div className="mt-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                You
              </div>
              <div className="mt-1">{wsQ.data?.profile?.full_name ?? "—"}</div>
              <div className="text-xs text-muted-foreground">{wsQ.data?.profile?.title ?? "Member"}</div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
