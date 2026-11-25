import React, { useMemo, useState } from "react";
import { useCourseOffers, CourseOffer as CO } from "@/lib/data/courseOffers";
import { sortBatchesCseFirst } from "@/lib/data/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

type CourseRow = Pick<CO, "code" | "title" | "credits">;
type CourseGroup = { batch: string; semester: string; section: string };

const emptyCourseRow = (): CourseRow => ({ code: "", title: "", credits: "" });

export function CourseOffer({ isFaculty = false }: { isFaculty?: boolean }) {
  const { offers, loading, replaceOfferGroup, removeOfferGroup } = useCourseOffers();
  const [query, setQuery] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("All");
  const [selectedBatch, setSelectedBatch] = useState("All Batches");
  const [selectedSection, setSelectedSection] = useState("All Sections");
  const [isAddingList, setIsAddingList] = useState(false);
  const [groupForm, setGroupForm] = useState<CourseGroup>({ batch: "", semester: "", section: "" });
  const [courseRows, setCourseRows] = useState<CourseRow[]>([emptyCourseRow()]);

  const visibleOffers = useMemo(
    () =>
      offers.filter((offer) => {
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
      const searchText = (
        offer.code +
        " " +
        offer.title +
        " " +
        (offer.instructor || "") +
        " " +
        (offer.dept || "") +
        " " +
        (offer.batch || "") +
        " " +
        (offer.section || "")
      ).toLowerCase();
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
    setGroupForm({
      batch: selectedBatch === "All Batches" ? "" : selectedBatch,
      semester: selectedSemester === "All" ? "" : selectedSemester,
      section: selectedSection === "All Sections" ? "" : selectedSection,
    });
    setCourseRows([emptyCourseRow()]);
    setIsAddingList(true);
  }

  function saveCourseList() {
    const validCourses = courseRows.filter((course) => course.code.trim() || course.title.trim() || course.credits.trim());
    if (
      !groupForm.batch.trim() ||
      !groupForm.semester.trim() ||
      validCourses.length === 0 ||
      validCourses.some((course) => !course.code.trim() || !course.title.trim() || !course.credits.trim())
    )
      return;
    replaceOfferGroup(groupForm, validCourses);
    setSelectedBatch(groupForm.batch.trim());
    setSelectedSemester(groupForm.semester.trim());
    setSelectedSection(groupForm.section.trim() || "All Sections");
    setIsAddingList(false);
  }

  function removeCourseList(group: Pick<CO, "batch" | "section" | "semester">) {
    const label = [
      group.batch && `Batch ${group.batch}`,
      group.section && `Section ${group.section}`,
      group.semester && `Semester ${group.semester}`,
    ]
      .filter(Boolean)
      .join(", ");
    if (window.confirm(`Remove the course offer for ${label || "this group"}?`)) {
      removeOfferGroup(group);
    }
  }

  function clearFilters() {
    setQuery("");
    setSelectedBatch("All Batches");
    setSelectedSemester("All");
    setSelectedSection("All Sections");
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-elegant">
        <div className="absolute inset-0 bg-mesh opacity-60 pointer-events-none" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Academic offering</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold font-display tracking-tight">Course Offer List</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Explore course offerings loaded from CSV. Use the filters below to find the right batch and semesters.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card/90 backdrop-blur-sm p-6 shadow-elegant">
        <div className="space-y-4">
          <Input placeholder="Search course code or name..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Batch
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {batches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Semester
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {semesters.map((semester) => (
                  <option key={semester} value={semester}>
                    {semester}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {sections.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={clearFilters}>
            Clear filters
          </Button>
          {isFaculty ? (
            <Button onClick={startAddingList} className="rounded-full px-5 py-3">
              <Plus className="mr-2 h-4 w-4" />
              Add New Semester Course Offer
            </Button>
          ) : null}
        </div>
      </section>

      {isAddingList ? (
        <section className="rounded-3xl border border-border bg-card p-6 shadow-elegant animate-scale-in">
          <div className="mb-5">
            <h2 className="text-lg font-semibold font-display">Add batch course list</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Saving replaces the complete existing list for this batch, semester, and section.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              placeholder="Batch (e.g. 67)"
              value={groupForm.batch}
              onChange={(e) => setGroupForm({ ...groupForm, batch: e.target.value })}
            />
            <Input
              placeholder="Semester (e.g. 1--1)"
              value={groupForm.semester}
              onChange={(e) => setGroupForm({ ...groupForm, semester: e.target.value })}
            />
            <Input
              placeholder="Section (optional)"
              value={groupForm.section}
              onChange={(e) => setGroupForm({ ...groupForm, section: e.target.value })}
            />
          </div>
          <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-background">
            <div className="grid grid-cols-[1fr_2fr_7rem_2.5rem] gap-3 bg-muted px-4 py-3 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
              <span>Course code</span>
              <span>Course name</span>
              <span>Credit</span>
              <span />
            </div>
            {courseRows.map((course, index) => (
              <div key={index} className="grid grid-cols-[1fr_2fr_7rem_2.5rem] gap-3 border-t border-border p-3">
                <Input
                  placeholder="CSE 101"
                  value={course.code}
                  onChange={(e) =>
                    setCourseRows(
                      courseRows.map((row, rowIndex) => (rowIndex === index ? { ...row, code: e.target.value } : row)),
                    )
                  }
                />
                <Input
                  placeholder="Course name"
                  value={course.title}
                  onChange={(e) =>
                    setCourseRows(
                      courseRows.map((row, rowIndex) => (rowIndex === index ? { ...row, title: e.target.value } : row)),
                    )
                  }
                />
                <Input
                  placeholder="3"
                  value={course.credits}
                  onChange={(e) =>
                    setCourseRows(
                      courseRows.map((row, rowIndex) => (rowIndex === index ? { ...row, credits: e.target.value } : row)),
                    )
                  }
                />
                <Button
                  aria-label="Remove course"
                  variant="ghost"
                  size="icon"
                  disabled={courseRows.length === 1}
                  onClick={() => setCourseRows(courseRows.filter((_, rowIndex) => rowIndex !== index))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setCourseRows([...courseRows, emptyCourseRow()])}>
              <Plus className="mr-2 h-4 w-4" />
              Add another course
            </Button>
            <Button onClick={saveCourseList}>Save entire list</Button>
            <Button variant="ghost" onClick={() => setIsAddingList(false)}>
              Cancel
            </Button>
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl border border-border bg-card/90 p-6 shadow-elegant">
        {loading ? (
          <div className="text-sm text-muted-foreground animate-pulse">Loading…</div>
        ) : shownCount === 0 ? (
          <div className="text-sm text-muted-foreground">No courses found.</div>
        ) : (
          <div className="space-y-6">
            {offerGroups.map((group, gIdx) => (
              <div
                key={`${group.batch}|${group.section}|${group.semester}`}
                style={{ animationDelay: `${Math.min(gIdx, 10) * 40}ms` }}
                className="overflow-hidden rounded-2xl border border-border transition-all duration-300 hover:border-primary/35 hover:shadow-elegant animate-fade-up"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 bg-primary/5 px-5 py-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                      {group.batch ? (
                        <span className="rounded-full bg-card px-3 py-1 shadow-xs border border-border">
                          Batch {group.batch}
                        </span>
                      ) : null}
                      {group.section ? (
                        <span className="px-1 text-sm font-normal text-muted-foreground">Section {group.section}</span>
                      ) : null}
                      {group.semester ? (
                        <span className="rounded-full bg-gradient-primary px-3 py-1 text-primary-foreground shadow-glow">
                          Semester {group.semester.replace(/-+/g, "–")}
                        </span>
                      ) : null}
                      {!group.batch && !group.section && !group.semester ? <span>Course offer</span> : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-muted-foreground border border-border">
                      {group.offers.length} courses
                    </span>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      Total{" "}
                      {group.offers
                        .reduce((sum, offer) => sum + (Number.parseFloat(offer.credits || "0") || 0), 0)
                        .toFixed(1)}{" "}
                      credits
                    </span>
                    {isFaculty ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeCourseList(group)}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Remove offer
                      </Button>
                    ) : null}
                  </div>
                </div>
                <div
                  className={`grid ${tableColumns} gap-0 bg-muted/60 px-4 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground`}
                >
                  <div>SL</div>
                  <div>Course Code</div>
                  <div>Course Name</div>
                  <div className="text-right">Credit</div>
                </div>
                {group.offers.map((offer, index) => (
                  <div
                    key={offer.id}
                    className={`grid ${tableColumns} gap-0 border-t border-border px-4 py-3.5 transition-colors hover:bg-primary/5 ${
                      index % 2 === 0 ? "bg-card" : "bg-muted/20"
                    }`}
                  >
                    <div className="font-mono text-sm text-muted-foreground">{index + 1}</div>
                    <div className="font-mono text-sm font-semibold">{offer.code}</div>
                    <div className="text-sm">{offer.title}</div>
                    <div className="text-right font-mono text-sm font-bold text-primary">{offer.credits || "—"}</div>
                  </div>
                ))}
              </div>
            ))}
            {isFaculty && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                <div>
                  {shownCount} course{shownCount === 1 ? "" : "s"} displayed
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
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
