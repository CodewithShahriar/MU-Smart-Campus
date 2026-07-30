import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { ReactNode, useEffect } from "react";
import {
  CalendarDays,
  DoorOpen,
  BarChart3,
  GraduationCap,
  Home,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useInitData } from "@/lib/data/useInit";

const NAV = [
  { to: "/student", label: "Overview", icon: Home, exact: true },
  { to: "/student/routine", label: "Routine", icon: CalendarDays },
  { to: "/student/rooms", label: "Rooms", icon: DoorOpen },
  { to: "/student/analytics", label: "Analytics", icon: BarChart3 },
];

export function StudentShell({ children }: { children: ReactNode }) {
  const { loading, error } = useInitData();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <header className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-lg bg-background/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="size-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <GraduationCap className="size-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold font-display">MUS Portal</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Student · Sylhet</div>
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
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <n.icon className="size-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <Link
            to="/faculty/login"
            className="text-xs px-3 py-1.5 rounded-lg border border-border hover:border-primary/50 hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="size-3.5" />
            Faculty
          </Link>
        </div>
        {/* mobile nav */}
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
        {loading && (
          <div className="text-sm text-muted-foreground animate-pulse">Loading university routine…</div>
        )}
        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}
        {!loading && !error && children}
      </main>

      <footer className="border-t border-border/60 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
          <div>Metropolitan University, Sylhet · Smart Routine & Room Management</div>
          <div>Data source · Central Routine CSV</div>
        </div>
      </footer>
    </div>
  );
}
