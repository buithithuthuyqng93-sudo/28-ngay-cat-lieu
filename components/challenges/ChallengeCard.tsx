"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Lock, Clock } from "lucide-react";
import { submitChallenge } from "@/lib/actions/challenges";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Props = {
  challenge: {
    id: string;
    day: number;
    title: string;
    description: string;
    level: string;
    estimatedTime: string;
  };
  locked: boolean;
  existingSubmission?: { type: string; content: string } | null;
};

export function ChallengeCard({ challenge, locked, existingSubmission }: Props) {
  const [state, action, pending] = useActionState(submitChallenge, undefined);
  const [type, setType] = useState<"text" | "link">(existingSubmission?.type === "link" ? "link" : "text");
  const [open, setOpen] = useState(false);
  const submitted = !!existingSubmission;

  if (locked) {
    return (
      <Card className="flex items-center gap-3 p-4 opacity-60">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
          <Lock className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-400">Ngày {challenge.day}</p>
          <p className="truncate text-sm font-bold text-gray-400">{challenge.title}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-primary-600">Ngày {challenge.day}</p>
          <p className="text-sm font-bold text-gray-900">{challenge.title}</p>
        </div>
        {submitted ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-xs font-medium text-primary-700">
            <CheckCircle2 className="size-3.5" /> Đã nộp
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
            Chưa nộp
          </span>
        )}
      </div>

      <p className="mt-2 text-sm text-gray-600">{challenge.description}</p>

      <div className="mt-3 flex items-center gap-2">
        <LevelBadge level={challenge.level} />
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="size-3.5" />
          {challenge.estimatedTime}
        </span>
      </div>

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 text-xs font-semibold text-primary-600 hover:underline"
        >
          {submitted ? "Xem / chỉnh sửa bài nộp" : "Nộp bài"}
        </button>
      )}

      {open && (
        <form action={action} className="mt-4 space-y-3 border-t border-gray-100 pt-4">
          <input type="hidden" name="challengeId" value={challenge.id} />
          <input type="hidden" name="type" value={type} />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("text")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold",
                type === "text" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600"
              )}
            >
              Văn bản
            </button>
            <button
              type="button"
              onClick={() => setType("link")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold",
                type === "link" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600"
              )}
            >
              Link
            </button>
          </div>

          {type === "text" ? (
            <textarea
              name="content"
              defaultValue={existingSubmission?.content ?? ""}
              rows={4}
              placeholder="Nhập bài làm của bạn..."
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          ) : (
            <input
              name="content"
              defaultValue={existingSubmission?.content ?? ""}
              type="url"
              placeholder="https://..."
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          )}

          {state?.error && <p className="text-xs text-red-600">{state.error}</p>}

          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Đang nộp..." : submitted ? "Cập nhật bài nộp" : "Nộp bài"}
            </Button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Đóng
            </button>
          </div>
        </form>
      )}
    </Card>
  );
}
