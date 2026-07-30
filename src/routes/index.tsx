import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, ShieldCheck, ArrowRight, CalendarClock, DoorOpen, BarChart3 } from "lucide-react";

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
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 size-96 rounded-full bg-primary/20 blur-3xl animate-float-slow" />
        <div className="absolute bottom-0 left-0 size-96 rounded-full bg-accent/40 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-10 min-h-screen flex flex-col">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <GraduationCap className="size-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold font-display">Metropolitan University</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Sylhet · Smart Routine</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground hidden sm:block">v1.0 · Central Routine Portal</div>
        </header>

        <div className="flex-1 grid lg:grid-cols-2 items-center gap-12 py-12">
          <div className="space-y-6 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/60 text-xs">
              <span className="size-1.5 rounded-full bg-success animate-pulse" />
              Live routine · {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display leading-[1.05]">
              One portal for the entire{" "}
              <span className="text-gradient">campus schedule.</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg">
              Find your classes, discover free rooms in real time, and manage bookings across every department — designed for Metropolitan University, Sylhet.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Feature icon={CalendarClock} label="Central Routine" />
              <Feature icon={DoorOpen} label="Live Room Status" />
              <Feature icon={BarChart3} label="Utilization Analytics" />
            </div>
          </div>

          <div className="grid gap-5 animate-fade-up" style={{ animationDelay: "150ms" }}>
            <RoleCard
              to="/student"
              icon={GraduationCap}
              title="Continue as Student"
              blurb="Browse the central routine, filter by batch, and find available classrooms instantly. No login required."
              cta="Enter Student Portal"
              accent="from-primary to-sky-400"
            />
            <RoleCard
              to="/faculty/login"
              icon={ShieldCheck}
              title="Continue as Faculty"
              blurb="Sign in to update the routine, reserve rooms and review utilization analytics."
              cta="Faculty Sign In"
              accent="from-sky-500 to-primary"
            />
          </div>
        </div>

        <footer className="pt-6 border-t border-border/60 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
          <div>© {new Date().getFullYear()} Metropolitan University, Sylhet</div>
          <div>Built for a real production-grade routine experience</div>
        </footer>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="size-4" />
      </div>
      {label}
    </div>
  );
}

function RoleCard({
  to, icon: Icon, title, blurb, cta, accent,
}: { to: string; icon: any; title: string; blurb: string; cta: string; accent: string }) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-elegant hover:shadow-glow transition-all hover:-translate-y-0.5"
    >
      <div className={`absolute -top-24 -right-24 size-48 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-3xl group-hover:opacity-30 transition-opacity`} />
      <div className="relative flex items-start gap-4">
        <div className="size-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
          <Icon className="size-6 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold font-display">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1.5">{blurb}</p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all">
            {cta} <ArrowRight className="size-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
