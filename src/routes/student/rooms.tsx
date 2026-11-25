import { createFileRoute } from "@tanstack/react-router";
import { StudentShell } from "@/components/layout/StudentShell";
import { useData, useMergedRoutine } from "@/lib/data/store";
import { DAYS, TIME_SLOTS } from "@/lib/data/types";
import { todayName, currentSlot } from "@/lib/data/utils";
import { useMemo, useState } from "react";
import { DoorOpen, MapPin, Users, Search, CheckCircle2, XCircle, Clock, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedNumber, SpotlightCard } from "@/components/ui/motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);

  const roomStatus = useMemo(() => {
    const map = new Map<string, { status: Status; classData?: any }>();
    rooms.forEach((r) => map.set(r.number, { status: "available" }));

    routine.forEach((r) => {
      if (r.day === day && r.time === slot && r.room && !r.isBooking) {
        map.set(r.room, { status: "occupied", classData: r });
      }
    });
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
    const known = new Set(rooms.map((r) => r.number));
    routine.forEach((r) => {
      if (r.day === day && r.time === slot && r.room && !known.has(r.room) && !seen.has(r.room)) {
        seen.add(r.room);
        list.push({
          number: r.room,
          type: "Unlisted",
          capacity: "—",
          primaryDept: "—",
          status: "occupied",
          classData: r,
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

  const counts = useMemo(
    () => ({
      total: enriched.length,
      available: enriched.filter((r) => r.status === "available").length,
      occupied: enriched.filter((r) => r.status === "occupied").length,
      booked: enriched.filter((r) => r.status === "booked").length,
    }),
    [enriched],
  );

  const selectedRoomDaySchedule = useMemo(() => {
    if (!selectedRoom) return [];
    return TIME_SLOTS.map((t) => {
      const booking = bookings.find((b) => b.day === day && b.time === t && b.room === selectedRoom.number);
      const cls = routine.find((r) => r.day === day && r.time === t && r.room === selectedRoom.number && !r.isBooking);
      return {
        time: t,
        status: booking ? "booked" : cls ? "occupied" : "available",
        detail: booking || cls,
      };
    });
  }, [selectedRoom, bookings, routine, day]);

  return (
    <StudentShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Live Status</div>
            <h1 className="text-3xl font-bold font-display">Room Availability</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {day} · {slot} · <span className="text-success font-medium">{counts.available} available</span> / {counts.total} total · Click any room for its full day schedule
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Total Rooms" value={counts.total} tone="muted" />
          <MetricCard label="Available" value={counts.available} tone="success" />
          <MetricCard label="Occupied" value={counts.occupied} tone="destructive" />
          <MetricCard label="Booked" value={counts.booked} tone="warning" />
        </div>

        <div className="rounded-2xl border border-border/80 bg-card/90 backdrop-blur-sm p-4 sm:p-5 shadow-elegant space-y-4">
          <div className="grid md:grid-cols-3 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Day</span>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
              >
                {DAYS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Time Slot</span>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                className="h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
              >
                {TIME_SLOTS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="relative flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Search</span>
              <Search className="absolute left-3 top-[calc(50%+7px)] size-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Room number or type…"
                className="h-10 pl-9 pr-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {(
              [
                ["all", `All (${counts.total})`],
                ["available", `Available (${counts.available})`],
                ["occupied", `Occupied (${counts.occupied})`],
                ["booked", `Booked (${counts.booked})`],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-medium border transition-all duration-200",
                  filter === k
                    ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow"
                    : "bg-background/70 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((r, idx) => (
            <RoomCard key={r.number} room={r} index={idx} onSelect={() => setSelectedRoom(r)} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-sm text-muted-foreground rounded-2xl border border-dashed border-border p-10">
              No rooms match your filters.
            </div>
          )}
        </div>
      </div>

      <Dialog open={Boolean(selectedRoom)} onOpenChange={(open) => !open && setSelectedRoom(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <DoorOpen className="size-5 text-primary" />
              Room {selectedRoom?.number}
            </DialogTitle>
            <DialogDescription>
              {selectedRoom?.type} · Capacity {selectedRoom?.capacity} · Schedule for {day}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {selectedRoomDaySchedule.map((item) => (
              <div
                key={item.time}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border p-3 text-xs transition-colors",
                  item.time === slot && "ring-2 ring-primary/40",
                  item.status === "available" && "border-success/30 bg-success/5",
                  item.status === "occupied" && "border-destructive/30 bg-destructive/5",
                  item.status === "booked" && "border-warning/40 bg-warning/10",
                )}
              >
                <div className="flex items-center gap-2 font-mono font-medium">
                  <CalendarDays className="size-3.5 text-muted-foreground" />
                  {item.time}
                </div>
                <div className="text-right truncate max-w-[55%]">
                  {item.status === "available" ? (
                    <span className="font-semibold text-success">Available</span>
                  ) : (
                    <div>
                      <div className="font-semibold text-foreground truncate">{item.detail?.course}</div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {item.detail?.faculty || "TBA"}{" "}
                        {item.detail && "batch" in item.detail && item.detail.batch ? `· ${item.detail.batch}` : ""}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </StudentShell>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "muted" | "success" | "destructive" | "warning";
}) {
  const map = {
    muted: "text-foreground",
    success: "text-success",
    destructive: "text-destructive",
    warning: "text-warning-foreground",
  };
  return (
    <SpotlightCard className="p-4">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={cn("text-2xl font-semibold font-display mt-1.5", map[tone])}>
        <AnimatedNumber value={value} />
      </div>
    </SpotlightCard>
  );
}

function RoomCard({ room, index, onSelect }: { room: any; index: number; onSelect: () => void }) {
  const status = room.status as Status;
  const styles = {
    available: {
      ring: "border-success/40 hover:border-success",
      bg: "bg-success/10",
      text: "text-success",
      label: "Available",
      Icon: CheckCircle2,
    },
    occupied: {
      ring: "border-destructive/40 hover:border-destructive/70",
      bg: "bg-destructive/10",
      text: "text-destructive",
      label: "Occupied",
      Icon: XCircle,
    },
    booked: {
      ring: "border-warning/60 hover:border-warning",
      bg: "bg-warning/20",
      text: "text-warning-foreground",
      label: "Booked",
      Icon: Clock,
    },
  }[status];
  const S = styles.Icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{ animationDelay: `${Math.min(index, 18) * 25}ms` }}
      className={cn(
        "text-left group relative overflow-hidden rounded-2xl border bg-card/90 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant animate-fade-up focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        styles.ring,
      )}
    >
      <div className={cn("absolute top-0 right-0 h-1 w-full", styles.bg)} />
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn("size-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105", styles.bg, styles.text)}>
            <DoorOpen className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold font-display leading-tight truncate">{room.number}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground truncate">{room.primaryDept}</div>
          </div>
        </div>
        <div className={cn("inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0", styles.bg, styles.text)}>
          {status === "available" && <span className="size-1.5 rounded-full bg-success animate-pulse" />}
          <S className="size-3" /> {styles.label}
        </div>
      </div>

      <div className="mt-3 text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-1.5">
          <MapPin className="size-3 shrink-0" /> <span className="truncate">{room.type}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="size-3 shrink-0" /> Capacity {room.capacity}
        </div>
        {room.classData && status === "occupied" && (
          <div className="pt-2 mt-2 border-t border-border/60 text-[11px]">
            <div className="font-medium text-foreground truncate">{room.classData.course}</div>
            <div className="text-muted-foreground truncate">
              {room.classData.batch} · {room.classData.faculty || "—"}
            </div>
          </div>
        )}
        {room.classData && status === "booked" && (
          <div className="pt-2 mt-2 border-t border-border/60 text-[11px]">
            <div className="font-medium text-foreground truncate">Reserved: {room.classData.course}</div>
            <div className="text-muted-foreground truncate">by {room.classData.faculty}</div>
          </div>
        )}
      </div>
    </button>
  );
}
