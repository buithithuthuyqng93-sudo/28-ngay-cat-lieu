"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { getPayOS } from "@/lib/payos";
import { generatePayosOrderCode, getLatestOrder } from "@/lib/orders";
import { PROGRAM_PRICE } from "@/lib/constants";

export type CreateOrderFormState = { error?: string } | undefined;

function appUrl(path: string) {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  return new URL(path, base).toString();
}

export async function createPayOSOrder(
  _state: CreateOrderFormState,
  _formData: FormData
): Promise<CreateOrderFormState> {
  const { userId } = await verifySession();

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { paidAt: true } });
  if (user.paidAt) {
    return { error: "Bạn đã thanh toán rồi, không cần tạo đơn hàng mới." };
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

  const orderCode = generatePayosOrderCode();

  let link;
  try {
    link = await getPayOS().paymentRequests.create({
      orderCode,
      amount: PROGRAM_PRICE,
      description: `CATLIEU ${String(orderCode).slice(-8)}`,
      returnUrl: appUrl("/thanh-toan?status=success"),
      cancelUrl: appUrl("/thanh-toan?status=cancelled"),
    });
  } catch (error) {
    console.error("[payos] create payment link failed", error);
    return { error: "Không tạo được đơn hàng thanh toán. Vui lòng thử lại sau ít phút." };
  }

  await prisma.order.create({
    data: {
      userId,
      payosOrderCode: orderCode,
      amount: PROGRAM_PRICE,
      status: "pending",
      checkoutUrl: link.checkoutUrl,
      qrCode: link.qrCode,
      paymentLinkId: link.paymentLinkId,
      expiresAt: link.expiredAt ? new Date(link.expiredAt * 1000) : null,
    },
  });

  revalidatePath("/thanh-toan");
  return undefined;
}
