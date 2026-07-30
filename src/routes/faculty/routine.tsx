import { createFileRoute } from "@tanstack/react-router";
import { FacultyShell } from "@/components/layout/FacultyShell";
import { RoutineExplorer } from "@/components/routine/RoutineExplorer";

export const Route = createFileRoute("/faculty/routine")({
  head: () => ({
    meta: [
      { title: "View Routine · Faculty" },
      { name: "description", content: "Browse the full central routine with the same filters students use." },
      { property: "og:title", content: "View Routine · Faculty Console" },
      { property: "og:description", content: "Browse the full central routine from the faculty console." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FacultyRoutinePage,
});

function FacultyRoutinePage() {
  return (
    <FacultyShell>
      <RoutineExplorer subtitle="Faculty view" />
    </FacultyShell>
  );
}
