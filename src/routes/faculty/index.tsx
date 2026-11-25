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
      <div className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Console</div>
            <h1 className="text-3xl font-bold font-display">Faculty Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage routine, reserve classrooms and monitor changes.</p>
          </div>
          <LivePill tone={currentTimeSlot ? "success" : "primary"}>
            <span>{currentTimeSlot ? `${today} · ${currentTimeSlot}` : `${today} · Off-hours`}</span>
          </LivePill>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat icon={DoorOpen} label="Available Rooms Now" value={availableRooms.length} />
          <Stat icon={Clock} label={`Today (${today})`} value={todayCount} />
          <Stat icon={Activity} label="Last Updated" value={lastUpdated} />
          <Stat icon={CalendarPlus} label="Today's Bookings" value={todayBookings} />
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <QuickCard
            to="/faculty/routine"
            icon={CalendarDays}
            title="Central Routine"
            desc="Browse the full central timetable with the same filters students use, side by side with management tools."
          />
          <QuickCard
            to="/faculty/manage"
            icon={ListChecks}
            title="Manage Routine"
            desc="Edit course, faculty, room, day, time slot, department, batch or section — students see changes instantly."
          />
          <QuickCard
            to="/faculty/book"
            icon={CalendarPlus}
            title="Reserve a Classroom"
            desc="Book any available room for a day and time slot. Conflicts are detected automatically."
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

function QuickCard({ to, icon: Icon, title, desc }: { to: string; icon: any; title: string; desc: string }) {
  return (
    <Link to={to} className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      <SpotlightCard className="p-6 h-full">
        <div className="size-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
          <Icon className="size-5 text-primary-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold font-display">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{desc}</p>
      </SpotlightCard>
    </Link>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <SpotlightCard className="p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="size-4" />
        </div>
      </div>
      <div className="mt-2 text-base font-semibold font-display sm:text-xl">
        {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
      </div>
    </SpotlightCard>
  );
}
