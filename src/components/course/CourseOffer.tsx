import React, { useMemo, useState } from "react";
import { useCourseOffers, CourseOffer as CO } from "@/lib/data/courseOffers";
import { sortBatchesCseFirst } from "@/lib/data/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Printer, Trash2 } from "lucide-react";

type CourseRow = Pick<CO, "code" | "title" | "credits">;
type CourseGroup = { batch: string; semester: string; section: string };

const emptyCourseRow = (): CourseRow => ({ code: "", title: "", credits: "" });

export function CourseOffer({ isFaculty = false }: { isFaculty?: boolean }) {
  const { offers, loading, importFromCSV, replaceOfferGroup } = useCourseOffers();
  const [query, setQuery] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("All");
  const [selectedBatch, setSelectedBatch] = useState("All Batches");
  const [selectedSection, setSelectedSection] = useState("All Sections");
  const [isAddingList, setIsAddingList] = useState(false);
  const [groupForm, setGroupForm] = useState<CourseGroup>({ batch: "", semester: "", section: "" });
  const [courseRows, setCourseRows] = useState<CourseRow[]>([emptyCourseRow()]);

  const visibleOffers = useMemo(
    () => offers.filter((offer) => {
      const batchNumber = Number.parseInt(offer.batch?.trim() || "", 10);
      return !Number.isInteger(batchNumber) || batchNumber < 33 || batchNumber > 36;
    }),
    [offers],
  );

  const batches = useMemo(() => {
    const values = new Set<string>();
    visibleOffers.forEach((offer) => {
      if (offer.batch?.trim()) values.add(offer.batch.trim());
    });
    return ["All Batches", ...sortBatchesCseFirst(Array.from(values))];
  }, [visibleOffers]);

  const sections = useMemo(() => {
    const values = new Set<string>();
    visibleOffers.forEach((offer) => {
      if (offer.section?.trim()) values.add(offer.section.trim());
    });
    return ["All Sections", ...Array.from(values)];
  }, [visibleOffers]);

  const semesters = useMemo(() => {
    const values = new Set<string>();
    visibleOffers.forEach((offer) => {
      if (offer.semester?.trim()) values.add(offer.semester.trim());
    });
    return ["All", ...Array.from(values)];
  }, [visibleOffers]);

  const filtered = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    return visibleOffers.filter((offer) => {
      const searchText = (offer.code + " " + offer.title + " " + (offer.instructor || "") + " " + (offer.dept || "") + " " + (offer.batch || "") + " " + (offer.section || "")).toLowerCase();
      const matchesQuery = !lowered || searchText.includes(lowered);
      const matchesSemester = selectedSemester === "All" || offer.semester === selectedSemester;
      const matchesBatch = selectedBatch === "All Batches" || offer.batch?.trim() === selectedBatch;
      const matchesSection = selectedSection === "All Sections" || offer.section?.trim() === selectedSection;
      return matchesQuery && matchesSemester && matchesBatch && matchesSection;
    });
  }, [visibleOffers, query, selectedSemester, selectedBatch, selectedSection]);

  // Preserve the source CSV's grouping: e.g. "58 A 4---2".
  const offerGroups = useMemo(() => {
    const groups = new Map<string, { batch: string; section: string; semester: string; offers: CO[] }>();
    filtered.forEach((offer) => {
      const batch = offer.batch?.trim() || "";
      const section = offer.section?.trim() || "";
      const semester = offer.semester?.trim() || "";
      const key = `${batch}|${section}|${semester}`;
      const group = groups.get(key) ?? { batch, section, semester, offers: [] };
      group.offers.push(offer);
      groups.set(key, group);
    });

    return Array.from(groups.values()).sort((first, second) => {
      const firstLabel = `${first.batch} ${first.section} ${first.semester}`;
      const secondLabel = `${second.batch} ${second.section} ${second.semester}`;
      return firstLabel.localeCompare(secondLabel, undefined, { numeric: true, sensitivity: "base" });
    });
  }, [filtered]);

  const shownCount = filtered.length;
  const tableColumns = "grid-cols-[3rem_1fr_2fr_5rem]";

  function startAddingList() {
    setGroupForm({ batch: selectedBatch === "All Batches" ? "" : selectedBatch, semester: selectedSemester === "All" ? "" : selectedSemester, section: selectedSection === "All Sections" ? "" : selectedSection });
    setCourseRows([emptyCourseRow()]);
    setIsAddingList(true);
  }

  function saveCourseList() {
    const validCourses = courseRows.filter((course) => course.code.trim() || course.title.trim() || course.credits.trim());
    if (!groupForm.batch.trim() || !groupForm.semester.trim() || validCourses.length === 0 || validCourses.some((course) => !course.code.trim() || !course.title.trim() || !course.credits.trim())) return;
    replaceOfferGroup(groupForm, validCourses);
    setSelectedBatch(groupForm.batch.trim());
    setSelectedSemester(groupForm.semester.trim());
    setSelectedSection(groupForm.section.trim() || "All Sections");
    setIsAddingList(false);
  }

  function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      importFromCSV(text);
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-4xl border border-slate-200/80 bg-linear-to-r from-slate-50 via-sky-50 to-white p-8 shadow-lg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">Academic offering</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Course Offer List</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Explore course offerings loaded from CSV. Use the filters below to find the right batch and semesters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="rounded-full px-5 py-3" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            {isFaculty && (
              <label className="cursor-pointer">
                <input onChange={onFile} accept=".csv" type="file" className="hidden" />
                <Button variant="outline" className="rounded-full px-5 py-3"><Plus className="mr-2 h-4 w-4" />Import CSV</Button>
              </label>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <Input
            placeholder="Search course code or name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Batch</label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              {batches.map((batch) => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              {semesters.map((semester) => (
                <option key={semester} value={semester}>{semester}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              {sections.map((section) => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {isFaculty ? (
            <Button onClick={startAddingList} className="rounded-full px-5 py-3"><Plus className="mr-2 h-4 w-4" />Add Batch Course List</Button>
          ) : null}
        </div>
      </section>

      {isAddingList ? (
        <section className="rounded-3xl border border-slate-200/80 bg-slate-50 p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Add batch course list</h2>
            <p className="mt-1 text-sm text-slate-600">Save করলে এই Batch, Semester ও Section-এর আগের পুরো list নতুন list দিয়ে replace হবে।</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Input placeholder="Batch (e.g. 67)" value={groupForm.batch} onChange={(e) => setGroupForm({ ...groupForm, batch: e.target.value })} />
            <Input placeholder="Semester (e.g. 1--1)" value={groupForm.semester} onChange={(e) => setGroupForm({ ...groupForm, semester: e.target.value })} />
            <Input placeholder="Section (optional)" value={groupForm.section} onChange={(e) => setGroupForm({ ...groupForm, section: e.target.value })} />
          </div>
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="grid grid-cols-[1fr_2fr_7rem_2.5rem] gap-3 bg-slate-100 px-4 py-3 text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
              <span>Course code</span><span>Course name</span><span>Credit</span><span />
            </div>
            {courseRows.map((course, index) => (
              <div key={index} className="grid grid-cols-[1fr_2fr_7rem_2.5rem] gap-3 border-t border-slate-200 p-3">
                <Input placeholder="CSE 101" value={course.code} onChange={(e) => setCourseRows(courseRows.map((row, rowIndex) => rowIndex === index ? { ...row, code: e.target.value } : row))} />
                <Input placeholder="Course name" value={course.title} onChange={(e) => setCourseRows(courseRows.map((row, rowIndex) => rowIndex === index ? { ...row, title: e.target.value } : row))} />
                <Input placeholder="3" value={course.credits} onChange={(e) => setCourseRows(courseRows.map((row, rowIndex) => rowIndex === index ? { ...row, credits: e.target.value } : row))} />
                <Button aria-label="Remove course" variant="ghost" size="icon" disabled={courseRows.length === 1} onClick={() => setCourseRows(courseRows.filter((_, rowIndex) => rowIndex !== index))}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setCourseRows([...courseRows, emptyCourseRow()])}><Plus className="mr-2 h-4 w-4" />Add another course</Button>
            <Button onClick={saveCourseList}>Save entire list</Button>
            <Button variant="ghost" onClick={() => setIsAddingList(false)}>Cancel</Button>
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        {loading ? (
          <div className="text-sm text-slate-500">Loading…</div>
        ) : shownCount === 0 ? (
          <div className="text-sm text-slate-500">No courses found.</div>
        ) : (
          <div className="space-y-6">
            {offerGroups.map((group) => (
              <div key={`${group.batch}|${group.section}|${group.semester}`} className="overflow-hidden rounded-3xl border border-slate-200">
                <div className="flex items-center justify-between gap-4 bg-sky-50 px-5 py-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                      {group.batch ? <span className="rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-sky-100">Batch {group.batch}</span> : null}
                      {group.section ? <span className="px-1 text-sm font-normal text-slate-500">Section {group.section}</span> : null}
                      {group.semester ? <span className="rounded-full bg-sky-600 px-3 py-1.5 text-white shadow-sm">Semester {group.semester.replace(/-+/g, "–")}</span> : null}
                      {!group.batch && !group.section && !group.semester ? <span>Course offer</span> : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-sky-100">
                      {group.offers.length} courses
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100">
                      Total {group.offers.reduce((sum, offer) => sum + (Number.parseFloat(offer.credits || "0") || 0), 0).toFixed(1)} credits
                    </span>
                  </div>
                </div>
                <div className={`grid ${tableColumns} gap-0 bg-slate-100 px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-500`}>
                  <div>SL</div>
                  <div>Course Code</div>
                  <div>Course Name</div>
                  <div className="text-right">Credit</div>
                </div>
                {group.offers.map((offer, index) => (
                  <div
                    key={offer.id}
                    className={`grid ${tableColumns} gap-0 border-t border-slate-200 px-4 py-3.5 ${index % 2 === 0 ? "bg-white" : "bg-slate-50"}`}
                  >
                    <div className="font-mono text-sm text-slate-600">{index + 1}</div>
                    <div className="font-mono text-sm font-semibold text-slate-900">{offer.code}</div>
                    <div className="text-sm text-slate-800">{offer.title}</div>
                    <div className="text-right font-mono text-sm font-bold text-sky-700">{offer.credits || "—"}</div>
                  </div>
                ))}
              </div>
            ))}
            {isFaculty && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <div>{shownCount} course{shownCount === 1 ? "" : "s"} displayed</div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setQuery("")}>Clear search</Button>
                  <Button variant="outline" onClick={() => setSelectedSemester("All")}>All semesters</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default CourseOffer;
