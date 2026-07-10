"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

const SubmissionSchema = z.object({
  challengeId: z.string().min(1),
  type: z.enum(["text", "link"]),
  content: z.string().trim().min(1, "Vui lòng nhập nội dung trước khi nộp bài."),
});

export type SubmissionFormState =
  | {
      error?: string;
    }
  | undefined;

export async function submitChallenge(
  _state: SubmissionFormState,
  formData: FormData
): Promise<SubmissionFormState> {
  const { userId } = await verifySession();

  const parsed = SubmissionSchema.safeParse({
    challengeId: formData.get("challengeId"),
    type: formData.get("type"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { error: z.flattenError(parsed.error).fieldErrors.content?.[0] ?? "Dữ liệu không hợp lệ." };
  }

  const { challengeId, type, content } = parsed.data;

  if (type === "link") {
    try {
      new URL(content);
    } catch {
      return { error: "Link không hợp lệ. Vui lòng nhập đầy đủ URL (bắt đầu bằng http:// hoặc https://)." };
    }
  }

  await prisma.submission.upsert({
    where: { userId_challengeId: { userId, challengeId } },
    update: { type, content, submittedAt: new Date() },
    create: { userId, challengeId, type, content },
  });

  revalidatePath("/thu-thach");
  revalidatePath("/tien-do");
  revalidatePath("/cong-dong");
}
