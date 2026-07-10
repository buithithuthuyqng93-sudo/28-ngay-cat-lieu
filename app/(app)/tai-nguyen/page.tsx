import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { RESOURCE_TYPES } from "@/lib/resource-types";
import { ResourceCard } from "@/components/resources/ResourceCard";

export const metadata: Metadata = { title: "Tài nguyên | 28 Ngày Thử Thách Cắt Liều" };

export default async function ResourcesPage() {
  const resources = await prisma.resource.findMany({ orderBy: { title: "asc" } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tài nguyên tư vấn</h1>
        <p className="mt-1 text-sm text-gray-600">
          Checklist, bộ câu hỏi và mẫu quy trình — xem nhanh, sao chép hoặc tải về dùng ngay tại quầy.
        </p>
      </div>

      {RESOURCE_TYPES.map(({ type, label }) => {
        const items = resources.filter((r) => r.type === type);
        if (items.length === 0) return null;

        return (
          <section key={type}>
            <h2 className="mb-3 text-lg font-bold text-gray-900">{label}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
