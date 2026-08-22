import { createFileRoute } from "@tanstack/react-router";
import { FacultyShell } from "@/components/layout/FacultyShell";
import CourseOffer from "@/components/course/CourseOffer";

export const Route = createFileRoute("/faculty/course-offer")({
  head: () => ({ meta: [{ title: "Course Offers · Faculty" }] }),
  component: FacultyCoursePage,
});

function FacultyCoursePage() {
  return (
    <FacultyShell>
      <div className="space-y-6">
        <CourseOffer isFaculty={true} />
      </div>
    </FacultyShell>
  );
}
