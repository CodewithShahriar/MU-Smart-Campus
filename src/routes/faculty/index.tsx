import { createFileRoute, Link } from "@tanstack/react-router";
import { FacultyShell } from "@/components/layout/FacultyShell";
import { useData, useMergedRoutine } from "@/lib/data/store";
import { DAYS, TIME_SLOTS } from "@/lib/data/types";
import { todayName } from "@/lib/data/utils";
import { ListChecks, CalendarPlus, Trash2, Activity, Clock, MapPin, BookOpen } from "lucide-react";
import { toast } from "sonner";

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
  const bookings = useData((s) => s.bookings);
  const removeBooking = useData((s) => s.removeBooking);
  const today = todayName();

  const todayCount = routine.filter((r) => r.day === today).length;
  const editCount = Object.keys(edits).length;
  const bookingCount = bookings.length;

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
          <Stat icon={MapPin} label="Active Bookings" value={bookingCount} />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
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
          <h2 className="text-lg font-semibold font-display mb-3">Active Bookings</h2>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Room</th>
                  <th className="px-4 py-3 text-left">Day</th>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-left">Course</th>
                  <th className="px-4 py-3 text-left">Faculty</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-muted-foreground py-10">No active bookings.</td></tr>
                )}
                {bookings.map((b) => (
                  <tr key={b.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{b.room}</td>
                    <td className="px-4 py-3">{b.day}</td>
                    <td className="px-4 py-3 text-xs font-mono">{b.time}</td>
                    <td className="px-4 py-3">{b.course}</td>
                    <td className="px-4 py-3">{b.faculty}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { removeBooking(b.id); toast.success("Booking released"); }}
                        className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                      >
                        <Trash2 className="size-3" /> Release
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
