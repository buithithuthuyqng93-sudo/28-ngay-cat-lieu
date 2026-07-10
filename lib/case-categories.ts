import { Wind, Salad, Sparkles, Flower2, Baby, HeartPulse, type LucideIcon } from "lucide-react";

export type CaseCategory = {
  slug: string;
  label: string;
  icon: LucideIcon;
};

export const CASE_CATEGORIES: CaseCategory[] = [
  { slug: "ho-hap", label: "Hô hấp", icon: Wind },
  { slug: "tieu-hoa", label: "Tiêu hóa", icon: Salad },
  { slug: "da-lieu", label: "Da liễu", icon: Sparkles },
  { slug: "phu-khoa", label: "Phụ khoa", icon: Flower2 },
  { slug: "tre-em", label: "Trẻ em", icon: Baby },
  { slug: "nguoi-gia-benh-nen", label: "Người già / bệnh nền", icon: HeartPulse },
];

export function getCategoryMeta(slug: string): CaseCategory {
  return CASE_CATEGORIES.find((c) => c.slug === slug) ?? CASE_CATEGORIES[0];
}
