import { createFileRoute, Link } from "@tanstack/react-router";
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
import { projects, recentActivity } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Dashboard });

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

function Stat({ label, value, sub, icon: Icon }: { label: string; value: string; sub?: string; icon: any }) {
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
  const openActions = projects.reduce((s, p) => s + p.openActions, 0);
  const openRisks = projects.reduce((s, p) => s + p.openRisks, 0);
  const totalSources = projects.reduce((s, p) => s + p.sourceCount, 0);

  return (
    <AppShell>
      <div className="border-b bg-background px-4 py-4 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Monday · May 25, 2026
            </div>
            <h1 className="mt-0.5 text-xl font-semibold tracking-tight">Good morning, Morgan</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              6 active projects · 3 updates overnight · 2 items waiting on you
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
          <Stat label="Active projects" value="6" sub="2 at risk · 1 off track" icon={Activity} />
          <Stat label="Open actions" value={String(openActions)} sub="4 due this week" icon={CheckCircle2} />
          <Stat label="Open risks" value={String(openRisks)} sub="3 high priority" icon={AlertTriangle} />
          <Stat label="Sources indexed" value={String(totalSources)} sub="12 processing" icon={Clock} />
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
              {projects.map((p) => (
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
                        {p.client} · Owner {p.owner}
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
                      <div>{p.openActions} actions</div>
                      <div>{p.openRisks} risks</div>
                    </div>
                  </div>
                </Link>
              ))}
            </Card>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold tracking-tight">Recent activity</h2>
            <Card className="divide-y">
              {recentActivity.map((a) => (
                <div key={a.id} className="px-4 py-3 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground">{a.projectName}</span>
                    <span>{a.when}</span>
                  </div>
                  <p className="mt-1 text-foreground/90">{a.text}</p>
                  <div className="mt-1 text-[10px] text-muted-foreground">by {a.actor}</div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
