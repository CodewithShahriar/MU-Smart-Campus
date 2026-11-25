import { Link, useRouterState } from "@tanstack/react-router";
import { ReactNode } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  DoorOpen,
  GraduationCap,
  Home,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useInitData } from "@/lib/data/useInit";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PortalSkeleton } from "@/components/ui/motion";

const NAV = [
  { to: "/student", label: "Overview", icon: Home, exact: true },
  { to: "/student/routine", label: "Routine", icon: CalendarDays },
  { to: "/student/course-offer", label: "Courses", icon: BookOpen },
  { to: "/student/rooms", label: "Rooms", icon: DoorOpen },
  { to: "/student/analytics", label: "Analytics", icon: BarChart3 },
];

export function StudentShell({ children }: { children: ReactNode }) {
  const { loading, error } = useInitData();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background bg-mesh flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-xl bg-background/75 supports-[backdrop-filter]:bg-background/65">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="size-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow transition-transform duration-300 group-hover:scale-105">
              <GraduationCap className="size-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold font-display">Student Portal</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">MU Sylhet</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 rounded-2xl border border-border/60 bg-card/50 p-1 backdrop-blur-md">
            {NAV.map((n) => {
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "relative px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
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
            <ThemeToggle />
            <Link
              to="/faculty/login"
              className="text-xs font-medium px-3 py-2 rounded-xl border border-border/80 bg-card/70 hover:border-primary/50 hover:text-primary transition-all duration-200 flex items-center gap-1.5"
            >
              <ShieldCheck className="size-3.5" />
              Faculty
            </Link>
          </div>
        </div>

        {/* mobile nav — fits all 5 tabs cleanly with no scrollbar */}
        <div className="md:hidden border-t border-border/60 px-2 py-1.5">
          <div className="grid grid-cols-5 gap-1">
            {NAV.map((n) => {
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "py-1.5 px-1 rounded-xl text-[10px] font-medium flex flex-col items-center justify-center gap-0.5 transition-all text-center",
                    active
                      ? "bg-gradient-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  )}
                >
                  <n.icon className="size-3.5 shrink-0" />
                  <span className="truncate max-w-full">{n.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
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

      <footer className="border-t border-border/60 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
          <div>Metropolitan University, Sylhet · Smart Routine & Room Management</div>
          <div>
            Developed by{" "}
            <a
              href="https://github.com/CodewithShahriar"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
            >
              Code with Shahriar
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
