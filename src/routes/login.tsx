import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Welcome to ExecOS");
        nav({ to: "/" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        nav({ to: "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
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
            stakeholders - then drafts the brief, the email, the plan.
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
            <h2 className="text-xl font-semibold tracking-tight">
              {mode === "signin" ? "Sign in" : "Create your account"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Use your work email to continue to your workspace."
                : "Get started with the Apex Operations demo workspace."}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">
                  Full name
                </Label>
                <Input
                  id="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Morgan Chen"
                />
              </div>
            )}
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
                autoComplete="email"
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
                required
                minLength={8}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Working..."
                : mode === "signin"
                  ? "Continue to workspace"
                  : "Create account"}
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground">
            {mode === "signin" ? (
              <>
                New to ExecOS?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="font-medium text-foreground underline"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setMode("signin")}
                  className="font-medium text-foreground underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
          <p className="text-center text-[10px] text-muted-foreground">
            <Link to="/" className="hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
