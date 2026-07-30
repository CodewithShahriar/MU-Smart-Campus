import { createFileRoute } from "@tanstack/react-router";
import { StudentShell } from "@/components/layout/StudentShell";
import { RoutineExplorer } from "@/components/routine/RoutineExplorer";

export const Route = createFileRoute("/student/routine")({
  head: () => ({
    meta: [
      { title: "Central Routine · MU Sylhet" },
      {
        name: "description",
        content: "Full class routine with filters for department, batch, section, day, faculty, course, room and time.",
      },
      { property: "og:title", content: "Central Routine · MU Sylhet" },
      { property: "og:description", content: "Search and filter the full Metropolitan University Sylhet class routine." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoutinePage,
});

function RoutinePage() {
  return (
    <StudentShell>
      <RoutineExplorer subtitle="Student view" />
    </StudentShell>
  );
}
