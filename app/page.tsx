import Link from "next/link";
import {
  Leaf,
  ShieldCheck,
  Stethoscope,
  Users2,
  GraduationCap,
  Building2,
  CheckCircle2,
  ArrowRight,
  BookOpenCheck,
  MessagesSquare,
  ClipboardList,
  Award,
} from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { WEEKS } from "@/lib/weeks";

const audiences = [
  {
    icon: Stethoscope,
    title: "Dược sĩ tại nhà thuốc / quầy thuốc",
    description: "Muốn tư vấn cắt liều nhanh, đúng trọng tâm và an toàn hơn cho khách hàng mỗi ngày.",
  },
  {
    icon: GraduationCap,
    title: "Sinh viên ngành Dược",
    description: "Cần tư duy thực chiến, không chỉ lý thuyết, để tự tin trước khi ra trường đi làm.",
  },
  {
    icon: Users2,
    title: "Nhân sự quầy thuốc",
    description: "Dược tá, nhân viên bán hàng cần chuẩn hóa quy trình tiếp khách và khai thác triệu chứng.",
  },
  {
    icon: Building2,
    title: "Chủ nhà thuốc",
    description: "Muốn đào tạo đội ngũ đồng bộ, giảm sai sót và nâng chất lượng tư vấn toàn hệ thống.",
  },
];

const benefits = [
  "Tự tin khai thác triệu chứng đúng trọng tâm chỉ trong 2-3 phút trò chuyện.",
  "Nhận diện chính xác dấu hiệu cần chuyển tuyến, không bỏ sót ca nguy hiểm.",
  "Xây dựng được quy trình tư vấn riêng, nhất quán và chuyên nghiệp.",
  "Tăng sự tin tưởng của khách hàng, giảm rủi ro khi cắt liều không kê đơn.",
  "Có sẵn bộ checklist, mẫu câu hỏi và mẫu dặn dò để dùng ngay tại quầy.",
  "Rèn phản xạ qua case thực chiến thay vì chỉ học lý thuyết suông.",
];

const formatSteps = [
  {
    icon: BookOpenCheck,
    title: "Học bài ngắn mỗi ngày",
    description: "Video 5-10 phút kèm tóm tắt nội dung và checklist tư vấn — học nhanh giữa ca làm việc.",
  },
  {
    icon: ClipboardList,
    title: "Làm thử thách thực tế",
    description: "Mỗi ngày một thử thách nhỏ mô phỏng tình huống tại quầy, nộp bài bằng văn bản hoặc link.",
  },
  {
    icon: MessagesSquare,
    title: "Nhận phản hồi & cộng đồng",
    description: "Trao đổi cùng cộng đồng học viên, xem case thực chiến và bài nộp nổi bật để học hỏi.",
  },
  {
    icon: Award,
    title: "Theo dõi tiến độ, nhận huy hiệu",
    description: "Streak học liên tục, badge thành tích và lộ trình rõ ràng giữ bạn kiên trì suốt 28 ngày.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex-1">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Leaf className="size-4.5" />
            </span>
            <span className="text-sm font-bold text-gray-900">28 Ngày Cắt Liều</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dang-nhap"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Đăng nhập
            </Link>
            <LinkButton href="/dang-ky" size="sm">
              Đăng ký ngay
            </LinkButton>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:px-8 md:py-24">
          <div>
            <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
              Chương trình đào tạo thực chiến dành cho dược sĩ
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-gray-900 md:text-5xl">
              28 Ngày Thử Thách <span className="text-primary-600">Cắt Liều</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-gray-600 md:text-lg">
              Rèn tư duy khai thác triệu chứng, nhận diện dấu hiệu cần chuyển tuyến và xây quy trình tư
              vấn riêng — mỗi ngày một bài học ngắn, một thử thách thực tế ngay tại quầy thuốc.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/dang-ky" size="lg">
                Đăng ký tham gia miễn phí
                <ArrowRight className="size-4" />
              </LinkButton>
              <LinkButton href="/dang-nhap" size="lg" variant="outline">
                Tôi đã có tài khoản
              </LinkButton>
            </div>
            <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                ["28", "ngày thử thách"],
                ["28", "bài học ngắn"],
                ["6", "nhóm case thực chiến"],
                ["1", "cộng đồng hỗ trợ"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="text-2xl font-extrabold text-primary-600">{value}</dt>
                  <dd className="text-xs text-gray-500">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-bold text-gray-900">Lộ trình 28 ngày</p>
                <span className="text-xs font-medium text-primary-600">4 tuần</span>
              </div>
              <div className="space-y-3">
                {WEEKS.map((week) => (
                  <div
                    key={week.number}
                    className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-xs font-bold text-white">
                      T{week.number}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{week.title}</p>
                      <p className="text-xs text-gray-500">{week.dayRange}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <span className="absolute -right-4 -top-4 hidden size-24 rounded-full bg-mint-200/60 blur-2xl md:block" />
            <span className="absolute -bottom-6 -left-6 hidden size-28 rounded-full bg-primary-200/50 blur-2xl md:block" />
          </div>
        </div>
      </section>

      {/* Format */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Học theo cách microlearning</h2>
          <p className="mt-2 text-gray-600">
            Mỗi ngày chỉ mất 15-20 phút — học đủ, thực hành đủ, không lý thuyết dàn trải.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {formatSteps.map(({ icon: Icon, title, description }, i) => (
            <div key={title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Icon className="size-4.5" />
                </span>
                <span className="text-xs font-semibold text-gray-400">Bước {i + 1}</span>
              </div>
              <h3 className="text-sm font-bold text-gray-900">{title}</h3>
              <p className="mt-1.5 text-sm text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Audience */}
      <section className="bg-gray-50/70 py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Chương trình dành cho ai?</h2>
            <p className="mt-2 text-gray-600">Phù hợp với bất kỳ ai đang đứng quầy hoặc chuẩn bị đứng quầy.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl border border-gray-200 bg-white p-5">
                <span className="flex size-10 items-center justify-center rounded-xl bg-mint-100 text-mint-700">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-3 text-sm font-bold text-gray-900">{title}</h3>
                <p className="mt-1.5 text-sm text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
              <ShieldCheck className="size-3.5" />
              Lợi ích sau khi hoàn thành
            </span>
            <h2 className="mt-4 text-2xl font-bold text-gray-900 md:text-3xl">
              Tư vấn an toàn hơn, tự tin hơn, chuyên nghiệp hơn
            </h2>
            <p className="mt-3 text-gray-600">
              Không chỉ là kiến thức — bạn sẽ có một quy trình tư vấn thực sự dùng được ngay tại quầy.
            </p>
          </div>
          <ul className="space-y-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-card">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary-600" />
                <span className="text-sm text-gray-700">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Program structure */}
      <section className="bg-gray-50/70 py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Cấu trúc chương trình — 4 tuần</h2>
            <p className="mt-2 text-gray-600">28 bài học được sắp xếp theo lộ trình tăng dần độ khó.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {WEEKS.map((week) => (
              <div key={week.number} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
                <span className="inline-flex items-center rounded-full bg-primary-600 px-2.5 py-1 text-xs font-bold text-white">
                  Tuần {week.number}
                </span>
                <p className="mt-3 text-xs font-semibold text-gray-400">{week.dayRange}</p>
                <h3 className="mt-1 text-sm font-bold text-gray-900">{week.title}</h3>
                <p className="mt-1.5 text-sm text-gray-600">{week.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-primary-600 to-mint-600 px-6 py-12 text-center text-white shadow-card md:px-16">
          <h2 className="text-2xl font-bold md:text-3xl">Sẵn sàng cắt liều tự tin và an toàn hơn?</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-50">
            Tham gia miễn phí ngay hôm nay, học 15-20 phút mỗi ngày và theo dõi tiến độ của chính bạn.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <LinkButton href="/dang-ky" size="lg" className="bg-white text-primary-700 hover:bg-primary-50">
              Đăng ký tham gia ngay
              <ArrowRight className="size-4" />
            </LinkButton>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center text-xs text-gray-500 md:px-8">
          <p>
            © {new Date().getFullYear()} 28 Ngày Thử Thách Cắt Liều. Dành cho mục đích đào tạo, không
            thay thế chỉ định của bác sĩ.
          </p>
        </div>
      </footer>
    </div>
  );
}
