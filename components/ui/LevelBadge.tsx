import { cn } from "@/lib/utils";

const config: Record<string, { label: string; className: string }> = {
  easy: { label: "Dễ", className: "bg-primary-100 text-primary-700" },
  medium: { label: "Trung bình", className: "bg-amber-100 text-amber-700" },
  hard: { label: "Khó", className: "bg-red-100 text-red-700" },
};

export function LevelBadge({ level, className }: { level: string; className?: string }) {
  const item = config[level] ?? config.medium;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        item.className,
        className
      )}
    >
      {item.label}
    </span>
  );
}
