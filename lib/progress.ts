import "server-only";
import { prisma } from "@/lib/prisma";
import type { Lesson, Progress } from "@/generated/prisma/client";
import { TOTAL_DAYS, FREE_TRIAL_DAY, PROGRAM_PRICE, PROGRAM_PRICE_LABEL } from "@/lib/constants";

export { TOTAL_DAYS, FREE_TRIAL_DAY, PROGRAM_PRICE, PROGRAM_PRICE_LABEL };

export type LessonStatus = "locked" | "not_started" | "in_progress" | "completed";

export type LessonWithStatus = Lesson & {
  status: LessonStatus;
  completedAt: Date | null;
  requiresPayment: boolean;
};

function dayOfChallenge(referenceDate: Date) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const today = new Date();
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.floor((now.getTime() - start.getTime()) / msPerDay);
}

export async function getLessonsWithStatus(userId: string): Promise<LessonWithStatus[]> {
  const [lessons, user, progressRows] = await Promise.all([
    prisma.lesson.findMany({ orderBy: { day: "asc" } }),
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { createdAt: true, paidAt: true } }),
    prisma.progress.findMany({ where: { userId } }),
  ]);

  const progressByLesson = new Map<string, Progress>(progressRows.map((p) => [p.lessonId, p]));
  const hasPaid = user.paidAt !== null;

  // Day 1 is always a free trial. Once paid, pacing restarts from paidAt so the
  // learner immediately gets day 2 too, then a new day unlocks daily after that.
  const unlockedUpToDay = hasPaid
    ? Math.min(TOTAL_DAYS, dayOfChallenge(user.paidAt!) + FREE_TRIAL_DAY + 1)
    : FREE_TRIAL_DAY;

  return lessons.map((lesson) => {
    const progress = progressByLesson.get(lesson.id);
    const requiresPayment = !hasPaid && lesson.day > FREE_TRIAL_DAY;
    let status: LessonStatus;

    if (progress) {
      status = "completed";
    } else if (lesson.day > unlockedUpToDay) {
      status = "locked";
    } else if (lesson.day === unlockedUpToDay) {
      status = "in_progress";
    } else {
      status = "not_started";
    }

    return { ...lesson, status, completedAt: progress?.completedAt ?? null, requiresPayment };
  });
}

export async function getLessonWithStatus(userId: string, day: number) {
  const lessons = await getLessonsWithStatus(userId);
  return lessons.find((l) => l.day === day) ?? null;
}

export function computeStreak(completedDates: Date[]): number {
  if (completedDates.length === 0) return 0;

  const daySet = new Set(
    completedDates.map((d) => {
      const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      return day.getTime();
    })
  );

  const msPerDay = 24 * 60 * 60 * 1000;
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  let cursor = daySet.has(todayStart) ? todayStart : todayStart - msPerDay;
  if (!daySet.has(cursor)) return 0;

  let streak = 0;
  while (daySet.has(cursor)) {
    streak += 1;
    cursor -= msPerDay;
  }
  return streak;
}

export type DashboardStats = {
  completedCount: number;
  totalCount: number;
  percent: number;
  streak: number;
  submissionCount: number;
  nextLesson: LessonWithStatus | null;
  hasPaid: boolean;
};

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [lessons, submissionCount] = await Promise.all([
    getLessonsWithStatus(userId),
    prisma.submission.count({ where: { userId } }),
  ]);

  const completed = lessons.filter((l) => l.status === "completed");
  const streak = computeStreak(completed.map((l) => l.completedAt!).filter(Boolean));
  const nextLesson =
    lessons.find((l) => l.status === "in_progress") ??
    lessons.find((l) => l.status === "not_started") ??
    null;
  const hasPaid = !lessons.some((l) => l.requiresPayment);

  return {
    completedCount: completed.length,
    totalCount: TOTAL_DAYS,
    percent: Math.round((completed.length / TOTAL_DAYS) * 100),
    streak,
    submissionCount,
    nextLesson,
    hasPaid,
  };
}

export type Badge = {
  code: string;
  name: string;
  description: string;
  earned: boolean;
};

export function getBadges(stats: DashboardStats): Badge[] {
  return [
    {
      code: "first-day",
      name: "Khởi động",
      description: "Hoàn thành ngày học đầu tiên",
      earned: stats.completedCount >= 1,
    },
    {
      code: "week-1",
      name: "Vững nền tảng",
      description: "Hoàn thành trọn Tuần 1 (7 ngày)",
      earned: stats.completedCount >= 7,
    },
    {
      code: "week-2",
      name: "Thạo bệnh thường gặp",
      description: "Hoàn thành trọn Tuần 2 (14 ngày)",
      earned: stats.completedCount >= 14,
    },
    {
      code: "week-3",
      name: "Chuyên sâu da liễu - phụ khoa - nhi",
      description: "Hoàn thành trọn Tuần 3 (21 ngày)",
      earned: stats.completedCount >= 21,
    },
    {
      code: "graduate",
      name: "Chiến binh cắt liều",
      description: "Hoàn thành toàn bộ 28 ngày thử thách",
      earned: stats.completedCount >= 28,
    },
    {
      code: "streak-3",
      name: "Kiên trì 3 ngày",
      description: "Học liên tục 3 ngày không nghỉ",
      earned: stats.streak >= 3,
    },
    {
      code: "streak-7",
      name: "Streak 1 tuần",
      description: "Học liên tục 7 ngày không nghỉ",
      earned: stats.streak >= 7,
    },
    {
      code: "active-submitter",
      name: "Chăm chỉ nộp bài",
      description: "Nộp từ 5 thử thách trở lên",
      earned: stats.submissionCount >= 5,
    },
  ];
}
