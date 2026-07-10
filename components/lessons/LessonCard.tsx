import Link from "next/link";
import { Clock, Lock, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { LessonWithStatus } from "@/lib/progress";

export function LessonCard({ lesson }: { lesson: LessonWithStatus }) {
  const locked = lesson.status === "locked";
  const paymentLocked = locked && lesson.requiresPayment;

  const content = (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border p-4 transition",
        paymentLocked
          ? "border-primary-200 bg-primary-50/60 hover:border-primary-300"
          : locked
            ? "border-gray-200 bg-gray-50"
            : "border-gray-200 bg-white shadow-card hover:border-primary-300"
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
            paymentLocked
              ? "bg-primary-100 text-primary-600"
              : locked
                ? "bg-gray-200 text-gray-400"
                : "bg-primary-600 text-white"
          )}
        >
          {paymentLocked ? <CreditCard className="size-4" /> : locked ? <Lock className="size-4" /> : lesson.day}
        </span>
        {paymentLocked ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-xs font-medium text-primary-700">
            Cần mở khóa
          </span>
        ) : (
          <StatusBadge status={lesson.status} />
        )}
      </div>
      <p className={cn("text-sm font-bold leading-snug", locked && !paymentLocked ? "text-gray-400" : "text-gray-900")}>
        {paymentLocked ? `Ngày ${lesson.day} — Thanh toán để mở khóa` : locked ? `Ngày ${lesson.day} — Sẽ mở khóa sớm` : lesson.title}
      </p>
      {!locked && (
        <p className="mt-auto flex items-center gap-1 pt-3 text-xs text-gray-500">
          <Clock className="size-3.5" />
          {lesson.duration} phút
        </p>
      )}
    </div>
  );

  if (paymentLocked) {
    return (
      <Link href="/thanh-toan" className="block h-full">
        {content}
      </Link>
    );
  }

  if (locked) {
    return <div aria-disabled className="cursor-not-allowed opacity-80">{content}</div>;
  }

  return (
    <Link href={`/bai-hoc/${lesson.day}`} className="block h-full">
      {content}
    </Link>
  );
}
