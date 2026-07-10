import Link from "next/link";
import { Clock, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { LessonWithStatus } from "@/lib/progress";

export function LessonCard({ lesson }: { lesson: LessonWithStatus }) {
  const locked = lesson.status === "locked";

  const content = (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border p-4 transition",
        locked
          ? "border-gray-200 bg-gray-50"
          : "border-gray-200 bg-white shadow-card hover:border-primary-300"
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
            locked ? "bg-gray-200 text-gray-400" : "bg-primary-600 text-white"
          )}
        >
          {locked ? <Lock className="size-4" /> : lesson.day}
        </span>
        <StatusBadge status={lesson.status} />
      </div>
      <p className={cn("text-sm font-bold leading-snug", locked ? "text-gray-400" : "text-gray-900")}>
        {locked ? `Ngày ${lesson.day} — Sẽ mở khóa sớm` : lesson.title}
      </p>
      {!locked && (
        <p className="mt-auto flex items-center gap-1 pt-3 text-xs text-gray-500">
          <Clock className="size-3.5" />
          {lesson.duration} phút
        </p>
      )}
    </div>
  );

  if (locked) {
    return <div aria-disabled className="cursor-not-allowed opacity-80">{content}</div>;
  }

  return (
    <Link href={`/bai-hoc/${lesson.day}`} className="block h-full">
      {content}
    </Link>
  );
}
