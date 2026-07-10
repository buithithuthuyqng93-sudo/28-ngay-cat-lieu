import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CASE_CATEGORIES } from "@/lib/case-categories";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Tình huống thực chiến | 28 Ngày Thử Thách Cắt Liều" };

export default async function CaseLibraryPage() {
  const cases = await prisma.caseStudy.findMany({ orderBy: { title: "asc" } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thư viện tình huống thực chiến</h1>
        <p className="mt-1 text-sm text-gray-600">
          Case thật tại quầy, chia theo nhóm bệnh — kèm câu hỏi khai thác, hướng xử trí và dấu hiệu cần chuyển tuyến.
        </p>
      </div>

      {CASE_CATEGORIES.map((category) => {
        const items = cases.filter((c) => c.category === category.slug);
        if (items.length === 0) return null;
        const Icon = category.icon;

        return (
          <section key={category.slug}>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <Icon className="size-4.5" />
              </span>
              <h2 className="text-lg font-bold text-gray-900">{category.label}</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Link key={item.id} href={`/tinh-huong/${item.slug}`}>
                  <Card className="h-full p-4 transition hover:border-primary-300">
                    <p className="text-sm font-bold text-gray-900">{item.title}</p>
                    <p className="mt-1.5 line-clamp-3 text-xs text-gray-500">{item.description}</p>
                    <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary-600">
                      Xem chi tiết
                      <ArrowRight className="size-3.5" />
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
