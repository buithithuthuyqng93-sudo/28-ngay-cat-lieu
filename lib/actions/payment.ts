"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { getLeadForUser } from "@/lib/leads";
import { buildQrImageUrl } from "@/lib/sepay";
import { generateOrderCode, getLatestOrder } from "@/lib/orders";
import { PROGRAM_PRICE } from "@/lib/constants";

export type CreateOrderFormState = { error?: string } | undefined;

const ORDER_EXPIRY_MS = 30 * 60 * 1000;

export async function createSepayOrder(
  _state: CreateOrderFormState,
  _formData: FormData
): Promise<CreateOrderFormState> {
  const { userId } = await verifySession();

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { paidAt: true } });
  if (user.paidAt) {
    return { error: "Bạn đã thanh toán rồi, không cần tạo đơn hàng mới." };
  }

  const lead = await getLeadForUser(userId);
  if (!lead) {
    return { error: "Vui lòng điền thông tin bên dưới trước khi thanh toán." };
  }

  const existing = await getLatestOrder(userId);
  const existingIsLivePending =
    existing?.status === "pending" && (!existing.expiresAt || existing.expiresAt.getTime() > Date.now());

  if (existingIsLivePending) {
    // Học viên đã có một đơn hàng đang chờ và còn hiệu lực — không tạo trùng, chỉ cần
    // trang re-render để hiển thị lại đúng đơn đó (FR-009).
    revalidatePath("/thanh-toan");
    return undefined;
  }

  const orderCode = generateOrderCode();
  const qrImageUrl = buildQrImageUrl(orderCode, PROGRAM_PRICE);

  await prisma.order.create({
    data: {
      userId,
      orderCode,
      amount: PROGRAM_PRICE,
      status: "pending",
      qrImageUrl,
      expiresAt: new Date(Date.now() + ORDER_EXPIRY_MS),
    },
  });

  revalidatePath("/thanh-toan");
  return undefined;
}
