import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useData } from "@/lib/data/store";
import { ShieldCheck, ArrowLeft, Lock, Mail, LogIn } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/faculty/login")({
  head: () => ({
    meta: [
      { title: "Faculty Sign In · MU Sylhet" },
      { name: "description", content: "Sign in to the faculty console to manage the routine and reserve classrooms." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const login = useData((s) => s.login);
  const authed = useData((s) => s.authed);
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (authed) navigate({ to: "/faculty" }); }, [authed, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const ok = login(email, password);
      setLoading(false);
      if (ok) {
        toast.success("Signed in successfully");
        navigate({ to: "/faculty" });
      } else {
        toast.error("Invalid credentials");
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-background bg-mesh flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="size-4" /> Back
        </Link>
        <div className="rounded-2xl border border-border bg-card p-7 shadow-elegant">
          <div className="size-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow mb-4">
            <ShieldCheck className="size-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold font-display">Faculty Sign In</h1>
          <p className="text-sm text-muted-foreground mt-1">Access the routine and room management console.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Email</span>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Password</span>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </label>
            <button
              type="submit" disabled={loading}
              className="w-full h-11 rounded-lg bg-gradient-primary text-primary-foreground font-medium shadow-glow hover:opacity-95 disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              <LogIn className="size-4" /> {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-5 text-xs text-muted-foreground rounded-lg bg-muted p-3">
            <div className="font-semibold text-foreground mb-1">Demo credentials</div>
            admin@gmail.com · 123456
          </div>
        </div>
      </div>
    </div>
  );
}
