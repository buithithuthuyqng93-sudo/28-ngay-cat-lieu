import { Award, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Badge } from "@/lib/progress";

export function BadgeChip({ badge }: { badge: Badge }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-xl border p-3",
        badge.earned ? "border-primary-200 bg-primary-50" : "border-gray-200 bg-gray-50 opacity-60"
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          badge.earned ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-400"
        )}
      >
        {badge.earned ? <Award className="size-4" /> : <Lock className="size-3.5" />}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-gray-900">{badge.name}</p>
        <p className="truncate text-[11px] text-gray-500">{badge.description}</p>
      </div>
    </div>
  );
}
