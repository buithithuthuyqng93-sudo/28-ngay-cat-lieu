import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, CreditCard } from "lucide-react";
import { getCurrentUser } from "@/lib/dal";
import { getLessonsWithStatus, TOTAL_DAYS, PROGRAM_PRICE_LABEL } from "@/lib/progress";
import { markLessonComplete, unmarkLessonComplete } from "@/lib/actions/lessons";
import { Button, LinkButton } from "@/components/ui/Button";
import { LessonContent } from "@/components/lessons/LessonContent";

type Props = { params: Promise<{ day: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { day } = await params;
  return { title: `Ngày ${day} | 28 Ngày Thử Thách Cắt Liều` };
}

export default async function LessonPage({ params }: Props) {
  const { day: dayParam } = await params;
  const day = Number(dayParam);
  if (!Number.isInteger(day) || day < 1 || day > TOTAL_DAYS) notFound();

  const user = await getCurrentUser();
  const lessons = await getLessonsWithStatus(user.id);
  const lesson = lessons.find((l) => l.day === day);
  if (!lesson) notFound();

  if (lesson.status === "locked") {
    if (lesson.requiresPayment) {
      return (
        <div className="mx-auto max-w-2xl py-16 text-center">
          <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
            <CreditCard className="size-6" />
          </span>
          <h1 className="text-lg font-bold text-gray-900">Bài học Ngày {day} cần mở khóa</h1>
          <p className="mt-2 text-sm text-gray-500">
            Bạn đã học thử Ngày 1 miễn phí. Thanh toán {PROGRAM_PRICE_LABEL} để mở khóa toàn bộ 28 ngày.
          </p>
          <LinkButton href="/thanh-toan" size="sm" className="mt-6">
            Mở khóa ngay
            <ArrowRight className="size-3.5" />
          </LinkButton>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
          <Lock className="size-6" />
        </span>
        <h1 className="text-lg font-bold text-gray-900">Bài học Ngày {day} chưa được mở khóa</h1>
        <p className="mt-2 text-sm text-gray-500">
          Hãy hoàn thành các ngày trước đó, bài học mới sẽ tự động mở khóa theo lộ trình.
        </p>
        <LinkButton href="/lo-trinh" size="sm" variant="outline" className="mt-6">
          <ArrowLeft className="size-3.5" />
          Về lộ trình 28 ngày
        </LinkButton>
      </div>
    );
  }

  const isCompleted = lesson.status === "completed";
  const prevDay = day > 1 ? lessons.find((l) => l.day === day - 1) : null;
  const nextDay = day < TOTAL_DAYS ? lessons.find((l) => l.day === day + 1) : null;

  return (
    <div className="space-y-6 pb-8">
      <Link href="/lo-trinh" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
        <ArrowLeft className="size-4" />
        Lộ trình 28 ngày
      </Link>

      <LessonContent
        lesson={lesson}
        challengeCta={
          <LinkButton
            href="/thu-thach"
            size="sm"
            variant="outline"
            className="mt-4 border-amber-300 text-amber-700 hover:bg-amber-100"
          >
            Nộp bài ở trang Thử thách
            <ArrowRight className="size-3.5" />
          </LinkButton>
        }
      />

      <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {prevDay && (
            <LinkButton href={`/bai-hoc/${prevDay.day}`} variant="ghost" size="sm">
              <ArrowLeft className="size-3.5" />
              Ngày {prevDay.day}
            </LinkButton>
          )}
          {nextDay && nextDay.status !== "locked" && (
            <LinkButton href={`/bai-hoc/${nextDay.day}`} variant="ghost" size="sm">
              Ngày {nextDay.day}
              <ArrowRight className="size-3.5" />
            </LinkButton>
          )}
        </div>

        {isCompleted ? (
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary-100 px-4 py-2.5 text-sm font-semibold text-primary-700">
              <CheckCircle2 className="size-4" />
              Đã hoàn thành
            </span>
            <form action={unmarkLessonComplete.bind(null, lesson.id, lesson.day)}>
              <button type="submit" className="text-xs text-gray-400 underline hover:text-gray-600">
                Bỏ đánh dấu
              </button>
            </form>
          </div>
        ) : (
          <form action={markLessonComplete.bind(null, lesson.id, lesson.day)}>
            <Button type="submit" size="lg">
              <CheckCircle2 className="size-4.5" />
              Đánh dấu hoàn thành
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
