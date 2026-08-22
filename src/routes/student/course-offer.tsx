import { createFileRoute } from "@tanstack/react-router";
import { StudentShell } from "@/components/layout/StudentShell";
import CourseOffer from "@/components/course/CourseOffer";

export const Route = createFileRoute("/student/course-offer")({
  head: () => ({ meta: [{ title: "Course Offers · Student" }] }),
  component: StudentCoursePage,
});

function StudentCoursePage() {
  return (
    <StudentShell>
      <div className="space-y-6">
        <CourseOffer isFaculty={false} />
      </div>
    </StudentShell>
  );
}
