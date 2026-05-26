import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowUpRight,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Sparkles,
  PlayCircle,
  CreditCard,
  Coins,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { listProjects } from "@/lib/projects.functions";
import { getCurrentWorkspace } from "@/lib/workspace.functions";
import { onboardingSteps, plans, processingPacks } from "@/lib/billing";
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
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const list = useServerFn(listProjects);
  const ws = useServerFn(getCurrentWorkspace);

  const projectsQ = useQuery({ queryKey: ["projects"], queryFn: () => list() });
  const wsQ = useQuery({ queryKey: ["workspace"], queryFn: () => ws() });

  const projects = projectsQ.data?.projects ?? [];
  const openActions = projects.reduce((s: number, p: any) => s + (p.open_actions ?? 0), 0);
  const openRisks = projects.reduce((s: number, p: any) => s + (p.open_risks ?? 0), 0);
  const totalSources = projects.reduce((s: number, p: any) => s + (p.source_count ?? 0), 0);
  const atRisk = projects.filter((p: any) => p.health !== "on_track").length;

  const firstName = wsQ.data?.profile?.full_name?.split(" ")[0] ?? "there";

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
            <Button variant="outline" size="sm" onClick={() => setDemoOpen(true)}>
              <PlayCircle className="h-3.5 w-3.5" /> Guided demo
            </Button>
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
        <TrialBanner onStartDemo={() => setDemoOpen(true)} />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Active projects"
            value={String(projects.length)}
            sub={`${atRisk} need attention`}
            icon={Activity}
          />
          <Stat label="Open actions" value={String(openActions)} icon={CheckCircle2} />
          <Stat label="Open risks" value={String(openRisks)} icon={AlertTriangle} />
          <Stat label="Sources indexed" value={String(totalSources)} icon={Clock} />
        </div>

        <PricingSection />

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
                <div className="p-6 text-center text-xs text-muted-foreground">
                  Loading projects...
                </div>
              )}
              {projectsQ.isError && (
                <div className="p-6 text-center text-xs text-destructive">
                  Could not load projects. Check Supabase auth and environment variables.
                </div>
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
                        {p.client ?? "-"} · Owner {p.owner_name ?? "Unassigned"}
                      </div>
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {p.summary}
                      </p>
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
              <div className="mt-1 font-semibold">{wsQ.data?.activeWorkspace?.name ?? "-"}</div>
              <div className="mt-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                You
              </div>
              <div className="mt-1">{wsQ.data?.profile?.full_name ?? "-"}</div>
              <div className="text-xs text-muted-foreground">
                {wsQ.data?.profile?.title ?? "Member"}
              </div>
            </Card>
          </div>
        </div>
      </div>
      <GuidedDemoDialog
        open={demoOpen}
        step={demoStep}
        onOpenChange={setDemoOpen}
        onStepChange={setDemoStep}
      />
    </AppShell>
  );
}

function TrialBanner({ onStartDemo }: { onStartDemo: () => void }) {
  return (
    <Card className="overflow-hidden">
      <div className="grid gap-4 p-4 lg:grid-cols-[1.5fr_1fr] lg:p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700" variant="outline">
              14-day Team trial
            </Badge>
            <Badge variant="outline">No credit card for beta</Badge>
          </div>
          <h2 className="mt-3 text-lg font-semibold tracking-tight">
            Turn project context into shared executive memory.
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            The launch plan starts users on Team so they experience shared memory, actions,
            briefings, and operating visibility before choosing Pro, Team, Business, or Enterprise.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
          <Button size="sm" onClick={onStartDemo}>
            <PlayCircle className="h-3.5 w-3.5" /> Start 2-minute demo
          </Button>
          <Button size="sm" variant="outline">
            <CreditCard className="h-3.5 w-3.5" /> Upgrade workspace
          </Button>
          <Button size="sm" variant="outline">
            <Coins className="h-3.5 w-3.5" /> Add processing pack
          </Button>
        </div>
      </div>
    </Card>
  );
}

function PricingSection() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Subscription packaging</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Built for a free preview, 14-day Team trial, and clear usage add-ons instead of confusing token math.
          </p>
        </div>
        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
          Founding Team: $19/user/month
        </Badge>
      </div>
      <div className="grid gap-3 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card
            key={plan.key}
            className={cn(
              "flex flex-col p-4",
              plan.featured && "border-foreground shadow-sm",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-semibold">{plan.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">{plan.audience}</div>
              </div>
              {plan.featured && (
                <Badge className="shrink-0" variant="default">
                  Main plan
                </Badge>
              )}
            </div>
            <div className="mt-4">
              <span className="text-2xl font-semibold tracking-tight">{plan.price}</span>
              <span className="ml-1 text-xs text-muted-foreground">{plan.cadence}</span>
              {plan.annualPrice && (
                <div className="mt-0.5 text-[11px] text-muted-foreground">{plan.annualPrice}</div>
              )}
            </div>
            <div className="mt-4 space-y-2 text-xs">
              {plan.features.map((feature) => (
                <div key={feature} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <Button className="mt-4" size="sm" variant={plan.featured ? "default" : "outline"}>
              {plan.cta}
            </Button>
          </Card>
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Users className="h-4 w-4" /> Teams and Business
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Team is the default trial because shared memory is the strongest aha. Business unlocks admin,
            M365, audit, retention, and priority processing once teams rely on ExecOS operationally.
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Coins className="h-4 w-4" /> Processing packs
          </div>
          <div className="mt-2 space-y-2">
            {processingPacks.map((pack) => (
              <div key={pack.name} className="rounded-md border p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium">{pack.name}</span>
                  <span className="text-xs font-semibold">{pack.price}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{pack.description}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4" /> Enterprise path
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Enterprise stays custom for SSO, SCIM, procurement, data retention, security review,
            and dedicated support. Keep it sales-led until usage patterns are clearer.
          </p>
        </Card>
      </div>
    </div>
  );
}

function GuidedDemoDialog({
  open,
  step,
  onOpenChange,
  onStepChange,
}: {
  open: boolean;
  step: number;
  onOpenChange: (open: boolean) => void;
  onStepChange: (step: number) => void;
}) {
  const current = onboardingSteps[step];
  const isLast = step === onboardingSteps.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>ExecOS guided demo</DialogTitle>
          <DialogDescription>
            A short walkthrough of the project memory loop users should understand before choosing a plan.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-2">
            {onboardingSteps.map((item, index) => (
              <button
                key={item.title}
                onClick={() => onStepChange(index)}
                className={cn(
                  "w-full rounded-md border p-3 text-left text-xs hover:bg-muted",
                  index === step && "border-foreground bg-muted",
                )}
              >
                <div className="font-medium">
                  {index + 1}. {item.title}
                </div>
                <div className="mt-0.5 text-muted-foreground">{item.signal}</div>
              </button>
            ))}
          </div>
          <div className="rounded-md border bg-muted/40 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Demo step {step + 1} of {onboardingSteps.length}
            </div>
            <h3 className="mt-3 text-lg font-semibold tracking-tight">{current.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{current.body}</p>
            <div className="mt-4 rounded-md border bg-background p-3 text-xs">
              <div className="font-medium">What the user sees</div>
              <p className="mt-1 text-muted-foreground">{current.signal}</p>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-1">
              {onboardingSteps.map((item, index) => (
                <div
                  key={item.title}
                  className={cn(
                    "h-1 rounded-full bg-muted",
                    index <= step && "bg-foreground",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Skip demo
          </Button>
          <Button
            onClick={() => {
              if (isLast) {
                onOpenChange(false);
                onStepChange(0);
                return;
              }
              onStepChange(step + 1);
            }}
          >
            {isLast ? "Go to workspace" : "Next step"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
