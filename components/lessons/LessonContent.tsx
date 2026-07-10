import { Clock, Target, ListChecks, MessageCircleQuestion, Sparkles, PlayCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { Lesson } from "@/generated/prisma/client";
import { TOTAL_DAYS } from "@/lib/progress";

export function LessonContent({
  lesson,
  challengeCta,
}: {
  lesson: Lesson;
  challengeCta: React.ReactNode;
}) {
  const checklist = (lesson.checklist as unknown as string[]) ?? [];
  const prompts = (lesson.prompts as unknown as string[]) ?? [];

  return (
    <>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-primary-600">
          Ngày {lesson.day} / {TOTAL_DAYS}
        </p>
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

      <Card className="border-amber-200 bg-amber-50/60 p-5">
        <div className="mb-2 flex items-center gap-2 text-amber-700">
          <Sparkles className="size-4.5" />
          <p className="text-sm font-bold">Thử thách nhỏ hôm nay</p>
        </div>
        <p className="text-sm leading-relaxed text-amber-900">{lesson.challenge}</p>
        {challengeCta}
      </Card>
    </>
  );
}
