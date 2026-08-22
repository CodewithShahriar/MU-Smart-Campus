import { createFileRoute } from "@tanstack/react-router";
import { FacultyShell } from "@/components/layout/FacultyShell";
import { useData, useMergedRoutine } from "@/lib/data/store";
import { DAYS, TIME_SLOTS, DEPT_NAME } from "@/lib/data/types";
import { Fragment, useMemo, useState } from "react";
import { Search, Pencil, Save, X, Filter } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/faculty/manage")({
  head: () => ({
    meta: [
      { title: "Manage Routine · Faculty" },
      { name: "description", content: "Edit any class in the central routine — changes appear instantly for students." },
    ],
  }),
  component: ManagePage,
});

function ManagePage() {
  const routine = useMergedRoutine();
  const editEntry = useData((s) => s.editEntry);
  const [q, setQ] = useState("");
  const [dayF, setDayF] = useState("");
  const [deptF, setDeptF] = useState("");
  const [batchF, setBatchF] = useState("");
  const [sectionF, setSectionF] = useState("");
  const [facultyF, setFacultyF] = useState("");
  const [timeF, setTimeF] = useState("");
  const [roomF, setRoomF] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<any>({});

  const opts = useMemo(() => {
    const uniq = (k: "department" | "batch" | "section" | "faculty" | "room") =>
      Array.from(new Set(routine.filter((r) => !r.isBooking).map((r) => r[k]).filter(Boolean))).sort();
    return {
      department: uniq("department"),
      batch: uniq("batch"),
      section: uniq("section"),
      faculty: uniq("faculty"),
      room: uniq("room"),
    };
  }, [routine]);

  const filtered = useMemo(() => {
    return routine.filter((r) => {
      if (r.isBooking) return false;
      if (dayF && r.day !== dayF) return false;
      if (deptF && r.department !== deptF) return false;
      if (batchF && r.batch !== batchF) return false;
      if (sectionF && r.section !== sectionF) return false;
      if (facultyF && r.faculty !== facultyF) return false;
      if (timeF && r.time !== timeF) return false;
      if (roomF && r.room !== roomF) return false;
      if (q) {
        const h = `${r.course} ${r.faculty} ${r.room} ${r.batch} ${r.department}`.toLowerCase();
        if (!h.includes(q.toLowerCase())) return false;
      }
      return true;
    }).slice(0, 200);
  }, [routine, q, dayF, deptF, batchF, sectionF, facultyF, timeF, roomF]);

  const startEdit = (r: any) => {
    setEditing(r.id);
    setDraft({ ...r });
  };
  const save = () => {
    if (!editing) return;
    // conflict detection
    const conflict = routine.find((x) =>
      x.id !== editing && x.day === draft.day && x.time === draft.time && x.room === draft.room && x.room
    );
    editEntry(editing, {
      course: draft.course,
      faculty: draft.faculty,
      room: draft.room,
      day: draft.day,
      time: draft.time,
      department: draft.department,
      batch: draft.batch,
      section: draft.section,
    });
    if (conflict) toast.warning(`Saved, but Room ${draft.room} conflicts with ${conflict.course} (${conflict.batch})`);
    else toast.success("Routine updated — students see it instantly");
    setEditing(null);
  };

  const activeCount = [q, dayF, deptF, batchF, sectionF, facultyF, timeF, roomF].filter(Boolean).length;
  const liveConflicts = useMemo(() => {
    if (!editing || !draft.day || !draft.time) return { room: undefined, faculty: undefined };

    const sameSlot = routine.filter((entry) => entry.id !== editing && entry.day === draft.day && entry.time === draft.time);
    const room = draft.room?.trim()
      ? sameSlot.find((entry) => entry.room?.trim() === draft.room.trim())
      : undefined;
    const faculty = draft.faculty?.trim()
      ? sameSlot.find((entry) => entry.faculty?.trim().toLowerCase() === draft.faculty.trim().toLowerCase())
      : undefined;

    return { room, faculty };
  }, [routine, editing, draft]);

  const clearAll = () => {
    setQ(""); setDayF(""); setDeptF(""); setBatchF(""); setSectionF(""); setFacultyF(""); setTimeF(""); setRoomF("");
  };

  return (
    <FacultyShell>
      <div className="space-y-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Editor</div>
          <h1 className="text-3xl font-bold font-display">Manage Routine</h1>
          <p className="text-muted-foreground text-sm mt-1">Search, edit, and instantly publish changes.</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-elegant space-y-3">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-primary" />
            <h2 className="text-sm font-semibold font-display">Filters</h2>
            {activeCount > 0 && (
              <button onClick={clearAll} className="ml-auto text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1">
                <X className="size-3" /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <label className="relative col-span-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search course, faculty, room, batch…" className="w-full h-10 pl-10 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </label>
            <Pick label="Department" value={deptF} onChange={setDeptF} options={opts.department} render={(o) => `${o} — ${DEPT_NAME[o] || o}`} />
            <Pick label="Batch" value={batchF} onChange={setBatchF} options={opts.batch} />
            <Pick label="Section" value={sectionF} onChange={setSectionF} options={opts.section} />
            <Pick label="Faculty" value={facultyF} onChange={setFacultyF} options={opts.faculty} />
            <Pick label="Day" value={dayF} onChange={setDayF} options={DAYS as any} />
            <Pick label="Time Slot" value={timeF} onChange={setTimeF} options={TIME_SLOTS as any} />
            <Pick label="Room" value={roomF} onChange={setRoomF} options={opts.room} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-elegant">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-3 text-left">Day</th>
                  <th className="px-3 py-3 text-left">Time</th>
                  <th className="px-3 py-3 text-left">Dept</th>
                  <th className="px-3 py-3 text-left">Batch</th>
                  <th className="px-3 py-3 text-left">Section</th>
                  <th className="px-3 py-3 text-left">Course</th>
                  <th className="px-3 py-3 text-left">Faculty</th>
                  <th className="px-3 py-3 text-left">Room</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const isEdit = editing === r.id;
                  return (
                    <Fragment key={r.id}>
                    <tr className="border-t border-border">
                      {isEdit ? (
                        <>
                          <td className="p-2"><select value={draft.day} onChange={(e) => setDraft({ ...draft, day: e.target.value })} className="h-9 px-2 rounded-md border border-border bg-background text-xs w-full">{DAYS.map((d) => <option key={d}>{d}</option>)}</select></td>
                          <td className="p-2"><select value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} className="h-9 px-2 rounded-md border border-border bg-background text-xs w-full">{TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}</select></td>
                          <td className="p-2"><input value={draft.department} onChange={(e) => setDraft({ ...draft, department: e.target.value })} className="h-9 px-2 rounded-md border border-border bg-background text-xs w-20" /></td>
                          <td className="p-2"><input value={draft.batch} onChange={(e) => setDraft({ ...draft, batch: e.target.value })} className="h-9 px-2 rounded-md border border-border bg-background text-xs w-32" /></td>
                          <td className="p-2"><input value={draft.section} onChange={(e) => setDraft({ ...draft, section: e.target.value })} className="h-9 px-2 rounded-md border border-border bg-background text-xs w-16" /></td>
                          <td className="p-2"><input value={draft.course} onChange={(e) => setDraft({ ...draft, course: e.target.value })} className="h-9 px-2 rounded-md border border-border bg-background text-xs w-32" /></td>
                          <td className="p-2"><input value={draft.faculty} onChange={(e) => setDraft({ ...draft, faculty: e.target.value })} className="h-9 px-2 rounded-md border border-border bg-background text-xs w-24" /></td>
                          <td className="p-2"><input value={draft.room} onChange={(e) => setDraft({ ...draft, room: e.target.value })} className="h-9 px-2 rounded-md border border-border bg-background text-xs w-20" /></td>
                          <td className="p-2 whitespace-nowrap">
                            <button onClick={save} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-primary text-primary-foreground"><Save className="size-3" /> Save</button>
                            <button onClick={() => setEditing(null)} className="ml-1 inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-border"><X className="size-3" /></button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-3 py-2.5">{r.day}</td>
                          <td className="px-3 py-2.5 text-xs font-mono whitespace-nowrap">{r.time}</td>
                          <td className="px-3 py-2.5"><span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">{r.department}</span></td>
                          <td className="px-3 py-2.5 text-xs">{r.batch}</td>
                          <td className="px-3 py-2.5 text-xs">{r.section}</td>
                          <td className="px-3 py-2.5 font-medium">{r.course}</td>
                          <td className="px-3 py-2.5 text-xs">{r.faculty || "—"}</td>
                          <td className="px-3 py-2.5 text-xs">{r.room || "—"}</td>
                          <td className="px-3 py-2.5 text-right">
                            <button onClick={() => startEdit(r)} className="inline-flex items-center gap-1 text-xs text-primary hover:underline"><Pencil className="size-3" /> Edit</button>
                          </td>
                        </>
                      )}
                    </tr>
                    {isEdit && (liveConflicts.room || liveConflicts.faculty) && (
                      <tr className="border-t border-warning/30 bg-warning/10">
                        <td colSpan={9} className="px-3 py-2 text-xs text-warning-foreground">
                          <span className="font-semibold">Conflict warning:</span>{" "}
                          {liveConflicts.room ? `Room ${draft.room} is already used by ${liveConflicts.room.course} (${liveConflicts.room.batch})` : ""}
                          {liveConflicts.room && liveConflicts.faculty ? " • " : ""}
                          {liveConflicts.faculty ? `${draft.faculty} is already assigned to ${liveConflicts.faculty.course} (${liveConflicts.faculty.batch})` : ""}
                          {" "}at this day and time.
                        </td>
                      </tr>
                    )}
                    </Fragment>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={9} className="text-center text-muted-foreground py-10 text-sm">No entries match.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 text-xs text-muted-foreground border-t border-border bg-muted/20">
            Showing {filtered.length} entries (first 200). Refine with search or day filter.
          </div>
        </div>
      </div>
    </FacultyShell>
  );
}

function Pick({ label, value, onChange, options, render }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[]; render?: (o: string) => string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
        <option value="">All</option>
        {options.map((o) => <option key={o} value={o}>{render ? render(o) : o}</option>)}
      </select>
    </label>
  );
}
