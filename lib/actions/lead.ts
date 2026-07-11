"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

const LeadSchema = z.object({
  phone: z.string().trim().min(8, "Số điện thoại không hợp lệ."),
  pharmacyName: z.string().trim().min(2, "Vui lòng nhập tên nhà thuốc/quầy thuốc."),
  surveyRole: z.enum(["nha-thuoc", "quay-thuoc", "sinh-vien", "khac"], {
    error: "Vui lòng chọn một lựa chọn.",
  }),
  surveyChallenge: z.string().trim().min(3, "Vui lòng chia sẻ ngắn gọn giúp mình."),
});

export type LeadFormState =
  | {
      errors?: {
        phone?: string[];
        pharmacyName?: string[];
        surveyRole?: string[];
        surveyChallenge?: string[];
      };
    }
  | undefined;

export async function saveLead(_state: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const { userId } = await verifySession();

  const validated = LeadSchema.safeParse({
    phone: formData.get("phone"),
    pharmacyName: formData.get("pharmacyName"),
    surveyRole: formData.get("surveyRole"),
    surveyChallenge: formData.get("surveyChallenge"),
  });

  if (!validated.success) {
    return { errors: z.flattenError(validated.error).fieldErrors };
  }

  try {
    await prisma.lead.create({ data: { userId, ...validated.data } });
  } catch (error) {
    // Unique constraint on userId — a Lead already exists (e.g. double submit). That's
    // fine, treat it as success rather than surfacing an error.
    const isDuplicate = error instanceof Error && error.message.includes("Unique constraint");
    if (!isDuplicate) throw error;
  }

  revalidatePath("/thanh-toan");
  return undefined;
}
