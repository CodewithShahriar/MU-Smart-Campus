import { createFileRoute } from "@tanstack/react-router";
import { StudentShell } from "@/components/layout/StudentShell";
import { AnalyticsView } from "@/components/analytics/AnalyticsView";

export const Route = createFileRoute("/student/analytics")({
  head: () => ({
    meta: [
      { title: "Room Analytics · MU Sylhet" },
      { name: "description", content: "Utilization analytics for classrooms across departments, days and time slots." },
      { property: "og:title", content: "Room Analytics · MU Sylhet" },
      { property: "og:description", content: "Live classroom utilization insights for Metropolitan University Sylhet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <StudentShell>
      <AnalyticsView />
    </StudentShell>
  );
}
