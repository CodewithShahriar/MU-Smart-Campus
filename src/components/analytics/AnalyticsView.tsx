import { useMemo } from "react";
import { useData, useMergedRoutine } from "@/lib/data/store";
import { DAYS, TIME_SLOTS, DEPT_NAME } from "@/lib/data/types";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from "recharts";
import { Activity, TrendingUp, Building2, Clock, Flame, Snowflake, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PALETTE = ["#2563eb", "#0ea5e9", "#1d4ed8", "#38bdf8", "#0891b2", "#60a5fa", "#0369a1", "#7dd3fc"];

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--foreground)",
};

export function AnalyticsView() {
  const rooms = useData((s) => s.rooms);
  const routine = useMergedRoutine();

  const stats = useMemo(() => {
    const totalRoomsInventory = new Set(rooms.map((r) => r.number)).size;
    const roomsInUse = new Set(routine.map((r) => r.room).filter(Boolean));
    const capacityAcross = Math.max(1, totalRoomsInventory * DAYS.length * TIME_SLOTS.length);

    const roomCount = new Map<string, number>();
    routine.forEach((r) => {
      if (!r.room) return;
      roomCount.set(r.room, (roomCount.get(r.room) || 0) + 1);
    });
    // Include inventory rooms that are never used
    rooms.forEach((r) => {
      if (r.number && !roomCount.has(r.number)) roomCount.set(r.number, 0);
    });

    const sortedRooms = [...roomCount.entries()].sort((a, b) => b[1] - a[1]);
    const maxCount = sortedRooms[0]?.[1] || 1;
    const mostUsed = sortedRooms.slice(0, 8).map(([room, count]) => ({ room, count }));
    const leastUsed = [...sortedRooms]
      .sort((a, b) => a[1] - b[1])
      .slice(0, 8)
      .map(([room, count]) => ({ room, count }));

    const deptCount = new Map<string, number>();
    routine.forEach((r) => deptCount.set(r.department, (deptCount.get(r.department) || 0) + 1));
    const deptData = [...deptCount.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const dayCount = DAYS.map((d) => ({ day: d.slice(0, 3), classes: routine.filter((r) => r.day === d).length }));
    const timeCount = TIME_SLOTS.map((t) => ({
      time: t.split(" - ")[0],
      classes: routine.filter((r) => r.time === t).length,
    }));

    const utilization = Math.round((routine.length / capacityAcross) * 100);

    return {
      totalRooms: totalRoomsInventory,
      roomsInUse: roomsInUse.size,
      totalClasses: routine.length,
      utilization,
      mostUsed,
      leastUsed,
      maxCount,
      deptData,
      dayCount,
      timeCount,
      peakSlot: [...timeCount].sort((a, b) => b.classes - a.classes)[0],
      quietSlot: [...timeCount].sort((a, b) => a.classes - b.classes)[0],
      busiestDay: [...dayCount].sort((a, b) => b.classes - a.classes)[0],
    };
  }, [rooms, routine]);

  return (
    <div className="space-y-7">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-elegant">
        <div className="absolute inset-0 bg-mesh opacity-70 pointer-events-none" />
        <div className="relative p-6 sm:p-8">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Insights</div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display mt-1">
            <span className="text-gradient">Room Utilization Analytics</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-xl">
            Live, data-driven view of {stats.totalClasses.toLocaleString()} scheduled classes across{" "}
            {stats.totalRooms} rooms, {DAYS.length} days and {TIME_SLOTS.length} time slots.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI icon={Building2} label="Total Rooms" value={stats.totalRooms} sub={`${stats.roomsInUse} in use`} />
        <KPI
          icon={Activity}
          label="Scheduled Classes"
          value={stats.totalClasses.toLocaleString()}
          sub={`Busiest: ${stats.busiestDay?.day}`}
        />
        <KPI icon={TrendingUp} label="Utilization" value={`${stats.utilization}%`} progress={stats.utilization} />
        <KPI
          icon={Clock}
          label="Peak Slot"
          value={stats.peakSlot?.time || "—"}
          sub={`${stats.peakSlot?.classes || 0} classes`}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Panel title="Day-wise Class Load" hint="Classes scheduled per weekday">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.dayCount}>
              <defs>
                <linearGradient id="barBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.4 }} contentStyle={tooltipStyle} />
              <Bar dataKey="classes" fill="url(#barBlue)" radius={[10, 10, 0, 0]} maxBarSize={54} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Peak Hours" hint="Load distribution across time slots">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={stats.timeCount}>
              <defs>
                <linearGradient id="areaBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="classes" stroke="#0284c7" strokeWidth={3} fill="url(#areaBlue)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Department-wise Usage" hint="Share of total scheduled classes">
          <div className="grid sm:grid-cols-2 gap-4 items-center">
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={stats.deptData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={92}
                  paddingAngle={3}
                  stroke="none"
                >
                  {stats.deptData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <ul className="space-y-1.5">
              {stats.deptData.map((d, i) => (
                <li key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="size-2.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                  <span className="font-semibold w-10">{d.name}</span>
                  <span className="text-muted-foreground truncate flex-1">{DEPT_NAME[d.name] || ""}</span>
                  <span className="font-medium tabular-nums">{d.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        <Panel title="Most Used Rooms" hint="Top 8 rooms by scheduled classes">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.mostUsed} layout="vertical" margin={{ left: 10 }}>
              <defs>
                <linearGradient id="barBlueH" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1d4ed8" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="room" tick={{ fontSize: 11 }} width={64} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.4 }} contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="url(#barBlueH)" radius={[0, 10, 10, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Most vs Least used — matched list design */}
      <div className="grid md:grid-cols-2 gap-5">
        <RoomList
          title="Most Used Rooms"
          icon={Flame}
          tone="hot"
          rooms={stats.mostUsed}
          max={stats.maxCount}
          caption="Highest demand — expect conflicts here."
        />
        <RoomList
          title="Least Used Rooms"
          icon={Snowflake}
          tone="cold"
          rooms={stats.leastUsed}
          max={stats.maxCount}
          caption="Plenty of free capacity — ideal for extra classes."
        />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Highlight
          icon={ArrowUpRight}
          label="Peak Slot"
          value={stats.peakSlot?.time || "—"}
          text={`${stats.peakSlot?.classes || 0} classes scheduled — the busiest window of the week.`}
          tone="hot"
        />
        <Highlight
          icon={ArrowDownRight}
          label="Quiet Slot"
          value={stats.quietSlot?.time || "—"}
          text={`Only ${stats.quietSlot?.classes || 0} classes scheduled — best time to reserve a room.`}
          tone="cold"
        />
      </div>
    </div>
  );
}

function RoomList({
  title,
  icon: Icon,
  tone,
  rooms,
  max,
  caption,
}: {
  title: string;
  icon: any;
  tone: "hot" | "cold";
  rooms: { room: string; count: number }[];
  max: number;
  caption: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-elegant">
      <div className="flex items-center gap-2 mb-1">
        <span
          className={cn(
            "size-8 rounded-xl grid place-items-center",
            tone === "hot" ? "bg-primary/15 text-primary" : "bg-success/15 text-success"
          )}
        >
          <Icon className="size-4" />
        </span>
        <h3 className="text-sm font-semibold font-display">{title}</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{caption}</p>
      <ul className="space-y-2.5">
        {rooms.map((r) => (
          <li key={r.room} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold">Room {r.room}</span>
              <span className="text-muted-foreground tabular-nums">{r.count} classes</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full", tone === "hot" ? "bg-gradient-primary" : "bg-success/70")}
                style={{ width: `${Math.max(3, (r.count / Math.max(1, max)) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Highlight({
  icon: Icon,
  label,
  value,
  text,
  tone,
}: {
  icon: any;
  label: string;
  value: string;
  text: string;
  tone: "hot" | "cold";
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-elegant">
      <div
        className={cn(
          "absolute -right-10 -top-10 size-40 rounded-full blur-3xl opacity-40",
          tone === "hot" ? "bg-primary/40" : "bg-success/40"
        )}
      />
      <div className="relative">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <Icon className="size-4 text-primary" /> {label}
        </div>
        <div className="text-4xl font-bold font-display text-gradient mt-2">{value}</div>
        <p className="text-sm text-muted-foreground mt-2">{text}</p>
      </div>
    </div>
  );
}

function KPI({
  icon: Icon,
  label,
  value,
  sub,
  progress,
}: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  progress?: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 hover:shadow-elegant hover:-translate-y-0.5 transition-all">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <span className="size-8 rounded-xl bg-primary/10 grid place-items-center">
          <Icon className="size-4 text-primary" />
        </span>
      </div>
      <div className="text-2xl font-semibold font-display mt-2">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      {progress !== undefined && (
        <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-2.5">
          <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${Math.min(100, progress)}%` }} />
        </div>
      )}
    </div>
  );
}

function Panel({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-elegant">
      <div className="mb-3">
        <h3 className="text-sm font-semibold font-display">{title}</h3>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  );
}
