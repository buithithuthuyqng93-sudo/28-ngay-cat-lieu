import type { Metadata } from "next";
import { Flame, CalendarCheck, ClipboardList, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/dal";
import { getDashboardStats, getBadges, getLessonsWithStatus } from "@/lib/progress";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LinkButton } from "@/components/ui/Button";
import { BadgeChip } from "@/components/ui/BadgeChip";

export const metadata: Metadata = { title: "Tiến độ cá nhân | 28 Ngày Thử Thách Cắt Liều" };

export default async function ProgressPage() {
  const user = await getCurrentUser();
  const [stats, lessons] = await Promise.all([
    getDashboardStats(user.id),
    getLessonsWithStatus(user.id),
  ]);
  const badges = getBadges(stats);
  const incomplete = lessons.filter((l) => l.status !== "completed" && l.status !== "locked");

  const summaryCards = [
    { icon: CalendarCheck, label: "Ngày đã hoàn thành", value: `${stats.completedCount}/${stats.totalCount}` },
    { icon: ClipboardList, label: "Thử thách đã nộp", value: `${stats.submissionCount}` },
    { icon: Flame, label: "Streak học liên tục", value: `${stats.streak} ngày` },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tiến độ cá nhân</h1>
        <p className="mt-1 text-sm text-gray-600">Theo dõi hành trình 28 ngày của bạn.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {summaryCards.map(({ icon: Icon, label, value }) => (
          <Card key={label} className="p-5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Icon className="size-4.5" />
            </span>
            <p className="mt-3 text-2xl font-extrabold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Tiến độ tổng</p>
          <p className="text-sm font-bold text-primary-600">{stats.percent}%</p>
        </div>
        <ProgressBar percent={stats.percent} />
      </Card>

      <div>
        <p className="mb-3 text-sm font-semibold text-gray-900">Badge đã đạt ({badges.filter((b) => b.earned).length}/{badges.length})</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {badges.map((badge) => (
            <BadgeChip key={badge.code} badge={badge} />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-gray-900">Bài chưa hoàn thành</p>
        {incomplete.length === 0 ? (
          <Card className="p-5 text-sm text-gray-500">
            Bạn không có bài nào đang dang dở trong số các bài đã mở khóa. Tuyệt vời!
          </Card>
        ) : (
          <div className="space-y-2">
            {incomplete.map((lesson) => (
              <Card key={lesson.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-primary-600">Ngày {lesson.day}</p>
                  <p className="truncate text-sm font-bold text-gray-900">{lesson.title}</p>
                </div>
                <LinkButton href={`/bai-hoc/${lesson.day}`} size="sm" variant="outline" className="shrink-0">
                  Học ngay
                  <ArrowRight className="size-3.5" />
                </LinkButton>
              </Card>
            ))}
          </div>
        )}
      </div>

      {stats.nextLesson && (
        <Card className="border-primary-200 bg-primary-50/60 p-5">
          <p className="text-sm font-semibold text-primary-800">Gợi ý học tiếp</p>
          <p className="mt-1 text-base font-bold text-gray-900">
            Ngày {stats.nextLesson.day} — {stats.nextLesson.title}
          </p>
          <LinkButton href={`/bai-hoc/${stats.nextLesson.day}`} size="sm" className="mt-4">
            Tiếp tục học
            <ArrowRight className="size-3.5" />
          </LinkButton>
        </Card>
      )}
    </div>
  );
}
