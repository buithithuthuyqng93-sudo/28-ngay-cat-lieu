import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, MessageCircleQuestion, FileText, Stethoscope, AlertTriangle, MessageSquareHeart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCategoryMeta } from "@/lib/case-categories";
import { Card } from "@/components/ui/Card";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await prisma.caseStudy.findUnique({ where: { slug } });
  return { title: item ? `${item.title} | Tình huống thực chiến` : "Tình huống thực chiến" };
}

export default async function CaseDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await prisma.caseStudy.findUnique({ where: { slug } });
  if (!item) notFound();

  const category = getCategoryMeta(item.category);
  const questions = (item.questions as unknown as string[]) ?? [];
  const redFlags = (item.redFlags as unknown as string[]) ?? [];

  return (
    <div className="space-y-6 pb-8">
      <Link href="/tinh-huong" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
        <ArrowLeft className="size-4" />
        Thư viện tình huống
      </Link>

      <div>
        <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-bold text-primary-700">
          {category.label}
        </span>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{item.title}</h1>
      </div>

      <Card className="p-5">
        <div className="mb-2 flex items-center gap-2 text-gray-700">
          <FileText className="size-4.5" />
          <p className="text-sm font-bold">Mô tả tình huống</p>
        </div>
        <p className="text-sm leading-relaxed text-gray-700">{item.description}</p>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2 text-primary-700">
          <MessageCircleQuestion className="size-4.5" />
          <p className="text-sm font-bold">Câu hỏi khai thác</p>
        </div>
        <ul className="space-y-2">
          {questions.map((q, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border border-primary-300 text-[10px] font-bold text-primary-600">
                {i + 1}
              </span>
              {q}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-5">
        <p className="mb-2 text-sm font-bold text-gray-900">Dữ kiện bổ sung</p>
        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{item.additional}</p>
      </Card>

      <Card className="p-5">
        <div className="mb-2 flex items-center gap-2 text-mint-700">
          <Stethoscope className="size-4.5" />
          <p className="text-sm font-bold">Hướng xử trí</p>
        </div>
        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{item.management}</p>
      </Card>

      <Card className="border-red-200 bg-red-50/60 p-5">
        <div className="mb-3 flex items-center gap-2 text-red-700">
          <AlertTriangle className="size-4.5" />
          <p className="text-sm font-bold">Dấu hiệu cần chuyển tuyến</p>
        </div>
        <ul className="space-y-2">
          {redFlags.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-red-800">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-red-500" />
              {f}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-5">
        <div className="mb-2 flex items-center gap-2 text-amber-700">
          <MessageSquareHeart className="size-4.5" />
          <p className="text-sm font-bold">Cách dặn dò khách hàng</p>
        </div>
        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{item.counseling}</p>
      </Card>
    </div>
  );
}
