import { Lock, Circle, PlayCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LessonStatus } from "@/lib/progress";

const config: Record<LessonStatus, { label: string; className: string; icon: React.ElementType }> = {
  locked: { label: "Đã khóa", className: "bg-gray-100 text-gray-500", icon: Lock },
  not_started: { label: "Chưa học", className: "bg-gray-100 text-gray-600", icon: Circle },
  in_progress: { label: "Đang học", className: "bg-mint-100 text-mint-800", icon: PlayCircle },
  completed: { label: "Đã hoàn thành", className: "bg-primary-100 text-primary-700", icon: CheckCircle2 },
};

export function StatusBadge({ status, className }: { status: LessonStatus; className?: string }) {
  const { label, className: colorClass, icon: Icon } = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        colorClass,
        className
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}
