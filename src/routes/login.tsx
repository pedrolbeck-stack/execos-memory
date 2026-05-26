import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ensureSignedInUserWorkspace } from "@/lib/execos-data";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("morgan@apex.co");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);

    if (!hasSupabaseConfig || !supabase) {
      nav({ to: "/" });
      return;
    }

    setLoading(true);
    const authResult =
      mode === "sign-up"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    if (authResult.error) {
      setLoading(false);
      setError(authResult.error.message);
      return;
    }

    try {
      await ensureSignedInUserWorkspace();
      nav({ to: "/" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not prepare your workspace.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-foreground p-10 text-background lg:flex">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-background text-foreground text-xs font-bold">
            EX
          </div>
          <span className="text-sm font-semibold tracking-tight">ExecOS</span>
        </div>
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-semibold leading-tight tracking-tight">
            The project memory layer for operators who can't afford to forget anything.
          </h1>
          <p className="text-sm text-background/70">
            Upload meetings, transcripts, and notes. ExecOS extracts decisions, actions, risks, and
            stakeholders — then drafts the brief, the email, the plan.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-4 text-xs text-background/60">
            <div>
              <div className="text-lg font-semibold text-background">14</div>active workspaces
            </div>
            <div>
              <div className="text-lg font-semibold text-background">3.2k</div>memory items
            </div>
            <div>
              <div className="text-lg font-semibold text-background">SOC 2</div>Type II
            </div>
          </div>
        </div>
        <div className="text-xs text-background/50">© 2026 ExecOS, Inc.</div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Sign in</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use your work email to continue to your workspace.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
            className="space-y-3"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">
                Work email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw" className="text-xs">
                Password
              </Label>
              <Input
                id="pw"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={hasSupabaseConfig ? "Enter your password" : "Demo mode"}
                required={hasSupabaseConfig}
              />
            </div>
            {error && <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">{error}</div>}
            {!hasSupabaseConfig && (
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                Supabase env vars are not configured, so login continues in mock demo mode.
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Preparing workspace..." : mode === "sign-up" ? "Create workspace" : "Continue to workspace"}
            </Button>
          </form>
          <div className="relative text-center text-xs text-muted-foreground">
            <span className="bg-background px-2">or</span>
            <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border" />
          </div>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
            >
              {mode === "sign-in" ? "Create an account" : "Use an existing account"}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => nav({ to: "/" })}>
              Continue in demo mode
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            New to ExecOS? <Link to="/" className="font-medium text-foreground underline">Request access</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
