import { createFileRoute, Link } from "@tanstack/react-router";
import { StudentShell } from "@/components/layout/StudentShell";
import { useMergedRoutine } from "@/lib/data/store";
import { DAYS, TIME_SLOTS } from "@/lib/data/types";
import { todayName, currentSlot, isRecognizedDepartment } from "@/lib/data/utils";
import { CalendarClock, DoorOpen, BarChart3, ArrowRight, Users, BookOpen, MapPin } from "lucide-react";
import { useMemo } from "react";
import { AnimatedNumber, LivePill, SpotlightCard } from "@/components/ui/motion";

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "Student Overview · MU Sylhet" },
      { name: "description", content: "Your quick view into today's classes, room status and campus utilization." },
    ],
  }),
  component: StudentHome,
});

function StudentHome() {
  return (
    <StudentShell>
      <Overview />
    </StudentShell>
  );
}

function Overview() {
  const routine = useMergedRoutine();
  const day = todayName();
  const isWeekend = !DAYS.includes(day as any);
  const slot = currentSlot(TIME_SLOTS);

  const stats = useMemo(() => {
    const todaysClasses = routine.filter((r) => r.day === day);
    const departments = new Set(routine.filter((r) => isRecognizedDepartment(r.department)).map((r) => r.department)).size;
    const courses = new Set(routine.map((r) => r.course)).size;
    const rooms = new Set(routine.map((r) => r.room).filter(Boolean)).size;
    return { total: routine.length, todaysClasses: todaysClasses.length, departments, courses, rooms };
  }, [routine, day]);

  const nowClasses = useMemo(
    () => (slot ? routine.filter((r) => r.day === day && r.time === slot).slice(0, 8) : []),
    [routine, day, slot],
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">Welcome</div>
          <h1 className="text-2xl sm:text-4xl font-bold font-display mt-1">
            Good {greet()}, <span className="text-gradient">student.</span>
          </h1>
          <p className="text-xs sm:text-base text-muted-foreground mt-1.5 sm:mt-2">
            Today is <span className="text-foreground font-medium">{day}</span>
            {isWeekend && <span className="text-warning"> · No scheduled classes</span>}
            {slot && (
              <span>
                {" "}
                · Current slot <span className="text-foreground font-medium">{slot}</span>
              </span>
            )}
          </p>
        </div>
        <LivePill tone={slot ? "success" : "primary"}>
          <span>{slot ? `${nowClasses.length} active classes shown` : `${stats.todaysClasses} classes today`}</span>
        </LivePill>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={CalendarClock} label="Total Classes" value={stats.total} tone="blue" delay={0} />
        <StatCard icon={BookOpen} label="Courses" value={stats.courses} tone="violet" delay={60} />
        <StatCard icon={Users} label="Departments" value={stats.departments} tone="emerald" delay={120} />
        <StatCard icon={MapPin} label="Rooms in Use" value={stats.rooms} tone="amber" delay={180} />
      </section>

      <section className="grid md:grid-cols-3 gap-5">
        <ActionCard
          to="/student/routine"
          icon={CalendarClock}
          title="Central Routine"
          desc="Filter by department, batch, section, day, faculty, course or room."
          cta="Open routine"
          tone="blue"
          delay={80}
        />
        <ActionCard
          to="/student/rooms"
          icon={DoorOpen}
          title="Available Rooms"
          desc="See free classrooms right now, colour-coded and searchable."
          cta="Find a free room"
          tone="emerald"
          delay={150}
        />
        <ActionCard
          to="/student/analytics"
          icon={BarChart3}
          title="Utilization Analytics"
          desc="Peak hours, most-used rooms, department-wise load and more."
          cta="View analytics"
          tone="violet"
          delay={220}
        />
      </section>

      {slot && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-success animate-pulse" />
              <h2 className="text-lg font-semibold font-display">Happening right now</h2>
            </div>
            <Link
              to="/student/routine"
              className="group text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              Full routine <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {nowClasses.length === 0 && (
              <div className="col-span-full text-sm text-muted-foreground rounded-2xl border border-dashed border-border p-6">
                No classes are running in this slot.
              </div>
            )}
            {nowClasses.map((c) => (
              <SpotlightCard
                key={c.id}
                className="p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                    {c.department}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">{c.batch}</span>
                </div>
                <div className="font-semibold mt-1.5 truncate">{c.course}</div>
                <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                  <MapPin className="size-3 text-primary/80 shrink-0" />
                  <span className="truncate">
                    Room {c.room || "—"} · {c.faculty || "TBA"}
                  </span>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function greet() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

const STAT_TONES = {
  blue: {
    card: "bg-blue-50/75 border-blue-300 dark:bg-blue-950/25 dark:border-blue-500/45",
    icon: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  violet: {
    card: "bg-violet-50/75 border-violet-300 dark:bg-violet-950/25 dark:border-violet-500/45",
    icon: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  },
  emerald: {
    card: "bg-emerald-50/75 border-emerald-300 dark:bg-emerald-950/25 dark:border-emerald-500/45",
    icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    card: "bg-amber-50/75 border-amber-300 dark:bg-amber-950/25 dark:border-amber-500/45",
    icon: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
} as const;

const ACTION_TONES = {
  blue: {
    card: "bg-blue-50/50 border-blue-300 hover:border-blue-500 dark:bg-blue-950/20 dark:border-blue-500/45",
    orb: "bg-blue-500/15 group-hover:bg-blue-500/25",
    badge: "bg-gradient-to-br from-blue-600 to-sky-500",
    cta: "text-blue-600 dark:text-blue-400",
  },
  emerald: {
    card: "bg-emerald-50/50 border-emerald-300 hover:border-emerald-500 dark:bg-emerald-950/20 dark:border-emerald-500/45",
    orb: "bg-emerald-500/15 group-hover:bg-emerald-500/25",
    badge: "bg-gradient-to-br from-emerald-600 to-teal-500",
    cta: "text-emerald-600 dark:text-emerald-400",
  },
  violet: {
    card: "bg-violet-50/50 border-violet-300 hover:border-violet-500 dark:bg-violet-950/20 dark:border-violet-500/45",
    orb: "bg-violet-500/15 group-hover:bg-violet-500/25",
    badge: "bg-gradient-to-br from-violet-600 to-indigo-500",
    cta: "text-violet-600 dark:text-violet-400",
  },
} as const;

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  delay = 0,
}: {
  icon: any;
  label: string;
  value: number;
  tone: keyof typeof STAT_TONES;
  delay?: number;
}) {
  const t = STAT_TONES[tone];
  return (
    <SpotlightCard className={`p-3.5 sm:p-4 ${t.card}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest text-muted-foreground truncate">{label}</div>
        <div className={`size-7 sm:size-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${t.icon}`}>
          <Icon className="size-3.5 sm:size-4" />
        </div>
      </div>
      <div className="text-xl sm:text-2xl font-semibold font-display mt-1.5 sm:mt-2">
        <AnimatedNumber value={value} />
      </div>
    </SpotlightCard>
  );
}

function ActionCard({
  to,
  icon: Icon,
  title,
  desc,
  cta,
  tone,
  delay = 0,
}: {
  to: string;
  icon: any;
  title: string;
  desc: string;
  cta: string;
  tone: keyof typeof ACTION_TONES;
  delay?: number;
}) {
  const t = ACTION_TONES[tone];
  return (
    <Link to={to} className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      <SpotlightCard className={`p-4 sm:p-6 h-full ${t.card}`}>
        <div className={`absolute -top-16 -right-16 size-40 rounded-full blur-2xl transition-colors duration-300 ${t.orb}`} />
        <div className="relative">
          <div className={`size-9 sm:size-11 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 ${t.badge}`}>
            <Icon className="size-4 sm:size-5 text-white" />
          </div>
          <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold font-display">{title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-1.5 leading-relaxed">{desc}</p>
          <div className={`mt-3 sm:mt-4 inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium group-hover:gap-2.5 transition-all duration-300 ${t.cta}`}>
            {cta} <ArrowRight className="size-3.5 sm:size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </SpotlightCard>
    </Link>
  );
}
