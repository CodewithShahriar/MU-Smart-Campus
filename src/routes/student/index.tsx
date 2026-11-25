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
    <div className="space-y-8">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Welcome</div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display mt-1">
            Good {greet()}, <span className="text-gradient">student.</span>
          </h1>
          <p className="text-muted-foreground mt-2">
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
        <StatCard icon={CalendarClock} label="Total Classes" value={stats.total} delay={0} />
        <StatCard icon={BookOpen} label="Courses" value={stats.courses} delay={60} />
        <StatCard icon={Users} label="Departments" value={stats.departments} delay={120} />
        <StatCard icon={MapPin} label="Rooms in Use" value={stats.rooms} delay={180} />
      </section>

      <section className="grid md:grid-cols-3 gap-5">
        <ActionCard
          to="/student/routine"
          icon={CalendarClock}
          title="Central Routine"
          desc="Filter by department, batch, section, day, faculty, course or room."
          cta="Open routine"
          delay={80}
        />
        <ActionCard
          to="/student/rooms"
          icon={DoorOpen}
          title="Available Rooms"
          desc="See free classrooms right now, colour-coded and searchable."
          cta="Find a free room"
          delay={150}
        />
        <ActionCard
          to="/student/analytics"
          icon={BarChart3}
          title="Utilization Analytics"
          desc="Peak hours, most-used rooms, department-wise load and more."
          cta="View analytics"
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
            {nowClasses.map((c, idx) => (
              <SpotlightCard
                key={c.id}
                className="p-4 animate-fade-up"
                style={{ animationDelay: `${idx * 45}ms` }}
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

function StatCard({
  icon: Icon,
  label,
  value,
  delay = 0,
}: {
  icon: any;
  label: string;
  value: number;
  delay?: number;
}) {
  return (
    <SpotlightCard className="p-4 animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
          <Icon className="size-4" />
        </div>
      </div>
      <div className="text-2xl font-semibold font-display mt-2">
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
  delay = 0,
}: {
  to: string;
  icon: any;
  title: string;
  desc: string;
  cta: string;
  delay?: number;
}) {
  return (
    <Link to={to} className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      <SpotlightCard className="p-6 h-full animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
        <div className="absolute -top-16 -right-16 size-40 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-colors duration-300" />
        <div className="relative">
          <div className="size-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
            <Icon className="size-5 text-primary-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold font-display">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{desc}</p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all duration-300">
            {cta} <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </SpotlightCard>
    </Link>
  );
}
