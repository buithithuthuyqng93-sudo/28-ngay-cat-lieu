import type { Metadata } from "next";
import { MessageCircle, Globe2, Pin, CalendarClock, HelpCircle, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Cộng đồng | 28 Ngày Thử Thách Cắt Liều" };

const liveSchedule = [
  { day: "Thứ 4 hàng tuần", time: "20:00 - 21:00", title: "Live giải đáp thắc mắc bài học trong tuần" },
  { day: "Chủ nhật cuối tuần", time: "09:00 - 10:00", title: "Review case thực chiến do học viên gửi về" },
];

const faqs = [
  {
    q: "Tôi bận, có thể học bù nếu bỏ lỡ một vài ngày không?",
    a: "Có. Lộ trình mở khóa dần theo ngày nhưng các bài đã mở khóa sẽ không bị đóng lại — bạn học bù thoải mái, không mất tiến độ.",
  },
  {
    q: "Bài nộp thử thách có được chấm điểm không?",
    a: "Bài nộp được ghi nhận trạng thái đã nộp và có thể được đội ngũ hoặc cộng đồng phản hồi, góp ý trực tiếp trong nhóm.",
  },
  {
    q: "Tôi có thể chỉnh sửa bài đã nộp không?",
    a: "Có, vào lại trang Thử thách và cập nhật nội dung bất cứ lúc nào trước khi kết thúc chương trình.",
  },
];

export default async function CommunityPage() {
  const featuredSubmissions = await prisma.submission.findMany({
    where: { featured: true },
    include: { user: { select: { name: true } }, challenge: { select: { title: true, day: true } } },
    orderBy: { submittedAt: "desc" },
    take: 6,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cộng đồng học viên</h1>
        <p className="mt-1 text-sm text-gray-600">
          Kết nối, hỏi đáp và học hỏi từ những bài nộp nổi bật của học viên khác.
        </p>
      </div>

      {/* Group links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href="#"
          className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-card transition hover:border-primary-300"
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <MessageCircle className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-gray-900">Nhóm Zalo học viên</p>
            <p className="text-xs text-gray-500">Cập nhật link nhóm Zalo tại đây</p>
          </div>
        </a>
        <a
          href="#"
          className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-card transition hover:border-primary-300"
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Globe2 className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-gray-900">Nhóm Facebook cộng đồng</p>
            <p className="text-xs text-gray-500">Cập nhật link nhóm Facebook tại đây</p>
          </div>
        </a>
      </div>

      {/* Pinned guide */}
      <Card className="border-amber-200 bg-amber-50/60 p-5">
        <div className="mb-2 flex items-center gap-2 text-amber-700">
          <Pin className="size-4.5" />
          <p className="text-sm font-bold">Bài ghim — Cách học hiệu quả trong 28 ngày</p>
        </div>
        <ul className="mt-2 space-y-1.5 text-sm text-amber-900">
          <li>1. Học đúng bài của ngày hôm đó, tránh học dồn vào cuối tuần.</li>
          <li>2. Làm thử thách ngay sau khi học xong video, khi kiến thức còn mới.</li>
          <li>3. Đăng bài nộp và chủ động hỏi trong nhóm nếu còn phân vân.</li>
          <li>4. Ôn lại checklist tư vấn trước mỗi ca làm việc thực tế tại quầy.</li>
        </ul>
      </Card>

      {/* Live schedule */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <CalendarClock className="size-4.5 text-primary-600" />
          <h2 className="text-lg font-bold text-gray-900">Lịch live / hỗ trợ</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {liveSchedule.map((item) => (
            <Card key={item.title} className="p-4">
              <p className="text-sm font-bold text-gray-900">{item.day}</p>
              <p className="text-xs font-medium text-primary-600">{item.time}</p>
              <p className="mt-1.5 text-sm text-gray-600">{item.title}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Q&A */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <HelpCircle className="size-4.5 text-primary-600" />
          <h2 className="text-lg font-bold text-gray-900">Hỏi đáp nhanh</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((item) => (
            <details key={item.q} className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-card">
              <summary className="cursor-pointer list-none text-sm font-semibold text-gray-900 group-open:text-primary-700">
                {item.q}
              </summary>
              <p className="mt-2 text-sm text-gray-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Featured submissions */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="size-4.5 text-primary-600" />
          <h2 className="text-lg font-bold text-gray-900">Bài nộp nổi bật</h2>
        </div>
        {featuredSubmissions.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có bài nộp nổi bật nào được chọn.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {featuredSubmissions.map((s) => (
              <Card key={s.id} className="p-4">
                <p className="text-xs font-semibold text-primary-600">
                  Ngày {s.challenge.day} · {s.challenge.title}
                </p>
                <p className="mt-2 line-clamp-4 text-sm text-gray-700">{s.content}</p>
                <p className="mt-3 text-xs font-medium text-gray-400">— {s.user.name}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
