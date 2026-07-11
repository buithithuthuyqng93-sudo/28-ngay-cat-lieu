import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, ArrowRight, Sparkles, Clock } from "lucide-react";
import { getCurrentUser } from "@/lib/dal";
import { getLatestOrder, syncOrderStatus } from "@/lib/orders";
import { PROGRAM_PRICE_LABEL } from "@/lib/progress";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { CreateOrderButton } from "@/components/payment/CreateOrderButton";

export const metadata: Metadata = { title: "Thanh toán | 28 Ngày Thử Thách Cắt Liều" };

const benefits = [
  "Mở khóa toàn bộ 28 ngày bài học và video bài giảng",
  "Không giới hạn thời gian truy cập lại nội dung",
  "Nộp thử thách và nhận phản hồi từ cộng đồng học viên",
  "Đầy đủ checklist, mẫu quy trình và tài nguyên tải về",
  "Badge, streak và theo dõi tiến độ trọn hành trình 28 ngày",
];

function UnlockedNotice() {
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

type Props = { searchParams: Promise<{ status?: string }> };

export default async function CheckoutPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const user = await getCurrentUser();

  if (user.paidAt) {
    return <UnlockedNotice />;
  }

  let order = await getLatestOrder(user.id);
  if (order?.status === "pending") {
    order = await syncOrderStatus(order);
  }

  if (order?.status === "paid") {
    return <UnlockedNotice />;
  }

  const isPendingLive = order?.status === "pending";
  const previousOrderExpiredOrCancelled =
    order && (order.status === "expired" || order.status === "cancelled");

  return (
    <div className="mx-auto max-w-lg space-y-6 py-6">
      {status === "cancelled" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Bạn đã huỷ giao dịch trước đó. Có thể thanh toán lại bất cứ lúc nào bên dưới.
        </div>
      )}
      {status === "success" && !isPendingLive && (
        <div className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800">
          Đang xác nhận thanh toán của bạn, vui lòng đợi trong giây lát rồi tải lại trang.
        </div>
      )}

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

      {previousOrderExpiredOrCancelled && (
        <div className="rounded-xl bg-gray-100 px-4 py-3 text-center text-sm text-gray-600">
          Đơn hàng trước đó đã {order!.status === "expired" ? "hết hạn" : "bị huỷ"}. Tạo đơn hàng mới để
          tiếp tục nhé.
        </div>
      )}

      <Card className="p-6">
        {isPendingLive && order ? (
          <div className="space-y-5">
            <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-amber-700">
              <Clock className="size-4" />
              Đơn hàng đang chờ thanh toán
            </p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-3xl font-extrabold text-primary-600">{PROGRAM_PRICE_LABEL}</span>
            </div>
            <LinkButton
              href={order.checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              className="w-full"
            >
              Mở trang thanh toán PayOS
              <ArrowRight className="size-4" />
            </LinkButton>
            <p className="text-center text-xs text-gray-400">
              Đã chuyển khoản rồi? Tải lại trang này sau vài giây để hệ thống tự cập nhật, không cần thao
              tác gì thêm.
            </p>
          </div>
        ) : (
          <>
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

            <div className="mt-6">
              <CreateOrderButton />
            </div>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-gray-400">
              <ShieldCheck className="size-3.5" />
              Thanh toán qua PayOS — mở khóa tự động ngay sau khi hệ thống xác nhận
            </p>
          </>
        )}
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
