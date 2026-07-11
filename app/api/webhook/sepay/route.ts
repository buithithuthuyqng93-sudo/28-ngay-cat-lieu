import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { confirmOrderPaid } from "@/lib/orders";

const ORDER_CODE_PATTERN = /CATLIEU[A-Z0-9]+/i;

function timingSafeStringEqual(a: string, b: string) {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

type SepayWebhookPayload = {
  code?: string | null;
  content?: string;
  transferType?: "in" | "out";
  transferAmount?: number;
};

export async function POST(req: Request) {
  const expectedKey = process.env.SEPAY_WEBHOOK_API_KEY;
  const authHeader = req.headers.get("authorization") ?? "";

  if (!expectedKey || !timingSafeStringEqual(authHeader, `Apikey ${expectedKey}`)) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  let payload: SepayWebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "invalid body" }, { status: 400 });
  }

  const receivedAt = new Date().toISOString();

  if (payload.transferType !== "in") {
    return NextResponse.json({ success: true });
  }

  const orderCode = (payload.code || payload.content?.match(ORDER_CODE_PATTERN)?.[0])?.toUpperCase();

  if (!orderCode) {
    console.info("[sepay-webhook] no-op: no order code in payload", receivedAt);
    return NextResponse.json({ success: true });
  }

  try {
    const order = await prisma.order.findUnique({ where: { orderCode } });

    if (!order) {
      console.info("[sepay-webhook] no-op: unknown orderCode", orderCode, receivedAt);
      return NextResponse.json({ success: true });
    }

    if (order.status === "paid") {
      console.info("[sepay-webhook] no-op: already paid", orderCode, receivedAt);
      return NextResponse.json({ success: true });
    }

    if (payload.transferAmount !== order.amount) {
      console.warn(
        "[sepay-webhook] amount mismatch, not confirming",
        orderCode,
        payload.transferAmount,
        order.amount,
        receivedAt
      );
      return NextResponse.json({ success: true });
    }

    await confirmOrderPaid(orderCode);
    console.info("[sepay-webhook] confirmed payment", orderCode, receivedAt);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[sepay-webhook] processing error", orderCode, receivedAt, error);
    return NextResponse.json({ success: false, error: "internal error" }, { status: 500 });
  }
}
