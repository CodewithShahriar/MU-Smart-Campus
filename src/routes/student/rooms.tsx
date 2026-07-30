import { createFileRoute } from "@tanstack/react-router";
import { StudentShell } from "@/components/layout/StudentShell";
import { useData, useMergedRoutine } from "@/lib/data/store";
import { DAYS, TIME_SLOTS } from "@/lib/data/types";
import { todayName, currentSlot } from "@/lib/data/utils";
import { useMemo, useState } from "react";
import { DoorOpen, MapPin, Users, Search, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/student/rooms")({
  head: () => ({
    meta: [
      { title: "Available Rooms · MU Sylhet" },
      { name: "description", content: "Find free classrooms in real time. Filter by day, time slot and room type." },
    ],
  }),
  component: RoomsPage,
});

type Status = "available" | "occupied" | "booked";

function RoomsPage() {
  const rooms = useData((s) => s.rooms);
  const bookings = useData((s) => s.bookings);
  const routine = useMergedRoutine();
  const nowSlot = currentSlot(TIME_SLOTS);
  const today = todayName();
  const defaultDay = DAYS.includes(today as any) ? today : "Sunday";
  const [day, setDay] = useState<string>(defaultDay);
  const [slot, setSlot] = useState<string>(nowSlot || TIME_SLOTS[0]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | Status>("all");

  const roomStatus = useMemo(() => {
    const map = new Map<string, { status: Status; classData?: any }>();
    // Base: available
    rooms.forEach((r) => map.set(r.number, { status: "available" }));

    // Occupied from routine
    routine.forEach((r) => {
      if (r.day === day && r.time === slot && r.room && !r.isBooking) {
        if (map.has(r.room)) map.set(r.room, { status: "occupied", classData: r });
        else map.set(r.room, { status: "occupied", classData: r });
      }
    });
    // Bookings win as "booked"
    bookings.forEach((b) => {
      if (b.day === day && b.time === slot) {
        map.set(b.room, { status: "booked", classData: b });
      }
    });
    return map;
  }, [rooms, routine, bookings, day, slot]);

  const enriched = useMemo(() => {
    const seen = new Set<string>();
    const list = rooms
      .filter((r) => {
        if (seen.has(r.number)) return false;
        seen.add(r.number);
        return true;
      })
      .map((r) => ({ ...r, ...roomStatus.get(r.number)! }));
    // Also include rooms found in routine that aren't in inventory
    const known = new Set(rooms.map((r) => r.number));
    routine.forEach((r) => {
      if (r.day === day && r.time === slot && r.room && !known.has(r.room) && !seen.has(r.room)) {
        seen.add(r.room);
        list.push({
          number: r.room, type: "Unlisted", capacity: "—", primaryDept: "—",
          status: "occupied", classData: r,
        } as any);
      }
    });
    return list;
  }, [rooms, roomStatus, routine, day, slot]);

  const filtered = enriched.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (q && !r.number.toLowerCase().includes(q.toLowerCase()) && !r.type.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const counts = useMemo(() => ({
    total: enriched.length,
    available: enriched.filter((r) => r.status === "available").length,
    occupied: enriched.filter((r) => r.status === "occupied").length,
    booked: enriched.filter((r) => r.status === "booked").length,
  }), [enriched]);

  return (
    <StudentShell>
      <div className="space-y-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Live Status</div>
          <h1 className="text-3xl font-bold font-display">Room Availability</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {day} · {slot} · {counts.available} available / {counts.total} total
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Total Rooms" value={counts.total} tone="muted" />
          <MetricCard label="Available" value={counts.available} tone="success" />
          <MetricCard label="Occupied" value={counts.occupied} tone="destructive" />
          <MetricCard label="Booked" value={counts.booked} tone="warning" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-elegant grid md:grid-cols-4 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Day</span>
            <select value={day} onChange={(e) => setDay(e.target.value)} className="h-10 px-3 rounded-lg border border-border bg-background text-sm">
              {DAYS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Time Slot</span>
            <select value={slot} onChange={(e) => setSlot(e.target.value)} className="h-10 px-3 rounded-lg border border-border bg-background text-sm">
              {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Status</span>
            <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="h-10 px-3 rounded-lg border border-border bg-background text-sm">
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="booked">Booked</option>
            </select>
          </label>
          <label className="relative flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Search</span>
            <Search className="absolute left-3 top-[calc(50%+7px)] size-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Room number or type…" className="h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary" />
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((r) => (
            <RoomCard key={r.number} room={r} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-sm text-muted-foreground rounded-xl border border-dashed border-border p-10">
              No rooms match your filters.
            </div>
          )}
        </div>
      </div>
    </StudentShell>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: number; tone: "muted" | "success" | "destructive" | "warning" }) {
  const map = {
    muted: "text-foreground",
    success: "text-success",
    destructive: "text-destructive",
    warning: "text-warning-foreground",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={cn("text-2xl font-semibold font-display mt-1.5", map[tone])}>{value}</div>
    </div>
  );
}

function RoomCard({ room }: { room: any }) {
  const status = room.status as Status;
  const styles = {
    available: { ring: "border-success/40 hover:border-success", bg: "bg-success/10", text: "text-success", label: "Available", Icon: CheckCircle2 },
    occupied: { ring: "border-destructive/40", bg: "bg-destructive/10", text: "text-destructive", label: "Occupied", Icon: XCircle },
    booked: { ring: "border-warning/60", bg: "bg-warning/20", text: "text-warning-foreground", label: "Booked", Icon: Clock },
  }[status];
  const S = styles.Icon;

  return (
    <div className={cn("group relative overflow-hidden rounded-2xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-elegant", styles.ring)}>
      <div className={cn("absolute top-0 right-0 h-1 w-full", styles.bg)} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("size-9 rounded-lg flex items-center justify-center", styles.bg, styles.text)}>
            <DoorOpen className="size-4" />
          </div>
          <div>
            <div className="font-semibold font-display leading-tight">{room.number}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{room.primaryDept}</div>
          </div>
        </div>
        <div className={cn("inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md", styles.bg, styles.text)}>
          <S className="size-3" /> {styles.label}
        </div>
      </div>

      <div className="mt-3 text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-1.5"><MapPin className="size-3" /> {room.type}</div>
        <div className="flex items-center gap-1.5"><Users className="size-3" /> Capacity {room.capacity}</div>
        {room.classData && status === "occupied" && (
          <div className="pt-2 mt-2 border-t border-border/60 text-[11px]">
            <div className="font-medium text-foreground truncate">{room.classData.course}</div>
            <div className="text-muted-foreground">{room.classData.batch} · {room.classData.faculty || "—"}</div>
          </div>
        )}
        {room.classData && status === "booked" && (
          <div className="pt-2 mt-2 border-t border-border/60 text-[11px]">
            <div className="font-medium text-foreground truncate">Reserved: {room.classData.course}</div>
            <div className="text-muted-foreground">by {room.classData.faculty}</div>
          </div>
        )}
      </div>
    </div>
  );
}
