import { useMemo, useState } from "react";
import { useMergedRoutine } from "@/lib/data/store";
import { DAYS, TIME_SLOTS, DEPARTMENTS, DEPT_NAME } from "@/lib/data/types";
import { sortBatchesCseFirst, todayName, slotStartMin, currentSlot } from "@/lib/data/utils";
import {
  Search,
  Sparkles,
  Calendar as CalendarIcon,
  Filter,
  X,
  MapPin,
  User,
  ArrowUpDown,
  Clock,
  LayoutGrid,
  Table2,
  Layers,
  Users,
  DoorOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Filters = {
  q: string;
  department: string;
  batch: string;
  day: string;
  faculty: string;
  course: string;
  room: string;
  time: string;
};

const INITIAL: Filters = {
  q: "",
  department: "",
  batch: "",
  day: "",
  faculty: "",
  course: "",
  room: "",
  time: "",
};

const DEPT_STYLE: Record<string, string> = {
  CSE: "bg-chart-1/15 text-chart-1 border-chart-1/25",
  EEE: "bg-chart-2/15 text-chart-2 border-chart-2/25",
  BBA: "bg-chart-3/15 text-chart-3 border-chart-3/25",
  ENG: "bg-chart-4/15 text-chart-4 border-chart-4/25",
  ECO: "bg-chart-5/15 text-chart-5 border-chart-5/25",
  SWE: "bg-primary/15 text-primary border-primary/25",
  LAW: "bg-accent text-accent-foreground border-border",
  DSC: "bg-success/15 text-success border-success/25",
  Events: "bg-warning/20 text-warning-foreground border-warning/30",
  Booking: "bg-warning/30 text-warning-foreground border-warning/40",
};

export function RoutineExplorer({ subtitle }: { subtitle?: string }) {
  const routine = useMergedRoutine();
  const [f, setF] = useState<Filters>(INITIAL);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const perPage = 20;
  const nowDay = todayName();
  const nowSlot = currentSlot(TIME_SLOTS);

  const opts = useMemo(() => {
    const uniq = (k: keyof (typeof routine)[number], source: typeof routine) =>
      Array.from(new Set(source.map((r) => r[k] as string).filter(Boolean))).sort();
    const present = new Set(routine.map((r) => r.department));
    const departments = [
      ...DEPARTMENTS.filter((d) => present.has(d.code)).map((d) => d.code),
      ...[...present].filter((p) => !DEPARTMENTS.some((d) => d.code === p)).sort(),
    ];
    const departmentScopedRoutine = f.department ? routine.filter((r) => r.department === f.department) : routine;
    return {
      department: departments,
      batch: sortBatchesCseFirst(uniq("batch", departmentScopedRoutine)),
      faculty: uniq("faculty", departmentScopedRoutine),
      course: uniq("course", departmentScopedRoutine),
      room: uniq("room", departmentScopedRoutine),
    };
  }, [routine, f.department]);

  const filtered = useMemo(() => {
    let out = routine.filter((r) => {
      if (f.department && r.department !== f.department) return false;
      if (f.batch && r.batch !== f.batch) return false;
      if (f.day && r.day !== f.day) return false;
      if (f.faculty && r.faculty !== f.faculty) return false;
      if (f.course && r.course !== f.course) return false;
      if (f.room && r.room !== f.room) return false;
      if (f.time && r.time !== f.time) return false;
      if (f.q) {
        const q = f.q.toLowerCase();
        const hay = `${r.course} ${r.faculty} ${r.room} ${r.batch} ${r.department}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const dayIx = (d: string) => DAYS.indexOf(d as any);
    out = [...out].sort((a, b) => {
      const d = dayIx(a.day) - dayIx(b.day);
      if (d !== 0) return d;
      return slotStartMin(a.time) - slotStartMin(b.time);
    });
    return out;
  }, [routine, f]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const currPage = Math.min(page, pageCount);
  const slice = filtered.slice((currPage - 1) * perPage, currPage * perPage);

  const setFilter = (k: keyof Filters, v: string) => {
    setF((prev) => {
      if (k === "department") {
        return {
          ...prev,
          department: v,
          batch: v !== prev.department && prev.batch ? "" : prev.batch,
        };
      }
      return { ...prev, [k]: v };
    });
    setPage(1);
  };

  const showTodaysRoutine = () => {
    setF({ ...INITIAL, day: todayName(), department: f.department, batch: f.batch });
    setPage(1);
  };

  const activeChips = (Object.entries(f) as [keyof Filters, string][]).filter(([, v]) => v);
  const rowPad = "py-3.5";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card shadow-elegant">
        <div className="absolute inset-0 bg-mesh opacity-60 pointer-events-none" />
        <div className="relative p-4 sm:p-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground">Timetable</div>
            <h1 className="text-2xl sm:text-4xl font-bold font-display mt-1">
              <span className="text-gradient">Central Routine</span>
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1.5 sm:mt-2">
              {subtitle ? subtitle + " · " : ""}
              {total.toLocaleString()} classes ·{" "}
              {activeChips.length > 0
                ? `${activeChips.length} filter${activeChips.length > 1 ? "s" : ""} active`
                : "showing all"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={showTodaysRoutine}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary text-primary-foreground px-4 py-2.5 text-sm font-medium shadow-glow hover:opacity-90 transition-opacity"
            >
              <Sparkles className="size-4" /> Today's Routine
            </button>
          </div>
        </div>
      </div>

      {/* Department & Day quick pills */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap gap-2">
          <Pill active={!f.department} onClick={() => setFilter("department", "")} label="All Departments" />
          {opts.department.map((d) => (
            <Pill
              key={d}
              active={f.department === d}
              onClick={() => setFilter("department", f.department === d ? "" : d)}
              label={d}
              title={DEPT_NAME[d] || d}
              count={routine.filter((r) => r.department === d).length}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mr-1">
            Day
          </span>
          <button
            type="button"
            onClick={() => setFilter("day", "")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-medium border transition-all",
              !f.day
                ? "bg-primary/12 text-primary border-primary/30"
                : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/30",
            )}
          >
            All
          </button>
          {DAYS.map((d) => {
            const isToday = d === nowDay;
            const active = f.day === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setFilter("day", active ? "" : d)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition-all",
                  active
                    ? "bg-primary text-primary-foreground border-transparent shadow-xs"
                    : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/30",
                )}
              >
                {isToday && (
                  <span
                    className={cn(
                      "size-1.5 rounded-full animate-pulse",
                      active ? "bg-white" : "bg-success",
                    )}
                  />
                )}
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border-[1.5px] border-slate-200 dark:border-white/15 bg-card/95 backdrop-blur-sm p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Filter className="size-3.5" />
          </div>
          <h2 className="text-sm font-semibold font-display">Filters</h2>
          {activeChips.length > 0 && (
            <button
              onClick={() => setF(INITIAL)}
              className="ml-auto rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40 flex items-center gap-1 transition-colors"
            >
              <X className="size-3" /> Clear all
            </button>
          )}
        </div>
        <div className="space-y-3">
          <SearchBox value={f.q} onChange={(v) => setFilter("q", v)} />
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-4 lg:grid-cols-7">
          <Select
            label="Department"
            value={f.department}
            onChange={(v) => setFilter("department", v)}
            options={opts.department}
            render={(o) => `${o} — ${DEPT_NAME[o] || o}`}
          />
          <Select label="Batch" value={f.batch} onChange={(v) => setFilter("batch", v)} options={opts.batch} />
          <Select label="Day" value={f.day} onChange={(v) => setFilter("day", v)} options={DAYS as any} />
          <Select label="Time Slot" value={f.time} onChange={(v) => setFilter("time", v)} options={TIME_SLOTS as any} />
          <Select label="Faculty" value={f.faculty} onChange={(v) => setFilter("faculty", v)} options={opts.faculty} />
          <Select label="Course" value={f.course} onChange={(v) => setFilter("course", v)} options={opts.course} />
          <Select
            label="Room"
            value={f.room}
            onChange={(v) => setFilter("room", v)}
            options={opts.room}
            className="col-span-2 sm:col-span-1"
          />
          </div>
        </div>
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-border">
            {activeChips.map(([k, v]) => (
              <button
                key={k}
                onClick={() => setFilter(k, "")}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-[11px] px-2.5 py-1 hover:bg-primary/20 transition-colors"
              >
                <span className="opacity-70 uppercase tracking-wider">{k}</span> {v}
                <X className="size-3" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Container */}
      <div className="overflow-hidden rounded-2xl sm:rounded-3xl border-[1.5px] border-slate-200 dark:border-white/15 bg-card shadow-elegant">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-linear-to-r from-primary/8 via-card to-card px-4 sm:px-5 py-3.5 sm:py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">Academic schedule</p>
            <h2 className="mt-0.5 sm:mt-1 font-display text-base sm:text-lg font-semibold">Class routine</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="font-semibold text-foreground tabular-nums">{total}</span> classes
            </span>
            <div className="hidden md:inline-flex items-center rounded-xl border border-border bg-muted/50 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all",
                  viewMode === "table"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Table2 className="size-3.5" /> Table
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all",
                  viewMode === "cards"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutGrid className="size-3.5" /> Cards
              </button>
            </div>
          </div>
        </div>

        {/* Mobile card list (and desktop Cards view) */}
        <div className={cn(viewMode === "cards" ? "block" : "md:hidden")}>
          {slice.length === 0 ? (
            <div className="px-4 py-14 text-center text-sm text-muted-foreground">
              No classes match these filters.
            </div>
          ) : (
            <div
              className={cn(
                viewMode === "cards"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3.5 sm:p-5"
                  : "divide-y divide-border/70",
              )}
            >
              {slice.map((r) => {
                const isLive = r.day === nowDay && r.time === nowSlot;
                return (
                  <div
                    key={r.id}
                    className={cn(
                      "transition-all",
                      viewMode === "cards"
                        ? "rounded-2xl border border-slate-200 dark:border-white/15 bg-background/60 p-4 space-y-3 hover:border-primary/40 hover:shadow-xs"
                        : "p-3.5 space-y-2",
                      r.isBooking && "bg-warning/10 border-warning/40",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <DayBadge day={r.day} />
                        <DeptBadge dept={r.department} />
                        {isLive && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-success/15 border border-success/30 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-success">
                            <span className="size-1.5 rounded-full bg-success animate-pulse" />
                            Live
                          </span>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-muted-foreground tabular-nums">
                        <Clock className="size-3" /> {r.time}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-sm leading-snug">{r.course}</div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                          {r.faculty || "TBA"}
                        </span>
                        {r.room ? (
                          <span className="inline-flex items-center justify-center rounded-full bg-neutral-900 dark:bg-neutral-800 px-2.5 py-0.5 text-[12px] font-semibold text-white">
                            {r.room}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {r.batch}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={cn(viewMode === "table" ? "hidden md:block overflow-x-auto" : "hidden")}>
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-indigo-50/85 dark:bg-indigo-950/35 border-b border-border/70 text-[13px] text-slate-700 dark:text-slate-200">
              <tr>
                {[
                  ["day", "Day", CalendarIcon],
                  ["time", "Time", Clock],
                  ["department", "Dept", Layers],
                  ["batch", "Batch", Users],
                  ["course", "Course", null],
                  ["faculty", "Faculty", User],
                  ["room", "Room", DoorOpen],
                ].map(([k, label, ColIcon]: any) => (
                  <th key={k} className="px-4 py-3.5 text-left font-semibold whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      {ColIcon ? (
                        <ColIcon className="size-4 text-slate-500 dark:text-slate-400" />
                      ) : (
                        <span className="h-4 w-[2.5px] rounded-full bg-slate-500 dark:bg-slate-400" />
                      )}
                      {label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slice.map((r, i) => {
                const isLive = r.day === nowDay && r.time === nowSlot;
                return (
                <tr
                  key={r.id}
                  className={cn(
                    "group relative z-0 border-t border-border/60 outline-1 -outline-offset-1 outline-transparent transition-[outline-color,background-color] hover:z-10 hover:bg-primary/[0.03] hover:outline-primary/40",
                    i % 2 === 1 && "bg-slate-50/60 dark:bg-white/[0.02]",
                    isLive && "bg-success/[0.04]",
                    r.isBooking && "bg-warning/10 hover:outline-warning/50"
                  )}
                >
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <DayBadge day={r.day} />
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-700 dark:text-slate-200 tabular-nums">
                      <Clock className="size-4 text-slate-500 dark:text-slate-400" />
                      {r.time}
                      {isLive && <span className="size-2 rounded-full bg-success animate-pulse" title="Running now" />}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <DeptBadge dept={r.department} />
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{r.batch}</div>
                  </td>
                  <td className="px-4 py-3.5 font-medium">
                    <div className="flex items-center gap-3">
                      <span className="h-6 w-[3px] rounded-full bg-primary/80 transition-colors group-hover:bg-primary" />
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{r.course}</span>
                        {r.isBooking ? <span className="inline-flex rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warning-foreground">Booking</span> : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {r.faculty ? (
                      <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                        {r.faculty}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {r.room ? (
                      <span className="inline-flex items-center justify-center rounded-full bg-neutral-900 dark:bg-neutral-800 px-3 py-1 text-[13px] font-semibold text-white">
                        {r.room}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </td>
                </tr>
                );
              })}
              {slice.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground text-sm">
                    No classes match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
          <div>
            Page {currPage} of {pageCount} · {total} results
          </div>
          <div className="flex gap-1">
            <PageBtn onClick={() => setPage(1)} disabled={currPage === 1}>
              «
            </PageBtn>
            <PageBtn onClick={() => setPage(currPage - 1)} disabled={currPage === 1}>
              Prev
            </PageBtn>
            <PageBtn onClick={() => setPage(currPage + 1)} disabled={currPage === pageCount}>
              Next
            </PageBtn>
            <PageBtn onClick={() => setPage(pageCount)} disabled={currPage === pageCount}>
              »
            </PageBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageBtn({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      className="px-2.5 py-1 rounded-lg border border-border disabled:opacity-40 hover:bg-card hover:border-primary/40 transition-colors"
    >
      {children}
    </button>
  );
}

function Pill({
  label,
  active,
  onClick,
  count,
  title,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-xs font-medium border transition-all",
        active
          ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow"
          : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
      )}
    >
      {label}
      {count !== undefined && <span className="ml-1.5 opacity-70">{count}</span>}
    </button>
  );
}

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="col-span-2 md:col-span-2 relative block">
      <span className="sr-only">Search</span>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search course, faculty, room, batch…"
        className="w-full h-10 pl-10 pr-9 rounded-xl border border-slate-200 dark:border-white/15 bg-background/80 text-sm transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="size-3.5" />
        </button>
      )}
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  render,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  render?: (o: string) => string;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1 min-w-0", className)}>
      <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-0 h-10 px-2.5 sm:px-3 rounded-xl border border-slate-200 dark:border-white/15 bg-background/80 text-xs sm:text-sm transition-colors hover:border-primary/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {render ? render(o) : o}
          </option>
        ))}
      </select>
    </label>
  );
}

function DayBadge({ day }: { day: string }) {
  const t = todayName() === day;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium border",
        t
          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30"
          : "bg-blue-50/90 text-blue-600 border-blue-200/70 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30"
      )}
    >
      <CalendarIcon className="size-3.5" /> {day}
    </span>
  );
}

export function DeptBadge({ dept }: { dept: string }) {
  const cls = DEPT_STYLE[dept] || "bg-muted text-muted-foreground border-transparent";
  return (
    <span
      title={DEPT_NAME[dept] || dept}
      className={cn("inline-flex px-3 py-1 rounded-full text-[13px] font-semibold border", cls)}
    >
      {dept}
    </span>
  );
}
