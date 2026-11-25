import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  DoorOpen,
} from "lucide-react";
import { SpotlightCard } from "@/components/ui/motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Welcome · MU Sylhet Smart Routine" },
      { name: "description", content: "Choose Student or Faculty to enter the Metropolitan University Sylhet portal." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background bg-mesh relative overflow-hidden">
      {/* Subtle architectural dot/grid texture & wide, seamless ambient washes */}
      <div className="absolute inset-0 bg-dots opacity-85 dark:opacity-30 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_88%)]" />
      <div className="absolute inset-0 bg-grid opacity-75 dark:opacity-25 pointer-events-none [mask-image:radial-gradient(ellipse_at_top_right,black_25%,transparent_80%)]" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[18%] -right-[8%] w-[55vw] h-[55vw] max-w-[44rem] max-h-[44rem] rounded-full bg-primary/25 dark:bg-primary/10 blur-[140px] animate-blob" />
        <div
          className="absolute -bottom-[18%] -left-[8%] w-[55vw] h-[55vw] max-w-[44rem] max-h-[44rem] rounded-full bg-chart-2/25 dark:bg-chart-2/10 blur-[140px] animate-blob"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-10 min-h-screen flex flex-col">
        <header className="flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="size-9 sm:size-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow transition-transform duration-300 hover:scale-105">
              <GraduationCap className="size-4 sm:size-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="text-xs sm:text-sm font-semibold font-display">Metropolitan University</div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-muted-foreground">Sylhet · Smart Campus</div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-md sm:flex">
              <span className="size-1.5 rounded-full bg-success" />
              Last updated · 23 August 2026
            </div>
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 flex flex-col justify-center lg:grid lg:grid-cols-2 lg:items-center gap-6 sm:gap-8 lg:gap-12 py-6 sm:py-10 lg:py-12">
          <div className="space-y-4 sm:space-y-5 animate-fade-up">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-display leading-[1.06]">
              One portal for the entire{" "}
              <span className="text-gradient">campus schedule.</span>
            </h1>

            <p className="text-muted-foreground text-sm sm:text-lg max-w-lg leading-relaxed">
              Find your classes, discover free rooms in real time, and manage bookings across every department — designed for Metropolitan University, Sylhet.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <Link
                to="/student/routine"
                className="group flex-1 sm:flex-none justify-center inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-medium text-primary-foreground shadow-glow transition-all duration-300 hover:opacity-95 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Explore Live Routine
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/student/rooms"
                className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card/70 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-foreground backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:bg-card hover:-translate-y-0.5"
              >
                <DoorOpen className="size-4 text-primary" />
                Find Free Room
              </Link>
            </div>
          </div>

          <div className="grid gap-3.5 sm:gap-5 animate-fade-up" style={{ animationDelay: "140ms" }}>
            <RoleCard
              to="/student"
              icon={GraduationCap}
              badge="Open Access"
              title="Continue as Student"
              blurb="Browse the central routine, filter by batch, and find available classrooms instantly. No login required."
              cta="Enter Student Portal"
              accent="from-primary to-sky-400"
            />
            <RoleCard
              to="/faculty/login"
              icon={ShieldCheck}
              badge="Protected"
              title="Continue as Faculty"
              blurb="Sign in to update the routine, manage course offers, and reserve classrooms with conflict detection."
              cta="Faculty Sign In"
              accent="from-sky-500 to-primary"
            />
          </div>
        </div>

        <footer className="flex flex-col items-center gap-2 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
          <div>© {new Date().getFullYear()} Metropolitan University, Sylhet</div>
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
        </footer>
      </div>
    </div>
  );
}

function RoleCard({
  to,
  icon: Icon,
  badge,
  title,
  blurb,
  cta,
  accent,
}: {
  to: string;
  icon: any;
  badge: string;
  title: string;
  blurb: string;
  cta: string;
  accent: string;
}) {
  return (
    <Link to={to} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl">
      <SpotlightCard className="p-4 sm:p-7 dark:bg-slate-800/70 dark:hover:bg-slate-800/85 border-primary/20 dark:border-white/15 ring-1 ring-inset ring-foreground/5 hover:border-primary/50 dark:hover:border-primary/50">
        <div
          className={`absolute -top-24 -right-24 size-52 rounded-full bg-gradient-to-br ${accent} opacity-15 blur-3xl group-hover:opacity-30 transition-opacity duration-500`}
        />
        <div className="relative flex items-start gap-3.5 sm:gap-4">
          <div className="size-10 sm:size-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
            <Icon className="size-5 sm:size-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base sm:text-xl font-semibold font-display truncate">{title}</h3>
              <span className="shrink-0 rounded-full border border-border/80 bg-muted/70 px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {badge}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-1.5 leading-relaxed">{blurb}</p>
            <div className="mt-3 sm:mt-4 inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary group-hover:gap-2.5 transition-all duration-300">
              {cta} <ArrowRight className="size-3.5 sm:size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </SpotlightCard>
    </Link>
  );
}
