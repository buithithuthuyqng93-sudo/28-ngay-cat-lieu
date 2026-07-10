"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

/**
 * Demo/mock payment: no real gateway is wired up yet. This just marks the
 * account as paid so the unlock flow can be reviewed end-to-end, and swaps
 * out for a real gateway confirmation (webhook or manual approval) later.
 */
export async function markAsPaid() {
  const { userId } = await verifySession();

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { paidAt: true } });
  if (!user.paidAt) {
    await prisma.user.update({ where: { id: userId }, data: { paidAt: new Date() } });
  }

  revalidatePath("/dashboard");
  revalidatePath("/lo-trinh");
  revalidatePath("/thu-thach");
  revalidatePath("/tien-do");
  revalidatePath("/thanh-toan");
  redirect("/lo-trinh?paid=1");
}
