import { CreditCard, ArrowRight } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { PROGRAM_PRICE_LABEL } from "@/lib/progress";

export function PaywallBanner() {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-primary-200 bg-primary-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white">
          <CreditCard className="size-4.5" />
        </span>
        <div>
          <p className="text-sm font-bold text-primary-900">Bạn đang học thử Ngày 1 miễn phí</p>
          <p className="text-xs text-primary-700">
            Mở khóa toàn bộ 28 ngày còn lại chỉ với {PROGRAM_PRICE_LABEL}.
          </p>
        </div>
      </div>
      <LinkButton href="/thanh-toan" size="sm" className="w-full shrink-0 sm:w-auto">
        Mở khóa ngay
        <ArrowRight className="size-3.5" />
      </LinkButton>
    </div>
  );
}
