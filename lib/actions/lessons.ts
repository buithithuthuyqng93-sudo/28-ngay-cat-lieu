"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

export async function markLessonComplete(lessonId: string, day: number) {
  const { userId } = await verifySession();

  await prisma.progress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {},
    create: { userId, lessonId, status: "completed" },
  });

  revalidatePath("/dashboard");
  revalidatePath("/lo-trinh");
  revalidatePath("/tien-do");
  revalidatePath(`/bai-hoc/${day}`);
}

export async function unmarkLessonComplete(lessonId: string, day: number) {
  const { userId } = await verifySession();

  await prisma.progress.deleteMany({ where: { userId, lessonId } });

  revalidatePath("/dashboard");
  revalidatePath("/lo-trinh");
  revalidatePath("/tien-do");
  revalidatePath(`/bai-hoc/${day}`);
}
