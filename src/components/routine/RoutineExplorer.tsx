import { useMemo, useState } from "react";
import { useMergedRoutine } from "@/lib/data/store";
import { DAYS, TIME_SLOTS, DEPARTMENTS, DEPT_NAME } from "@/lib/data/types";
import { todayName, slotStartMin } from "@/lib/data/utils";
import {
  Search,
  Sparkles,
  Calendar as CalendarIcon,
  Filter,
  X,
  Printer,
  MapPin,
  User,
  ArrowUpDown,
  LayoutGrid,
  Rows3,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Filters = {
  q: string;
  department: string;
  batch: string;
  section: string;
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
  section: "",
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
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const perPage = 20;

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
      batch: uniq("batch", departmentScopedRoutine),
      section: uniq("section", departmentScopedRoutine),
      faculty: uniq("faculty", departmentScopedRoutine),
      course: uniq("course", departmentScopedRoutine),
      room: uniq("room", departmentScopedRoutine),
    };
  }, [routine, f.department]);

  const filtered = useMemo(() => {
    let out = routine.filter((r) => {
      if (f.department && r.department !== f.department) return false;
      if (f.batch && r.batch !== f.batch) return false;
      if (f.section && r.section !== f.section) return false;
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
    if (sortKey) {
      out = [...out].sort((a: any, b: any) => {
        const cmp =
          sortKey === "time"
            ? slotStartMin(a.time) - slotStartMin(b.time)
            : sortKey === "day"
              ? dayIx(a.day) - dayIx(b.day)
              : String(a[sortKey]).localeCompare(String(b[sortKey]));
        return sortDir === "asc" ? cmp : -cmp;
      });
    } else {
      out = [...out].sort((a, b) => {
        const d = dayIx(a.day) - dayIx(b.day);
        if (d !== 0) return d;
        return slotStartMin(a.time) - slotStartMin(b.time);
      });
    }
    return out;
  }, [routine, f, sortKey, sortDir]);

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
    setF({ ...INITIAL, day: todayName(), department: f.department, batch: f.batch, section: f.section });
    setPage(1);
  };

  const toggleSort = (k: string) => {
    if (sortKey === k) {
      if (sortDir === "asc") setSortDir("desc");
      else {
        setSortKey("");
        setSortDir("asc");
      }
    } else {
      setSortKey(k);
      setSortDir("asc");
    }
  };

  const activeChips = (Object.entries(f) as [keyof Filters, string][]).filter(([, v]) => v);
  const rowPad = density === "compact" ? "py-2" : "py-3.5";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-elegant">
        <div className="absolute inset-0 bg-mesh opacity-60 pointer-events-none" />
        <div className="relative p-6 sm:p-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Timetable</div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display mt-1">
              <span className="text-gradient">Central Routine</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
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
            <button
              onClick={() => setDensity(density === "compact" ? "comfortable" : "compact")}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm hover:border-primary/40 transition-colors"
            >
              {density === "compact" ? <LayoutGrid className="size-4" /> : <Rows3 className="size-4" />}
              {density === "compact" ? "Comfort" : "Compact"}
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm hover:border-primary/40 transition-colors"
            >
              <Printer className="size-4" /> Print
            </button>
          </div>
        </div>
      </div>

      {/* Department quick pills */}
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

      {/* Filters */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-elegant">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="size-4 text-primary" />
          <h2 className="text-sm font-semibold font-display">Filters</h2>
          {activeChips.length > 0 && (
            <button
              onClick={() => setF(INITIAL)}
              className="ml-auto text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
            >
              <X className="size-3" /> Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SearchBox value={f.q} onChange={(v) => setFilter("q", v)} />
          <Select
            label="Department"
            value={f.department}
            onChange={(v) => setFilter("department", v)}
            options={opts.department}
            render={(o) => `${o} — ${DEPT_NAME[o] || o}`}
          />
          <Select label="Batch" value={f.batch} onChange={(v) => setFilter("batch", v)} options={opts.batch} />
          <Select label="Section" value={f.section} onChange={(v) => setFilter("section", v)} options={opts.section} />
          <Select label="Day" value={f.day} onChange={(v) => setFilter("day", v)} options={DAYS as any} />
          <Select label="Time Slot" value={f.time} onChange={(v) => setFilter("time", v)} options={TIME_SLOTS as any} />
          <Select label="Faculty" value={f.faculty} onChange={(v) => setFilter("faculty", v)} options={opts.faculty} />
          <Select label="Course" value={f.course} onChange={(v) => setFilter("course", v)} options={opts.course} />
          <Select label="Room" value={f.room} onChange={(v) => setFilter("room", v)} options={opts.room} />
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

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-elegant">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 backdrop-blur text-[11px] uppercase tracking-wider text-muted-foreground sticky top-0 z-10">
              <tr>
                {[
                  ["day", "Day"],
                  ["time", "Time"],
                  ["department", "Dept"],
                  ["batch", "Batch"],
                  ["course", "Course"],
                  ["faculty", "Faculty"],
                  ["room", "Room"],
                ].map(([k, label]) => (
                  <th key={k} className="px-4 py-3 text-left font-semibold">
                    <button
                      onClick={() => toggleSort(k)}
                      className={cn(
                        "inline-flex items-center gap-1 hover:text-primary transition-colors",
                        sortKey === k && "text-primary"
                      )}
                    >
                      {label}
                      <ArrowUpDown className="size-3 opacity-50" />
                      {sortKey === k && <span className="text-[9px]">{sortDir === "asc" ? "▲" : "▼"}</span>}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slice.map((r, i) => (
                <tr
                  key={r.id}
                  className={cn(
                    "border-t border-border/70 transition-colors group",
                    i % 2 === 1 && "bg-muted/20",
                    "hover:bg-primary/5",
                    r.isBooking && "bg-warning/10 hover:bg-warning/15"
                  )}
                >
                  <td className={cn("px-4 whitespace-nowrap", rowPad)}>
                    <DayBadge day={r.day} />
                  </td>
                  <td className={cn("px-4 whitespace-nowrap", rowPad)}>
                    <span className="text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                      {r.time}
                    </span>
                  </td>
                  <td className={cn("px-4", rowPad)}>
                    <DeptBadge dept={r.department} />
                  </td>
                  <td className={cn("px-4 text-xs", rowPad)}>{r.batch}</td>
                  <td className={cn("px-4 font-medium", rowPad)}>
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-1 rounded-full bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      {r.course}
                    </div>
                  </td>
                  <td className={cn("px-4 text-xs", rowPad)}>
                    {r.faculty ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="size-6 rounded-full bg-secondary text-secondary-foreground grid place-items-center text-[9px] font-semibold">
                          {r.faculty.slice(0, 2).toUpperCase()}
                        </span>
                        {r.faculty}
                      </span>
                    ) : (
                      <span className="text-muted-foreground inline-flex items-center gap-1">
                        <User className="size-3" /> —
                      </span>
                    )}
                  </td>
                  <td className={cn("px-4", rowPad)}>
                    <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-semibold">
                      <MapPin className="size-3" /> {r.room || "—"}
                    </div>
                  </td>
                </tr>
              ))}
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
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
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
    <label className="col-span-2 md:col-span-2 relative">
      <span className="sr-only">Search</span>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search course, faculty, room, batch…"
        className="w-full h-10 pl-10 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  render,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  render?: (o: string) => string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border",
        t ? "bg-success/20 text-success-foreground border-success/30" : "bg-muted text-muted-foreground border-transparent"
      )}
    >
      <CalendarIcon className="size-3" /> {day}
    </span>
  );
}

export function DeptBadge({ dept }: { dept: string }) {
  const cls = DEPT_STYLE[dept] || "bg-muted text-muted-foreground border-transparent";
  return (
    <span
      title={DEPT_NAME[dept] || dept}
      className={cn("inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold border", cls)}
    >
      {dept}
    </span>
  );
}
