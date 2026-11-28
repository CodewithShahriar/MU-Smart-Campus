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

      <div className="relative mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-10 min-h-screen flex flex-col">
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

          <div className="grid gap-3.5 sm:gap-5 animate-fade-up" style={{ animationDelay: "140ms" }}>
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
              accent="from-blue-700 to-cyan-500"
              iconBg="bg-gradient-to-b from-[#1E40AF] via-[#1E3A8A] to-[#0F172A] shadow-[0_8px_20px_rgba(30,58,138,0.3)]"
              ctaColor="text-blue-700 dark:text-blue-400"
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
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] border border-blue-100/90 hover:border-blue-300 dark:border-blue-500/20 dark:hover:border-blue-400/40 bg-gradient-to-r from-blue-50/75 via-white/90 to-blue-50/30 dark:from-slate-900/90 dark:via-slate-900/70 dark:to-slate-950/90 p-5 sm:p-7 sm:pr-4 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.12)] transition-all duration-300">
        {/* Subtle ambient lighting */}
        <div
          className={`absolute -top-20 -right-20 size-60 rounded-full bg-gradient-to-br ${accent} opacity-15 blur-3xl group-hover:opacity-25 transition-opacity duration-500 pointer-events-none`}
        />

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
            {/* 3D-styled Squircle App Icon */}
            <div
              className={`size-13 sm:size-15 rounded-[20px] ${iconBg} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1`}
            >
              <Icon className="size-6 sm:size-7 text-white stroke-[2.2] drop-shadow-sm" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h3 className="text-base sm:text-xl font-bold font-display text-slate-900 dark:text-white tracking-tight truncate">
                  {title}
                </h3>
                {badgeTone === "green" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-[#E8FAF0] text-[#059669] border border-[#A7F3D0] dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/50 shadow-xs">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {badge}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/50 shadow-xs">
                    <ShieldCheck className="size-3 text-blue-600 dark:text-blue-400" />
                    {badge}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 sm:mt-2 leading-relaxed line-clamp-2 sm:line-clamp-none max-w-md">
                {blurb}
              </p>

              <div
                className={`mt-3 sm:mt-4 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold ${ctaColor} group-hover:gap-3 transition-all duration-300`}
              >
                {cta}{" "}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
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
    <div className="hidden sm:flex items-center justify-center shrink-0 w-28 h-28 lg:w-36 lg:h-36 relative pointer-events-none select-none transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1">
      {/* Soft background aura */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-sky-400/10 blur-xl" />

      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-[0_10px_20px_rgba(24,119,242,0.2)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bookCover1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E40AF" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="bookCover2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#0B3E98" />
          </linearGradient>
          <linearGradient id="pageGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
        </defs>

        {/* Bottom Book */}
        <g transform="translate(18, 126)">
          <path d="M12 28 L148 28 C154 28 158 24 158 18 L158 8 L18 8 C12 8 8 12 8 18 Z" fill="url(#bookCover1)" />
          <path d="M22 8 L154 8 L150 20 L22 20 Z" fill="url(#pageGrad)" />
          <rect x="10" y="8" width="14" height="20" rx="3" fill="#172554" />
        </g>

        {/* Middle Book */}
        <g transform="translate(26, 96)">
          <path d="M10 24 L138 24 C144 24 148 20 148 15 L148 6 L16 6 C10 6 6 10 6 15 Z" fill="url(#bookCover2)" />
          <path d="M18 6 L144 6 L140 17 L18 17 Z" fill="url(#pageGrad)" />
          <rect x="8" y="6" width="12" height="18" rx="2.5" fill="#1D4ED8" />
          <path d="M120 16 L120 32 L126 28 L132 32 L132 16 Z" fill="#F59E0B" />
        </g>

        {/* Graduation Cap */}
        <g transform="translate(42, 28)">
          <ellipse cx="60" cy="56" rx="34" ry="16" fill="#0F172A" />
          <ellipse cx="60" cy="53" rx="32" ry="14" fill="#1E3A8A" />

          {/* 3D Mortarboard Rhombus Top */}
          <polygon
            points="60,18 116,42 60,66 4,42"
            fill="url(#capGrad)"
            stroke="#60A5FA"
            strokeWidth="1.5"
          />
          <polygon
            points="60,20 112,42 60,63 8,42"
            fill="url(#capGrad)"
            opacity="0.95"
          />

          <circle cx="60" cy="42" r="4" fill="#F59E0B" />

          {/* Golden Tassel */}
          <path
            d="M60 42 Q80 46 88 64 L86 78"
            stroke="#F59E0B"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="86" cy="80" r="3.5" fill="#D97706" />
          <path d="M83 80 L89 80 L91 94 L81 94 Z" fill="#F59E0B" />
        </g>
      </svg>
    </div>
  );
}

function Faculty3DGraphic() {
  return (
    <div className="hidden sm:flex items-center justify-center shrink-0 w-28 h-28 lg:w-36 lg:h-36 relative pointer-events-none select-none transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-1">
      {/* Soft background aura (Deep blue/cyan, strictly NO purple) */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600/20 to-cyan-500/15 blur-xl" />

      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-[0_10px_20px_rgba(30,58,138,0.22)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="suitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="laptopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
          <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="100%" stopColor="#FDBA74" />
          </linearGradient>
        </defs>

        {/* Character Base & Desk Glow */}
        <ellipse cx="100" cy="165" rx="70" ry="16" fill="#0F172A" opacity="0.1" />

        {/* Faculty Character */}
        <g transform="translate(45, 30)">
          {/* Head & Hair */}
          <path d="M40 22 C30 22 25 28 25 38 C25 42 27 52 35 55 C40 57 58 57 65 54 C72 50 75 42 75 36 C75 26 68 22 55 22 Z" fill="#0F172A" />
          <ellipse cx="50" cy="42" rx="16" ry="18" fill="url(#skinGrad)" />
          <path d="M36 28 C42 24 58 24 64 28 C62 33 54 34 50 34 C44 34 38 31 36 28 Z" fill="#1E293B" />

          {/* Neck */}
          <rect x="45" y="56" width="10" height="12" fill="#FDBA74" />

          {/* Shirt & Tie */}
          <polygon points="50,66 42,78 58,78" fill="#FFFFFF" />
          <polygon points="50,68 47,88 50,96 53,88" fill="#0284C7" />

          {/* Executive Suit Jacket (Deep Blue/Slate, NO purple) */}
          <path
            d="M20 90 C22 75 34 70 44 68 L50 82 L56 68 C66 70 78 75 80 90 L85 125 L15 125 Z"
            fill="url(#suitGrad)"
          />
        </g>

        {/* Modern Laptop in Foreground */}
        <g transform="translate(38, 115)">
          {/* Open Laptop Screen */}
          <polygon
            points="14,35 110,35 102,2 22,2"
            fill="url(#laptopGrad)"
            stroke="#64748B"
            strokeWidth="1.5"
          />
          {/* Screen Display */}
          <polygon
            points="18,32 106,32 99,6 25,6"
            fill="url(#screenGrad)"
          />
          <line x1="32" y1="14" x2="68" y2="14" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          <line x1="32" y1="20" x2="88" y2="20" stroke="#E0F2FE" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <line x1="32" y1="26" x2="56" y2="26" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <circle cx="86" cy="14" r="2.5" fill="#38BDF8" />

          {/* Laptop Base */}
          <polygon
            points="4,48 120,48 110,35 14,35"
            fill="#CBD5E1"
            stroke="#94A3B8"
            strokeWidth="1.5"
          />
          <polygon
            points="46,45 78,45 76,38 48,38"
            fill="#94A3B8"
            opacity="0.6"
          />
        </g>
      </svg>
    </div>
  );
}
