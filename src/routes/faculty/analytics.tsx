import { createFileRoute } from "@tanstack/react-router";
import { FacultyShell } from "@/components/layout/FacultyShell";
import { AnalyticsView } from "@/components/analytics/AnalyticsView";

export const Route = createFileRoute("/faculty/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics · Faculty" },
      { name: "description", content: "Room utilization analytics for planning classes and reservations." },
      { property: "og:title", content: "Analytics · Faculty Console" },
      { property: "og:description", content: "Room utilization analytics for planning classes and reservations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FacultyAnalyticsPage,
});

function FacultyAnalyticsPage() {
  return (
    <FacultyShell>
      <AnalyticsView />
    </FacultyShell>
  );
}
