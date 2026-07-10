import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/dal";
import { markAsPaid } from "@/lib/actions/payment";
import { PROGRAM_PRICE_LABEL } from "@/lib/progress";
import { Card } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Thanh toán | 28 Ngày Thử Thách Cắt Liều" };

const benefits = [
  "Mở khóa toàn bộ 28 ngày bài học và video bài giảng",
  "Không giới hạn thời gian truy cập lại nội dung",
  "Nộp thử thách và nhận phản hồi từ cộng đồng học viên",
  "Đầy đủ checklist, mẫu quy trình và tài nguyên tải về",
  "Badge, streak và theo dõi tiến độ trọn hành trình 28 ngày",
];

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  const hasPaid = user.paidAt !== null;

  if (hasPaid) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
          <CheckCircle2 className="size-7" />
        </span>
        <h1 className="text-xl font-bold text-gray-900">Bạn đã mở khóa toàn bộ chương trình</h1>
        <p className="mt-2 text-sm text-gray-500">
          Cảm ơn bạn đã tham gia! Tiếp tục hành trình 28 ngày ngay thôi.
        </p>
        <LinkButton href="/lo-trinh" size="lg" className="mt-6">
          Vào lộ trình học
          <ArrowRight className="size-4" />
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 py-6">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
          <Sparkles className="size-3.5" />
          Bạn vừa học thử Ngày 1 miễn phí
        </span>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">Mở khóa toàn bộ 28 Ngày Cắt Liều</h1>
        <p className="mt-2 text-sm text-gray-600">
          Thanh toán một lần, học trọn hành trình — mỗi ngày một bài học và thử thách mới được mở khóa.
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-4xl font-extrabold text-primary-600">{PROGRAM_PRICE_LABEL}</span>
          <span className="text-sm text-gray-400">/ trọn khóa</span>
        </div>

        <ul className="mt-6 space-y-3">
          {benefits.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-gray-700">
              <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-primary-600" />
              {b}
            </li>
          ))}
        </ul>

        <form action={markAsPaid} className="mt-6">
          <Button type="submit" size="lg" className="w-full">
            Xác nhận thanh toán {PROGRAM_PRICE_LABEL}
          </Button>
        </form>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-gray-400">
          <ShieldCheck className="size-3.5" />
          Thanh toán an toàn — mở khóa ngay sau khi xác nhận
        </p>
      </Card>

      <p className="text-center text-xs text-gray-400">
        Cần hỗ trợ? Ghé{" "}
        <Link href="/cong-dong" className="font-medium text-primary-600 hover:underline">
          trang cộng đồng
        </Link>{" "}
        để được giải đáp.
      </p>
    </div>
  );
}
