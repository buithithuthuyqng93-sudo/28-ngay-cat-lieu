import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/dal";
import { getLessonsWithStatus } from "@/lib/progress";
import { WEEKS } from "@/lib/weeks";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LessonCard } from "@/components/lessons/LessonCard";

export const metadata: Metadata = { title: "Lộ trình 28 ngày | 28 Ngày Thử Thách Cắt Liều" };

export default async function RoadmapPage() {
  const user = await getCurrentUser();
  const lessons = await getLessonsWithStatus(user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lộ trình 28 ngày</h1>
        <p className="mt-1 text-sm text-gray-600">
          Mỗi ngày một bài học ngắn — hoàn thành lần lượt để mở khóa bài tiếp theo.
        </p>
      </div>

      {WEEKS.map((week) => {
        const weekLessons = lessons.filter((l) => l.day >= week.startDay && l.day <= week.endDay);
        const completedInWeek = weekLessons.filter((l) => l.status === "completed").length;

        return (
          <section key={week.number}>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-bold text-primary-700">
                  Tuần {week.number}
                </span>
                <h2 className="mt-1.5 text-lg font-bold text-gray-900">{week.title}</h2>
                <p className="text-xs text-gray-500">{week.description}</p>
              </div>
              <p className="shrink-0 text-xs font-medium text-gray-500">
                {completedInWeek}/{weekLessons.length} hoàn thành
              </p>
            </div>
            <ProgressBar percent={(completedInWeek / weekLessons.length) * 100} className="mb-4" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {weekLessons.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
