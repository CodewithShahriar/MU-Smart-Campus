import { useEffect, useState } from "react";

export type CourseOffer = {
  id: string;
  code: string;
  title: string;
  dept?: string;
  credits?: string;
  semester?: string;
  instructor?: string;
  batch?: string;
  section?: string;
  note?: string;
};

const LOCAL_KEY = "course_offers_local_v1";

function groupKey(offer: Pick<CourseOffer, "batch" | "section" | "semester">) {
  return [offer.batch, offer.section, offer.semester].map((value) => value?.trim() || "").join("|");
}

function parseCSV(text: string): CourseOffer[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  // If the file looks like a comma-separated CSV, parse with headers
  if (text.includes(",")) {
    const headers = lines[0].split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map(h => h.replace(/(^\"|\"$)/g, "").trim());
    const rows = lines.slice(1);
    // if header row has multiple columns, treat as CSV
    if (headers.length > 1) {
      return rows.map((r, idx) => {
        const cols = r.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map(c => c.replace(/(^\"|\"$)/g, "").trim());
        const obj: any = { id: `csv-${idx}-${Date.now()}` };
        headers.forEach((h, i) => (obj[h] = cols[i] ?? ""));
        return {
          id: obj.id,
          code: obj.Code || obj.code || "",
          title: obj.Title || obj.title || "",
          dept: obj.Dept || obj.department || obj.dept || "",
          credits: obj.Credits || obj.credits || "",
          semester: obj.Semester || obj.semester || "",
          instructor: obj.Instructor || obj.instructor || "",
          note: obj.Note || obj.note || "",
        } as CourseOffer;
      });
    }
  }

  // Fallback parser for free-text / Excel-export formats
  const out: CourseOffer[] = [];
  let currentBatch = "";
  let currentSection = "";
  let currentSemester = "";

  for (const line of lines) {
    // skip obvious headers and totals, but preserve batch/section headers
    if (/^total\s*=|^total\b|^code\b|course offer|course list|^text\b/i.test(line)) continue;

    const headerMatch = line.match(/^(\d{2,3})\s*([A-Z+]+)?\s*(.*)$/i);
    const courseMatch = line.match(/^(\d+)\s+([A-Z]{2,}\s*\d{2,4}[A-Z]?)(.*?)(\d+(?:\.\d+)?)\s*$/);

    if (headerMatch && !courseMatch) {
      currentBatch = headerMatch[1];
      currentSection = (headerMatch[2] || "").trim();
      const maybeSemester = headerMatch[3].trim();
      if (maybeSemester && !/^\d+\s/.test(maybeSemester)) {
        currentSemester = maybeSemester;
      }
      continue;
    }

    if (!courseMatch) continue;

    const code = courseMatch[2].trim();
    const credits = courseMatch[4];
    const title = courseMatch[3].trim().replace(/^[-:\s]+/, "");
    if (!title) continue;

    out.push({
      id: `txt-${out.length}-${Date.now()}`,
      code,
      title,
      credits,
      semester: currentSemester || undefined,
      batch: currentBatch || undefined,
      section: currentSection || undefined,
    });
  }
  return out;
}

export function useCourseOffers() {
  const [offers, setOffers] = useState<CourseOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/data/course_offers.csv");
        if (!res.ok) throw new Error("no csv");
        const txt = await res.text();
        const parsed = parseCSV(txt);
        const local = localStorage.getItem(LOCAL_KEY);
        const localArr: CourseOffer[] = local ? JSON.parse(local) : [];
        const localGroups = new Set(localArr.map(groupKey));
        const merged = [...localArr, ...parsed.filter((offer) => !localGroups.has(groupKey(offer)))];
        if (mounted) setOffers(merged);
      } catch (err) {
        // fallback to local only
        const local = localStorage.getItem(LOCAL_KEY);
        const localArr: CourseOffer[] = local ? JSON.parse(local) : [];
        if (mounted) setOffers(localArr);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  function persistLocal(next: CourseOffer[]) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
    setOffers(next);
  }

  function addOffer(o: Partial<CourseOffer>) {
    const next = [{ id: `user-${Date.now()}`, code: o.code || "", title: o.title || "", dept: o.dept || "", credits: o.credits || "", semester: o.semester || "", instructor: o.instructor || "", batch: o.batch || "", section: o.section || "", note: o.note || "" }, ...offers];
    persistLocal(next);
  }

  function updateOffer(id: string, patch: Partial<CourseOffer>) {
    const next = offers.map((o) => (o.id === id ? { ...o, ...patch } : o));
    persistLocal(next);
  }

  function replaceOfferGroup(
    group: Pick<CourseOffer, "batch" | "section" | "semester">,
    courses: Array<Pick<CourseOffer, "code" | "title" | "credits">>,
  ) {
    const key = groupKey(group);
    const createdAt = Date.now();
    const replacement = courses.map((course, index) => ({
      id: `group-${createdAt}-${index}`,
      code: course.code.trim(),
      title: course.title.trim(),
      credits: course.credits.trim(),
      batch: group.batch?.trim() || "",
      section: group.section?.trim() || "",
      semester: group.semester?.trim() || "",
    }));
    persistLocal([...replacement, ...offers.filter((offer) => groupKey(offer) !== key)]);
  }

  function removeOffer(id: string) {
    const next = offers.filter((o) => o.id !== id);
    persistLocal(next);
  }

  function importFromCSV(text: string) {
    const parsed = parseCSV(text);
    // Put imported at beginning and persist as local
    const next = [...parsed, ...offers];
    persistLocal(next);
  }

  return { offers, loading, addOffer, updateOffer, removeOffer, importFromCSV, replaceOfferGroup };
}
