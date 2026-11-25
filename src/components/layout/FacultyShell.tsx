import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ReactNode, useEffect } from "react";
import {
  LayoutDashboard,
  ListChecks,
  CalendarPlus,
  LogOut,
  ShieldCheck,
  CalendarDays,
  BarChart3,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/lib/data/store";
import { useInitData } from "@/lib/data/useInit";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PortalSkeleton } from "@/components/ui/motion";

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
    <div className="min-h-screen bg-background bg-mesh flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-xl bg-background/75 supports-[backdrop-filter]:bg-background/65">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/faculty" className="flex items-center gap-2.5 group">
            <div className="size-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow transition-transform duration-300 group-hover:scale-105">
              <ShieldCheck className="size-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold font-display">Faculty Console</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">MU Sylhet</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 rounded-2xl border border-border/60 bg-card/50 p-1 backdrop-blur-md">
            {NAV.map((n) => {
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
                    active
                      ? "bg-gradient-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70",
                  )}
                >
                  <n.icon className="size-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden xl:inline rounded-full border border-border/70 bg-card/60 px-2.5 py-1 text-xs text-muted-foreground">
              {email}
            </span>
            <ThemeToggle />
            <button
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
              className="text-xs font-medium px-3 py-2 rounded-xl border border-border/80 bg-card/70 hover:border-destructive/50 hover:text-destructive hover:bg-destructive/5 transition-all duration-200 flex items-center gap-1.5"
            >
              <LogOut className="size-3.5" />
              Sign out
            </button>
          </div>
        </div>

        <div className="lg:hidden border-t border-border/60 overflow-x-auto">
          <div className="flex gap-1 px-2 py-2">
            {NAV.map((n) => {
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all",
                    active
                      ? "bg-gradient-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:text-foreground",
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

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {loading && <PortalSkeleton />}
        {error && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        {!loading && !error && (
          <div key={pathname} className="animate-fade-up">
            {children}
          </div>
        )}
      </main>
    </div>
  );
}
