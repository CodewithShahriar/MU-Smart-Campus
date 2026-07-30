import type { ClassEntry, RoomInfo } from "./types";

export function normalizeRoom(raw: string): string {
  if (!raw) return "";
  let r = raw.trim().replace(/_+$/g, "");
  // Strip trailing .0 from Excel float format
  if (/^\d+\.0+$/.test(r)) r = r.split(".")[0];
  return r;
}

/** Canonical department resolution across the messy CSV inputs. */
export function resolveDepartment(deptCsv: string, batch: string, course: string): string {
  const b = (batch || "").trim().toUpperCase();
  const d = (deptCsv || "").trim().toUpperCase();
  const c = (course || "").trim().toUpperCase();

  if (/CONTEST|WORKSHOP|ACM/.test(b)) return "Events";
  // English department courses (taught across batches)
  if (/^(P\s*)?ENG(\b|-|\s|$)/.test(c)) return "ENG";

  if (b.startsWith("DSE") || b.startsWith("DSC")) return "DSC";
  if (b.startsWith("CSE")) return "CSE";
  if (b.startsWith("EEE")) return "EEE";
  if (b.startsWith("BBA")) return "BBA";
  if (b.startsWith("BSS")) return "ECO";
  if (b.startsWith("SWE")) return "SWE";
  if (b.startsWith("LAW")) return "LAW";

  if (d.startsWith("BBA")) return "BBA";
  if (d.startsWith("LAW")) return "LAW";
  if (d.startsWith("ECO")) return "ECO";
  // EEE-sheet rows with numeric semester batches ("6th(32)") are Software Engineering
  if (d.startsWith("EEE")) return /^[0-9]/.test(b) ? "SWE" : "EEE";
  if (d) return d;
  return "Other";
}

/** Derive department code from batch string, e.g. "CSE-58A(47)" -> "CSE" */
export function deriveDepartment(batch: string, fallback = ""): string {
  return resolveDepartment(fallback, batch, "");
}

export function deriveSection(batch: string): string {
  // Extract letters after digits, e.g. CSE-58A(47) -> "A", CSE-58B+I(45) -> "B+I"
  const m = batch.match(/\d+([A-Z](?:\+[A-Z])*)/);
  return m ? m[1] : "-";
}

export function cleanBatch(batch: string): string {
  return batch.replace(/\s+/g, " ").trim();
}

export function parseRoutineCSV(rows: Array<Record<string, string>>): ClassEntry[] {
  const out: ClassEntry[] = [];
  rows.forEach((r, i) => {
    const day = (r.Day || "").trim();
    if (!day) return;
    const batch = cleanBatch(r["Batch/Section"] || "");
    const time = (r.Time || "").trim();
    const course = (r.Course || "").trim();
    const room = normalizeRoom(r.Room || "");
    const faculty = (r.Faculty || "").trim().replace(/_+$/g, "");
    const deptCsv = (r.Department || "").trim();
    const department = resolveDepartment(deptCsv, batch, course);
    out.push({
      id: `r-${i}`,
      day,
      department,
      batch,
      section: deriveSection(batch),
      time,
      course,
      room,
      faculty,
    });
  });
  return out;
}

export function parseRoomsCSV(rows: Array<Record<string, string>>): RoomInfo[] {
  const out: RoomInfo[] = [];
  rows.forEach((r) => {
    const nums = (r["Room Numbers"] || "").split(",").map((s) => s.trim()).filter(Boolean);
    nums.forEach((n) => {
      out.push({
        number: normalizeRoom(n),
        type: (r["Room Type"] || "").trim(),
        capacity: (r.Capacity || "").trim(),
        primaryDept: (r["Primary Dept"] || "").trim(),
      });
    });
  });
  return out;
}

export function todayName(): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date().getDay()];
}

/** Convert a slot to minutes since midnight (start) */
export function slotStartMin(slot: string): number {
  const m = slot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return 0;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const p = m[3].toUpperCase();
  if (p === "PM" && h !== 12) h += 12;
  if (p === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

export function currentSlot(slots: readonly string[]): string | null {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  for (const s of slots) {
    const start = slotStartMin(s);
    // slots are 90 min
    if (nowMin >= start && nowMin < start + 90) return s;
  }
  return null;
}
