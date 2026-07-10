import Link from "next/link";
import type { Metadata } from "next";
import { Leaf, ArrowRight, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { LinkButton } from "@/components/ui/Button";
import { LessonContent } from "@/components/lessons/LessonContent";
import { PROGRAM_PRICE_LABEL } from "@/lib/progress";

export const metadata: Metadata = {
  title: "Học thử miễn phí Ngày 1 | 28 Ngày Thử Thách Cắt Liều",
  description: "Xem thử bài học Ngày 1 của chương trình 28 Ngày Thử Thách Cắt Liều, hoàn toàn miễn phí, không cần đăng ký.",
};

export default async function TrialLessonPage() {
  const lesson = await prisma.lesson.findUnique({ where: { day: 1 } });
  if (!lesson) return null;

  return (
    <div className="flex-1 bg-gray-50/50">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Leaf className="size-4.5" />
            </span>
            <span className="text-sm font-bold text-gray-900">28 Ngày Cắt Liều</span>
          </Link>
          <LinkButton href="/dang-ky" size="sm">
            Đăng ký học
          </LinkButton>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div className="rounded-2xl border border-primary-200 bg-primary-50 px-4 py-3 text-center text-sm font-medium text-primary-800">
          <Sparkles className="mr-1.5 inline size-4" />
          Học thử miễn phí — không cần đăng ký để xem bài này
        </div>

        <LessonContent
          lesson={lesson}
          challengeCta={
            <p className="mt-4 text-sm text-amber-800">
              Đăng ký tài khoản miễn phí để lưu tiến độ và nộp thử thách này.
            </p>
          }
        />

        <div className="rounded-3xl bg-gradient-to-br from-primary-600 to-mint-600 px-6 py-10 text-center text-white shadow-card">
          <h2 className="text-xl font-bold">Thích bài học này? Còn 27 ngày nữa đang chờ bạn</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-primary-50">
            Đăng ký miễn phí, sau đó mở khóa toàn bộ chương trình chỉ với {PROGRAM_PRICE_LABEL}.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <LinkButton href="/dang-ky" size="lg" className="bg-white text-primary-700 hover:bg-primary-50">
              Đăng ký miễn phí
              <ArrowRight className="size-4" />
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
}
