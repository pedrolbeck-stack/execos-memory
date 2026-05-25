import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FolderKanban,
  Inbox,
  Sparkles,
  Settings,
  Search,
  Bell,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { projects } from "@/lib/mock-data";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "All Projects", icon: FolderKanban },
  { to: "/inbox", label: "Inbox", icon: Inbox },
  { to: "/console", label: "AI Console", icon: Sparkles },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-56 flex-col border-r bg-background lg:flex">
          <div className="flex h-14 items-center gap-2 border-b px-4">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-background text-[11px] font-bold">
              EX
            </div>
            <div className="text-sm font-semibold tracking-tight">ExecOS</div>
            <span className="ml-auto rounded border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              BETA
            </span>
          </div>
          <nav className="flex-1 overflow-y-auto px-2 py-3 text-sm">
            <div className="space-y-0.5">
              {nav.map((n) => {
                const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground",
                      active && "bg-muted text-foreground font-medium",
                    )}
                  >
                    <n.icon className="h-4 w-4" />
                    {n.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Workspaces
            </div>
            <div className="mt-1 px-2 text-xs text-muted-foreground">Apex Operating Co.</div>
            <div className="mt-5 flex items-center justify-between px-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Pinned projects
              </div>
              <Plus className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="mt-1 space-y-0.5">
              {projects.slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  to="/projects/$projectId"
                  params={{ projectId: p.id }}
                  className={cn(
                    "block truncate rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground",
                    path.includes(p.id) && "bg-muted text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle",
                      p.health === "on_track" && "bg-emerald-500",
                      p.health === "at_risk" && "bg-amber-500",
                      p.health === "off_track" && "bg-red-500",
                    )}
                  />
                  {p.name.replace(/^Project /, "")}
                </Link>
              ))}
            </div>
          </nav>
          <div className="border-t p-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[10px]">MC</AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-xs">
                <div className="truncate font-medium">Morgan Chen</div>
                <div className="truncate text-muted-foreground">Chief of Staff</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 lg:pl-56">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur lg:px-6">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects, memory, sources…"
                className="h-8 pl-8 text-xs"
              />
              <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border bg-muted px-1.5 text-[10px] text-muted-foreground">
                ⌘K
              </kbd>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-8 gap-1.5">
                <Plus className="h-3.5 w-3.5" /> New project
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
