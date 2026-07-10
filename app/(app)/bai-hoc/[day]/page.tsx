import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Clock, Target, ListChecks, MessageCircleQuestion, Sparkles, CheckCircle2, Lock, PlayCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/dal";
import { getLessonsWithStatus, TOTAL_DAYS } from "@/lib/progress";
import { markLessonComplete, unmarkLessonComplete } from "@/lib/actions/lessons";
import { Card } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";

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

  const checklist = (lesson.checklist as unknown as string[]) ?? [];
  const prompts = (lesson.prompts as unknown as string[]) ?? [];
  const isCompleted = lesson.status === "completed";
  const prevDay = day > 1 ? lessons.find((l) => l.day === day - 1) : null;
  const nextDay = day < TOTAL_DAYS ? lessons.find((l) => l.day === day + 1) : null;

  return (
    <div className="space-y-6 pb-8">
      <Link href="/lo-trinh" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
        <ArrowLeft className="size-4" />
        Lộ trình 28 ngày
      </Link>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-primary-600">Ngày {lesson.day} / {TOTAL_DAYS}</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">{lesson.title}</h1>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
          <Clock className="size-4" />
          {lesson.duration} phút
        </p>
      </div>

      <Card className="p-5">
        <div className="mb-2 flex items-center gap-2 text-primary-700">
          <Target className="size-4.5" />
          <p className="text-sm font-bold">Mục tiêu bài học</p>
        </div>
        <p className="text-sm leading-relaxed text-gray-700">{lesson.objective}</p>
      </Card>

      <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-card">
        {lesson.videoUrl ? (
          <div className="aspect-video w-full bg-black">
            <iframe
              className="h-full w-full"
              src={lesson.videoUrl}
              title={`Video bài giảng Ngày ${lesson.day}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 bg-gray-100 text-gray-400">
            <PlayCircle className="size-10" />
            <p className="text-sm font-medium">Video bài giảng sẽ được cập nhật sớm</p>
          </div>
        )}
      </div>

      <Card className="p-5">
        <p className="mb-2 text-sm font-bold text-gray-900">Tóm tắt nội dung</p>
        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{lesson.summary}</p>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2 text-primary-700">
          <ListChecks className="size-4.5" />
          <p className="text-sm font-bold">Checklist tư vấn</p>
        </div>
        <ul className="space-y-2">
          {checklist.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border border-primary-300 text-[10px] font-bold text-primary-600">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </Card>

      {prompts.length > 0 && (
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2 text-mint-700">
            <MessageCircleQuestion className="size-4.5" />
            <p className="text-sm font-bold">Prompt / câu hỏi mẫu</p>
          </div>
          <ul className="space-y-2">
            {prompts.map((p, i) => (
              <li key={i} className="rounded-xl bg-mint-50 px-3 py-2 text-sm italic text-mint-900">
                “{p}”
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-5 border-amber-200 bg-amber-50/60">
        <div className="mb-2 flex items-center gap-2 text-amber-700">
          <Sparkles className="size-4.5" />
          <p className="text-sm font-bold">Thử thách nhỏ hôm nay</p>
        </div>
        <p className="text-sm leading-relaxed text-amber-900">{lesson.challenge}</p>
        <LinkButton href="/thu-thach" size="sm" variant="outline" className="mt-4 border-amber-300 text-amber-700 hover:bg-amber-100">
          Nộp bài ở trang Thử thách
          <ArrowRight className="size-3.5" />
        </LinkButton>
      </Card>

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
