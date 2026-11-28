import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { FacultyShell } from "@/components/layout/FacultyShell";
import { useData, useMergedRoutine } from "@/lib/data/store";
import { TIME_SLOTS } from "@/lib/data/types";
import { currentSlot, todayName } from "@/lib/data/utils";
import { ListChecks, CalendarPlus, Activity, Clock, DoorOpen, MapPin, CalendarDays, ArrowRight } from "lucide-react";
import { AnimatedNumber, LivePill, SpotlightCard } from "@/components/ui/motion";

export const Route = createFileRoute("/faculty/")({
  head: () => ({
    meta: [
      { title: "Faculty Dashboard · MU Sylhet" },
      { name: "description", content: "Overview of routine changes, active reservations and quick actions." },
    ],
  }),
  component: FacultyHome,
});

function FacultyHome() {
  const routine = useMergedRoutine();
  const lastRoutineUpdatedAt = useData((s) => s.lastRoutineUpdatedAt);
  const rooms = useData((s) => s.rooms);
  const bookings = useData((s) => s.bookings);
  const today = todayName();
  const currentTimeSlot = currentSlot(TIME_SLOTS);

  const todayCount = routine.filter((r) => r.day === today).length;
  const lastUpdated = lastRoutineUpdatedAt
    ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(lastRoutineUpdatedAt)
    : "No changes yet";
  const availableRooms = useMemo(() => {
    if (!currentTimeSlot) return [];
    const occupiedRooms = new Set(
      routine
        .filter((entry) => entry.day === today && entry.time === currentTimeSlot && entry.room)
        .map((entry) => entry.room),
    );
    const uniqueRooms = new Map(rooms.map((room) => [room.number, room]));
    return [...uniqueRooms.values()].filter((room) => !occupiedRooms.has(room.number));
  }, [rooms, routine, today, currentTimeSlot]);

  const todayBookings = bookings.filter((booking) => booking.day === today).length;
  const liveRoutine = availableRooms.slice(0, 8).map((room) => ({
    id: room.number,
    department: "Available room",
    time: "Available",
    course: `Room ${room.number}`,
    batch: room.type,
    faculty: `Capacity ${room.capacity}`,
    room: room.number,
  }));

  return (
    <FacultyShell>
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">Console</div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display">Faculty Dashboard</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">Manage routine, reserve classrooms and monitor changes.</p>
          </div>
          <LivePill tone={currentTimeSlot ? "success" : "primary"}>
            <span>{currentTimeSlot ? `${today} · ${currentTimeSlot}` : `${today} · Off-hours`}</span>
          </LivePill>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat icon={DoorOpen} label="Available Rooms Now" value={availableRooms.length} tone="emerald" />
          <Stat icon={Clock} label={`Today (${today})`} value={todayCount} tone="blue" />
          <Stat icon={Activity} label="Last Updated" value={lastUpdated} tone="violet" />
          <Stat icon={CalendarPlus} label="Today's Bookings" value={todayBookings} tone="amber" />
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <QuickCard
            to="/faculty/routine"
            icon={CalendarDays}
            title="Central Routine"
            desc="Browse the full central timetable with the same filters students use, side by side with management tools."
            tone="blue"
          />
          <QuickCard
            to="/faculty/manage"
            icon={ListChecks}
            title="Manage Routine"
            desc="Edit course, faculty, room, day, time slot, department, batch or section — students see changes instantly."
            tone="violet"
          />
          <QuickCard
            to="/faculty/book"
            icon={CalendarPlus}
            title="Reserve a Classroom"
            desc="Book any available room for a day and time slot. Conflicts are detected automatically."
            tone="emerald"
          />
        </div>

        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold font-display">Room Availability</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {currentTimeSlot ? `${today} · ${currentTimeSlot}` : "There is no active time slot right now."}
              </p>
            </div>
            <Link to="/faculty/book" className="group text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
              Manage bookings <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {liveRoutine.length === 0 && (
              <div className="md:col-span-2 rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                No rooms are available for the current time slot.
              </div>
            )}
            {liveRoutine.map((item, idx) => (
              <SpotlightCard
                key={item.id}
                className="p-4 animate-fade-up"
                style={{ animationDelay: `${idx * 45}ms` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{item.department}</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-success">
                    <span className="size-1.5 rounded-full bg-success animate-pulse" />
                    {item.time}
                  </span>
                </div>
                <div className="font-semibold mt-2">{item.course}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {item.batch} · {item.faculty || "TBA"}
                </div>
                <div className="text-sm text-muted-foreground mt-2 inline-flex items-center gap-1.5">
                  <MapPin className="size-3 text-primary" /> Room {item.room || "—"}
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>
      </div>
    </FacultyShell>
  );
}

const FACULTY_STAT_TONES = {
  emerald: {
    card: "bg-emerald-50/75 border-emerald-300 dark:bg-emerald-950/25 dark:border-emerald-500/45",
    icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  blue: {
    card: "bg-blue-50/75 border-blue-300 dark:bg-blue-950/25 dark:border-blue-500/45",
    icon: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  violet: {
    card: "bg-violet-50/75 border-violet-300 dark:bg-violet-950/25 dark:border-violet-500/45",
    icon: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  },
  amber: {
    card: "bg-amber-50/75 border-amber-300 dark:bg-amber-950/25 dark:border-amber-500/45",
    icon: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
} as const;

const FACULTY_QUICK_TONES = {
  blue: {
    card: "bg-blue-50/50 border-blue-300 hover:border-blue-500 dark:bg-blue-950/20 dark:border-blue-500/45",
    badge: "bg-gradient-to-br from-blue-600 to-sky-500",
  },
  violet: {
    card: "bg-violet-50/50 border-violet-300 hover:border-violet-500 dark:bg-violet-950/20 dark:border-violet-500/45",
    badge: "bg-gradient-to-br from-violet-600 to-indigo-500",
  },
  emerald: {
    card: "bg-emerald-50/50 border-emerald-300 hover:border-emerald-500 dark:bg-emerald-950/20 dark:border-emerald-500/45",
    badge: "bg-gradient-to-br from-emerald-600 to-teal-500",
  },
} as const;

function QuickCard({
  to,
  icon: Icon,
  title,
  desc,
  tone,
}: {
  to: string;
  icon: any;
  title: string;
  desc: string;
  tone: keyof typeof FACULTY_QUICK_TONES;
}) {
  const t = FACULTY_QUICK_TONES[tone];
  return (
    <Link to={to} className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      <SpotlightCard className={`p-4 sm:p-6 h-full ${t.card}`}>
        <div className={`size-9 sm:size-11 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 ${t.badge}`}>
          <Icon className="size-4 sm:size-5 text-white" />
        </div>
        <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold font-display">{title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-1.5 leading-relaxed">{desc}</p>
      </SpotlightCard>
    </Link>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: any;
  label: string;
  value: string | number;
  tone: keyof typeof FACULTY_STAT_TONES;
}) {
  const t = FACULTY_STAT_TONES[tone];
  return (
    <SpotlightCard className={`p-3.5 sm:p-4 ${t.card}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest text-muted-foreground truncate">{label}</div>
        <div className={`size-7 sm:size-8 rounded-lg flex items-center justify-center shrink-0 ${t.icon}`}>
          <Icon className="size-3.5 sm:size-4" />
        </div>
      </div>
      <div className="mt-1.5 sm:mt-2 text-lg sm:text-xl font-semibold font-display">
        {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
      </div>
    </SpotlightCard>
  );
}
