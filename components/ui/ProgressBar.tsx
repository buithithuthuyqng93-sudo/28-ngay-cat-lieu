import { cn } from "@/lib/utils";

export function ProgressBar({
  percent,
  className,
  trackClassName,
}: {
  percent: number;
  className?: string;
  trackClassName?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-gray-100", trackClassName)}
    >
      <div
        className={cn("h-full rounded-full bg-gradient-to-r from-primary-500 to-mint-500 transition-all", className)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
