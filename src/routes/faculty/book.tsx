import { createFileRoute } from "@tanstack/react-router";
import { FacultyShell } from "@/components/layout/FacultyShell";
import { useData, useMergedRoutine } from "@/lib/data/store";
import { DAYS, TIME_SLOTS } from "@/lib/data/types";
import { useMemo, useState } from "react";
import { CalendarPlus, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/faculty/book")({
  head: () => ({
    meta: [
      { title: "Book Room · Faculty" },
      { name: "description", content: "Reserve an available classroom for a specific day and time slot." },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  const rooms = useData((s) => s.rooms);
  const bookings = useData((s) => s.bookings);
  const addBooking = useData((s) => s.addBooking);
  const removeBooking = useData((s) => s.removeBooking);
  const routine = useMergedRoutine();

  const [day, setDay] = useState<string>(DAYS[0]);
  const [slot, setSlot] = useState<string>(TIME_SLOTS[0]);
  const [course, setCourse] = useState("");
  const [faculty, setFaculty] = useState("");
  const [room, setRoom] = useState("");
  const [status, setStatus] = useState<"all" | "available" | "occupied" | "booked">("available");

  const availability = useMemo(() => {
    const occupied = new Set(
      routine.filter((r) => r.day === day && r.time === slot && r.room).map((r) => r.room)
    );
    const booked = new Set(bookings.filter((b) => b.day === day && b.time === slot).map((b) => b.room));
    const seen = new Set<string>();
    return rooms.filter((r) => { if (seen.has(r.number)) return false; seen.add(r.number); return true; })
      .map((r) => ({
        ...r,
        status: booked.has(r.number) ? "booked" : occupied.has(r.number) ? "occupied" : "available",
      }));
  }, [rooms, routine, bookings, day, slot]);

  const available = availability.filter((r) => r.status === "available");
  const visible = status === "all" ? availability : availability.filter((r) => r.status === status);
  const selectedRoom = availability.find((r) => r.number === room);
  const selectedBookings = bookings.filter((booking) => booking.day === day && booking.time === slot);

  const submit = () => {
    if (!course || !faculty || !room) return toast.error("Fill in all fields");
    if (!selectedRoom) return toast.error("Select a valid room");
    if (selectedRoom.status !== "available") return toast.error(`Room ${room} is ${selectedRoom.status}`);
    addBooking({ day, time: slot, room, course, faculty });
    toast.success(`Room ${room} reserved for ${day} · ${slot}`);
    setCourse(""); setFaculty(""); setRoom("");
  };

  const cancelBooking = (id: string, roomNumber: string) => {
    if (!window.confirm(`Remove the reservation for room ${roomNumber}?`)) return;
    removeBooking(id);
    toast.success(`Room ${roomNumber} reservation removed`);
  };

  return (
    <FacultyShell>
      <div className="space-y-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Reservations</div>
          <h1 className="text-3xl font-bold font-display">Book a Classroom</h1>
          <p className="text-muted-foreground text-sm mt-1">Bookings apply only to the selected day and slot.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-elegant space-y-4 lg:col-span-1">
            <h2 className="text-sm font-semibold font-display">Booking details</h2>
            <Field label="Day">
              <select value={day} onChange={(e) => setDay(e.target.value)} className="h-10 w-full px-3 rounded-lg border border-border bg-background text-sm">
                {DAYS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Time Slot">
              <select value={slot} onChange={(e) => setSlot(e.target.value)} className="h-10 w-full px-3 rounded-lg border border-border bg-background text-sm">
                {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Course Name">
              <input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. Extra Class CSE-101" className="h-10 w-full px-3 rounded-lg border border-border bg-background text-sm" />
            </Field>
            <Field label="Faculty">
              <input value={faculty} onChange={(e) => setFaculty(e.target.value)} placeholder="e.g. NIR" className="h-10 w-full px-3 rounded-lg border border-border bg-background text-sm" />
            </Field>
            <Field label="Room">
              <select value={room} onChange={(e) => setRoom(e.target.value)} className="h-10 w-full px-3 rounded-lg border border-border bg-background text-sm">
                <option value="">Select an available room…</option>
                {available.map((r) => <option key={r.number} value={r.number}>{r.number} · {r.type}</option>)}
              </select>
            </Field>
            <button onClick={submit} className="w-full h-11 rounded-lg bg-gradient-primary text-primary-foreground font-medium shadow-glow inline-flex items-center justify-center gap-2">
              <CalendarPlus className="size-4" /> Reserve Room
            </button>
            <div className="text-xs text-muted-foreground">
              {available.length} available · {availability.filter(r => r.status === "occupied").length} occupied · {availability.filter(r => r.status === "booked").length} booked
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h2 className="text-sm font-semibold font-display">Live room map — {day} · {slot}</h2>
              <div className="flex flex-wrap gap-1.5">
                {([
                  ["available", `Available (${available.length})`],
                  ["occupied", `Occupied (${availability.filter((r) => r.status === "occupied").length})`],
                  ["booked", `Booked (${availability.filter((r) => r.status === "booked").length})`],
                  ["all", `All (${availability.length})`],
                ] as const).map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => setStatus(k)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium border transition-all",
                      status === k
                        ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow"
                        : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {visible.map((r) => (
                <button
                  key={r.number}
                  disabled={r.status !== "available"}
                  onClick={() => setRoom(r.number)}
                  className={cn(
                    "text-left rounded-xl border p-3 transition-all",
                    r.status === "available" && "border-success/40 bg-success/5 hover:bg-success/15 hover:-translate-y-0.5",
                    r.status === "occupied" && "border-destructive/30 bg-destructive/5 opacity-70 cursor-not-allowed",
                    r.status === "booked" && "border-warning/50 bg-warning/10 opacity-80 cursor-not-allowed",
                    room === r.number && "ring-2 ring-primary",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm">{r.number}</div>
                    {r.status === "available" ? <CheckCircle2 className="size-4 text-success" /> : <XCircle className="size-4 text-destructive" />}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{r.type}</div>
                  <div className="text-[10px] text-muted-foreground">Cap {r.capacity}</div>
                </button>
              ))}
              {visible.length === 0 && (
                <div className="col-span-full rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                  No {status === "all" ? "" : status} rooms for this slot.
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-elegant">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold font-display">Current reservations</h2>
              <p className="mt-1 text-xs text-muted-foreground">{day} · {slot}</p>
            </div>
            <span className="rounded-full bg-warning/15 px-3 py-1 text-xs font-medium text-warning-foreground">{selectedBookings.length} booked</span>
          </div>
          {selectedBookings.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">No rooms are reserved for this day and time slot.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr><th className="pb-3 font-medium">Room</th><th className="pb-3 font-medium">Course</th><th className="pb-3 font-medium">Faculty</th><th className="pb-3 text-right font-medium">Action</th></tr>
                </thead>
                <tbody>
                  {selectedBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-border/60 last:border-0">
                      <td className="py-3 font-semibold">{booking.room}</td>
                      <td className="py-3 text-muted-foreground">{booking.course}</td>
                      <td className="py-3 text-muted-foreground">{booking.faculty}</td>
                      <td className="py-3 text-right">
                        <button onClick={() => cancelBooking(booking.id, booking.room)} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10">
                          <Trash2 className="size-3.5" /> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </FacultyShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
