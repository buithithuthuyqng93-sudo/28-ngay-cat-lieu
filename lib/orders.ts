import "server-only";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { findMatchingSepayTransaction } from "@/lib/sepay";
import { sendChallengeConfirmationEmail } from "@/lib/email";
import type { Order } from "@/generated/prisma/client";

const ORDER_CODE_PREFIX = "CATLIEU";

export function generateOrderCode(): string {
  // Uppercase because Vietnamese banking apps commonly uppercase transfer content before
  // it reaches SePay — generating it uppercase up front avoids a case-mismatch on lookup.
  return `${ORDER_CODE_PREFIX}${randomBytes(5).toString("hex").toUpperCase()}`;
}

export async function getLatestOrder(userId: string): Promise<Order | null> {
  return prisma.order.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Marks an order (and its user) as paid, then sends the confirmation email. Safe to call
 * more than once for the same order — a no-op if it was already paid. Used by both the
 * webhook handler and the on-page status sync fallback, so both paths share one
 * idempotent code path and neither can double-send the email.
 */
export async function confirmOrderPaid(orderCode: string): Promise<Order | null> {
  const confirmed = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { orderCode } });
    if (!order || order.status === "paid") return null;

    const paidAt = new Date();
    const updated = await tx.order.update({
      where: { id: order.id },
      data: { status: "paid", paidAt },
    });
    await tx.user.update({ where: { id: order.userId }, data: { paidAt } });
    return updated;
  });

  if (confirmed) {
    const user = await prisma.user.findUnique({
      where: { id: confirmed.userId },
      select: { email: true, name: true },
    });
    if (user) {
      try {
        await sendChallengeConfirmationEmail(user);
      } catch (error) {
        console.error("[email] failed to send challenge confirmation", confirmed.orderCode, error);
      }
    }
  }

  return confirmed;
}

/**
 * SePay does not push a cancellation event and a static QR has no "status" of its own —
 * the only source of truth for "did this actually get paid" besides the webhook is asking
 * SePay's transaction list directly (server-to-server, our own token). Also handles our
 * own self-imposed expiry, since SePay doesn't expire QR links either.
 */
export async function syncOrderStatus(order: Order): Promise<Order> {
  if (order.status !== "pending") return order;

  if (order.expiresAt && order.expiresAt.getTime() < Date.now()) {
    return prisma.order.update({ where: { id: order.id }, data: { status: "expired" } });
  }

  try {
    const match = await findMatchingSepayTransaction(order.orderCode, order.amount);
    if (match) {
      const confirmed = await confirmOrderPaid(order.orderCode);
      return confirmed ?? order;
    }
    return order;
  } catch (error) {
    // SePay unreachable — keep showing the local pending state rather than failing the
    // page; the webhook may still arrive.
    console.error("[sepay] status reconciliation failed", order.orderCode, error);
    return order;
  }
}
