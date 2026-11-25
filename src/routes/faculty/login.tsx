import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useData } from "@/lib/data/store";
import { ShieldCheck, ArrowLeft, Lock, Mail, LogIn, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SpotlightCard } from "@/components/ui/motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (authed) navigate({ to: "/faculty" });
  }, [authed, navigate]);

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
    <div className="min-h-screen bg-background bg-mesh relative overflow-hidden flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="absolute -top-32 -right-32 size-96 rounded-full bg-primary/20 blur-3xl animate-blob pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-accent/40 blur-3xl animate-blob pointer-events-none" />

      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md animate-fade-up">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors group"
        >
          <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" /> Back to portal
        </Link>

        <SpotlightCard className="p-7 sm:p-8 shadow-elegant">
          <div className="size-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow mb-5">
            <ShieldCheck className="size-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold font-display">Faculty Sign In</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Access the routine and room management console.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Email</span>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@metrouni.edu.bd"
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-border bg-background/80 text-sm transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Password</span>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-12 rounded-xl border border-border bg-background/80 text-sm transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-primary text-primary-foreground font-medium shadow-glow hover:opacity-95 active:scale-[0.99] disabled:opacity-60 inline-flex items-center justify-center gap-2 transition-all duration-200"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </SpotlightCard>
      </div>
    </div>
  );
}
