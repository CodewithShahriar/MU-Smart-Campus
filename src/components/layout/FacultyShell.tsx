import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ReactNode, useEffect } from "react";
import { LayoutDashboard, ListChecks, CalendarPlus, LogOut, ShieldCheck, CalendarDays, BarChart3, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/lib/data/store";
import { useInitData } from "@/lib/data/useInit";

const NAV = [
  { to: "/faculty", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/faculty/routine", label: "Central Routine", icon: CalendarDays },
  { to: "/faculty/manage", label: "Manage Routine", icon: ListChecks },
  { to: "/faculty/course-offer", label: "Course Offers", icon: BookOpen },
  { to: "/faculty/book", label: "Book Room", icon: CalendarPlus },
  { to: "/faculty/analytics", label: "Analytics", icon: BarChart3 },
];

export function FacultyShell({ children }: { children: ReactNode }) {
  const authed = useData((s) => s.authed);
  const email = useData((s) => s.facultyEmail);
  const logout = useData((s) => s.logout);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { loading, error } = useInitData();

  useEffect(() => {
    if (!authed) navigate({ to: "/faculty/login" });
  }, [authed, navigate]);

  if (!authed) return null;

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <header className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-lg bg-background/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          <Link to="/faculty" className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <ShieldCheck className="size-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold font-display">Faculty Console</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">MU Sylhet</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((n) => {
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5",
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <n.icon className="size-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-muted-foreground">{email}</span>
            <button
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
              className="text-xs px-3 py-1.5 rounded-lg border border-border hover:border-destructive/50 hover:text-destructive flex items-center gap-1.5"
            >
              <LogOut className="size-3.5" />
              Sign out
            </button>
          </div>
        </div>
        <div className="md:hidden border-t border-border/60 overflow-x-auto">
          <div className="flex gap-1 px-2 py-2">
            {NAV.map((n) => {
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1",
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
                >
                  <n.icon className="size-3.5" />
                  {n.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {loading && <div className="text-sm text-muted-foreground animate-pulse">Loading data…</div>}
        {error && <div className="text-sm text-destructive">{error}</div>}
        {!loading && !error && children}
      </main>
    </div>
  );
}
