import "server-only";
import { prisma } from "@/lib/prisma";
import { getPayOS } from "@/lib/payos";
import type { Order } from "@/generated/prisma/client";

/** Seconds since this fixed epoch — fits comfortably in a 32-bit Int for ~68 years. */
const PAYOS_ORDER_CODE_EPOCH_MS = new Date("2026-01-01T00:00:00Z").getTime();

export function generatePayosOrderCode(): number {
  return Math.floor((Date.now() - PAYOS_ORDER_CODE_EPOCH_MS) / 1000);
}

export async function getLatestOrder(userId: string): Promise<Order | null> {
  return prisma.order.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Marks an order (and its user) as paid. Safe to call more than once for the same
 * order — a no-op if it was already paid. Used by both the webhook handler and the
 * on-page status sync fallback, so both paths share one idempotent code path.
 */
export async function confirmOrderPaid(payosOrderCode: number): Promise<Order | null> {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { payosOrderCode } });
    if (!order || order.status === "paid") return null;

    const paidAt = new Date();
    const updated = await tx.order.update({
      where: { id: order.id },
      data: { status: "paid", paidAt },
    });
    await tx.user.update({ where: { id: order.userId }, data: { paidAt } });
    return updated;
  });
}

/**
 * PayOS only pushes a webhook for successful payments — there is no push event for
 * cancellation. When the learner reopens the checkout page with a pending order, ask
 * PayOS directly (server-to-server, using our own API key) for the authoritative
 * current status instead of guessing from a local expiry timestamp.
 */
export async function syncOrderStatus(order: Order): Promise<Order> {
  if (order.status !== "pending") return order;

  if (order.expiresAt && order.expiresAt.getTime() < Date.now()) {
    return prisma.order.update({ where: { id: order.id }, data: { status: "expired" } });
  }

  try {
    const remote = await getPayOS().paymentRequests.get(order.payosOrderCode);

    if (remote.status === "PAID") {
      const confirmed = await confirmOrderPaid(order.payosOrderCode);
      return confirmed ?? order;
    }

    if (remote.status === "CANCELLED") {
      return prisma.order.update({ where: { id: order.id }, data: { status: "cancelled" } });
    }

    if (remote.status === "EXPIRED") {
      return prisma.order.update({ where: { id: order.id }, data: { status: "expired" } });
    }

    return order;
  } catch {
    // PayOS unreachable or order not found on their side — keep showing the local
    // pending state rather than failing the page; the webhook may still arrive.
    return order;
  }
}
