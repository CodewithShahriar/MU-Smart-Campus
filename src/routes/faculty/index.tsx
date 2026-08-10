import { createFileRoute, Link } from "@tanstack/react-router";
import { FacultyShell } from "@/components/layout/FacultyShell";
import { useData, useMergedRoutine } from "@/lib/data/store";
import { DAYS, TIME_SLOTS } from "@/lib/data/types";
import { todayName } from "@/lib/data/utils";
import { ListChecks, CalendarPlus, Activity, Clock, MapPin, BookOpen, CalendarDays, ArrowRight } from "lucide-react";
import { Link as RouterLink } from "@tanstack/react-router";

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
  const edits = useData((s) => s.edits);
  const today = todayName();

  const todayCount = routine.filter((r) => r.day === today).length;
  const editCount = Object.keys(edits).length;
  const liveRoutine = routine.filter((r) => r.day === today).slice(0, 6);

  return (
    <FacultyShell>
      <div className="space-y-8">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Console</div>
          <h1 className="text-3xl font-bold font-display">Faculty Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage routine, reserve classrooms and monitor changes.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat icon={BookOpen} label="Total Classes" value={routine.length} />
          <Stat icon={Clock} label={`Today (${today})`} value={todayCount} />
          <Stat icon={Activity} label="Routine Edits" value={editCount} />
          <Stat icon={MapPin} label="Live Routine" value={todayCount} />
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <Link to="/faculty/routine" className="group rounded-2xl border border-border bg-card p-6 hover:shadow-elegant hover:-translate-y-0.5 transition-all">
            <div className="size-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <CalendarDays className="size-5 text-primary-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold font-display">Central Routine</h3>
            <p className="text-sm text-muted-foreground mt-1.5">Browse the full central timetable with the same filters students use, side by side with management tools.</p>
          </Link>
          <Link to="/faculty/manage" className="group rounded-2xl border border-border bg-card p-6 hover:shadow-elegant hover:-translate-y-0.5 transition-all">
            <div className="size-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <ListChecks className="size-5 text-primary-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold font-display">Manage Routine</h3>
            <p className="text-sm text-muted-foreground mt-1.5">Edit course, faculty, room, day, time slot, department, batch or section — students see changes instantly.</p>
          </Link>
          <Link to="/faculty/book" className="group rounded-2xl border border-border bg-card p-6 hover:shadow-elegant hover:-translate-y-0.5 transition-all">
            <div className="size-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <CalendarPlus className="size-5 text-primary-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold font-display">Reserve a Classroom</h3>
            <p className="text-sm text-muted-foreground mt-1.5">Book any available room for a day and time slot. Conflicts are detected automatically.</p>
          </Link>
        </div>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold font-display">Live Routine</h2>
            <RouterLink to="/faculty/routine" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              Full routine <ArrowRight className="size-3" />
            </RouterLink>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {liveRoutine.length === 0 && (
              <div className="md:col-span-2 rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                No classes scheduled for {today}.
              </div>
            )}
            {liveRoutine.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-card p-4 hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{item.department}</span>
                  <span className="text-xs font-mono text-muted-foreground">{item.time}</span>
                </div>
                <div className="font-semibold mt-2">{item.course}</div>
                <div className="text-sm text-muted-foreground mt-1">{item.batch} · {item.faculty || "TBA"}</div>
                <div className="text-sm text-muted-foreground mt-2 inline-flex items-center gap-1.5">
                  <MapPin className="size-3" /> Room {item.room || "—"}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </FacultyShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <Icon className="size-4 text-primary" />
      </div>
      <div className="text-2xl font-semibold font-display mt-1.5">{value}</div>
    </div>
  );
}
