import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, type MouseEvent } from "react";
import {
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  DoorOpen,
} from "lucide-react";
import { SpotlightCard } from "@/components/ui/motion";
import { StudyDoodleBg } from "@/components/ui/study-doodle-bg";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useInitData } from "@/lib/data/useInit";

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
  const navigate = useNavigate();
  const router = useRouter();
  useInitData();

  useEffect(() => {
    router.preloadRoute({ to: "/student" }).catch(() => {});
    router.preloadRoute({ to: "/student/routine" }).catch(() => {});
    router.preloadRoute({ to: "/student/rooms" }).catch(() => {});
  }, [router]);

  const goWithSlide = async (to: string, e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    const doc = document as Document & {
      startViewTransition?: (cb: () => Promise<void> | void) => { finished: Promise<void> };
    };
    if (doc.startViewTransition) {
      document.documentElement.classList.add("vt-slide-rtl");
      const transition = doc.startViewTransition(async () => {
        await navigate({ to: to as any });
      });
      try {
        await transition.finished;
      } finally {
        document.documentElement.classList.remove("vt-slide-rtl");
      }
      return;
    }
    try {
      sessionStorage.setItem("mu-portal-enter", "slide-right");
    } catch {}
    navigate({ to: to as any });
  };

  return (
    <div className="min-h-screen bg-background bg-mesh relative overflow-hidden">
      {/* Blended Metropolitan University campus background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute right-0 top-0 w-full lg:w-[66%] h-[68%] sm:h-[76%]">
          {/* Previous background kept as /campus-bg.jpg */}
          <img
            src="/campus-bg-alt.jpg"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-[center_20%] opacity-85 dark:opacity-45 contrast-[1.06] saturate-[1.08]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/35 to-transparent dark:from-background dark:via-background/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
      </div>
      {/* Subtle minimal dot/grid texture, study doodles & clean ambient washes */}
      <div className="absolute inset-0 bg-dots opacity-65 dark:opacity-30 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_88%)]" />
      <div className="absolute inset-0 bg-grid opacity-55 dark:opacity-25 pointer-events-none [mask-image:radial-gradient(ellipse_at_top_right,black_25%,transparent_80%)]" />
      <StudyDoodleBg />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="hidden dark:block absolute -top-[18%] -right-[8%] w-[55vw] h-[55vw] max-w-[44rem] max-h-[44rem] rounded-full bg-primary/10 blur-[140px] animate-blob" />
        <div
          className="hidden dark:block absolute -bottom-[18%] -left-[8%] w-[55vw] h-[55vw] max-w-[44rem] max-h-[44rem] rounded-full bg-chart-2/10 blur-[140px] animate-blob"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 min-h-screen flex flex-col">
        <header className="flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <img
              src="/brand-logo.png"
              alt="MU Smart Campus"
              className="size-14 sm:size-16 object-contain drop-shadow-sm transition-transform duration-300 hover:scale-105"
            />
            <div className="leading-tight">
              <div className="text-xs sm:text-sm font-semibold font-display">Metropolitan University</div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-muted-foreground">Digital Routine</div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-md sm:flex">
              <span className="size-1.5 rounded-full bg-success" />
              Autumn Term 2026
            </div>
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 flex flex-col justify-center lg:grid lg:grid-cols-[0.9fr_1.15fr] lg:items-center gap-6 sm:gap-8 lg:gap-10 py-6 sm:py-8 lg:py-10">
          <div className="space-y-4 sm:space-y-5 animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/75 dark:bg-slate-900/75 dark:border-blue-400/20 backdrop-blur-md px-3.5 py-1.5 text-xs font-medium text-primary shadow-xs">
              <GraduationCap className="size-3.5" />
              Welcome to Metropolitan University
            </div>
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
                onClick={(e) => goWithSlide("/student/routine", e)}
                className="group flex-1 sm:flex-none justify-center whitespace-nowrap inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-medium text-primary-foreground shadow-glow transition-all duration-300 hover:opacity-95 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Explore Live Routine
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 shrink-0" />
              </Link>
              <Link
                to="/student/rooms"
                onClick={(e) => goWithSlide("/student/rooms", e)}
                className="flex-1 sm:flex-none justify-center whitespace-nowrap inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card/70 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-foreground backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:bg-card hover:-translate-y-0.5"
              >
                <DoorOpen className="size-4 text-primary shrink-0" />
                Find Free Room
              </Link>
            </div>
          </div>

          <div className="grid gap-3.5 sm:gap-4 lg:mt-24 animate-fade-up" style={{ animationDelay: "140ms" }}>
            <RoleCard
              to="/student"
              onNavigate={(e) => goWithSlide("/student", e)}
              icon={GraduationCap}
              badge="Open Access"
              badgeTone="green"
              title="Continue as Student"
              blurb="Browse the central routine, filter by batch, and find available classrooms instantly. No login required."
              cta="Enter Student Portal"
              accent="from-blue-600 to-sky-400"
              iconBg="bg-gradient-to-b from-[#1877F2] to-[#0A56C4] shadow-[0_8px_20px_rgba(24,119,242,0.32)]"
              ctaColor="text-[#1877F2] dark:text-sky-400"
              graphic={<Student3DGraphic />}
            />
            <RoleCard
              to="/faculty/login"
              onNavigate={(e) => goWithSlide("/faculty/login", e)}
              icon={ShieldCheck}
              badge="Protected"
              badgeTone="blue"
              title="Continue as Faculty"
              blurb="Sign in to update the routine, manage course offers, and reserve classrooms with conflict detection."
              cta="Faculty Sign In"
              accent="from-blue-600 to-sky-400"
              iconBg="bg-gradient-to-b from-[#1877F2] to-[#0A56C4] shadow-[0_8px_20px_rgba(24,119,242,0.32)]"
              ctaColor="text-[#1877F2] dark:text-sky-400"
              graphic={<Faculty3DGraphic />}
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
  onNavigate,
  icon: Icon,
  badge,
  badgeTone = "green",
  title,
  blurb,
  cta,
  accent,
  iconBg,
  ctaColor,
  graphic,
}: {
  to: string;
  onNavigate?: (e: MouseEvent) => void;
  icon: any;
  badge: string;
  badgeTone?: "green" | "blue";
  title: string;
  blurb: string;
  cta: string;
  accent: string;
  iconBg: string;
  ctaColor: string;
  graphic: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-[28px] sm:rounded-[32px] transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] border border-white/85 hover:border-blue-300 dark:border-blue-400/20 dark:hover:border-blue-400/40 bg-white/85 backdrop-blur-xl dark:bg-slate-900/80 px-4 py-3.5 sm:px-6 sm:py-4 shadow-[0_8px_32px_rgba(15,23,42,0.06)] hover:shadow-[0_18px_42px_rgba(37,99,235,0.14)] transition-all duration-300">
        {/* Subtle ambient lighting */}
        <div
          className={`absolute -top-20 -right-20 size-52 rounded-full bg-gradient-to-br ${accent} opacity-15 blur-3xl group-hover:opacity-25 transition-opacity duration-500 pointer-events-none`}
        />

        <div className="relative flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
            {/* 3D-styled Squircle App Icon */}
            <div
              className={`size-12 sm:size-13 rounded-[18px] ${iconBg} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1`}
            >
              <Icon className="size-5 sm:size-6 text-white stroke-[2.2] drop-shadow-sm" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white tracking-tight truncate">
                  {title}
                </h3>
                {badgeTone === "green" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#E8FAF0] text-[#059669] border border-[#A7F3D0] dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/50 shadow-xs">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {badge}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/50 shadow-xs">
                    <ShieldCheck className="size-3 text-blue-600 dark:text-blue-400" />
                    {badge}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 mt-1 leading-snug line-clamp-2 sm:line-clamp-none">
                {blurb}
              </p>

              <div
                className={`mt-2 sm:mt-2.5 inline-flex items-center gap-2 text-xs sm:text-[13px] font-semibold ${ctaColor} group-hover:gap-3 transition-all duration-300`}
              >
                {cta}{" "}
                <ArrowRight className="size-3.5 sm:size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </div>

          {/* 3D Graphic Artwork on Right */}
          {graphic}
        </div>
      </div>
    </Link>
  );
}

function Student3DGraphic() {
  return (
    <div className="hidden sm:flex items-center justify-center shrink-0 w-24 h-24 lg:w-28 lg:h-28 relative pointer-events-none select-none transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1">
      <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-blue-500/15 to-sky-400/10 blur-xl" />
      <img
        src="/card-student-3d.jpg"
        alt=""
        aria-hidden="true"
        className="relative w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal dark:rounded-2xl [mask-image:radial-gradient(ellipse_at_center,black_62%,transparent_98%)]"
      />
    </div>
  );
}

function Faculty3DGraphic() {
  return (
    <div className="hidden sm:flex items-center justify-center shrink-0 w-24 h-24 lg:w-28 lg:h-28 relative pointer-events-none select-none transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-1">
      <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-blue-600/15 to-sky-400/10 blur-xl" />
      <img
        src="/card-faculty-3d.jpg"
        alt=""
        aria-hidden="true"
        className="relative w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal dark:rounded-2xl [mask-image:radial-gradient(ellipse_at_center,black_62%,transparent_98%)]"
      />
    </div>
  );
}
