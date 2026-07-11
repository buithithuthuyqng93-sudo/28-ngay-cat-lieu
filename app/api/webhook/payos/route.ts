import { NextResponse } from "next/server";
import type { Webhook } from "@payos/node";
import { getPayOS } from "@/lib/payos";
import { confirmOrderPaid } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  let body: Webhook;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  let data;
  try {
    data = await getPayOS().webhooks.verify(body);
  } catch {
    // Signature missing/invalid — never trust the payload, never touch the DB.
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const receivedAt = new Date();

  try {
    const order = await prisma.order.findUnique({ where: { payosOrderCode: data.orderCode } });

    if (!order) {
      // Unknown order — likely PayOS's endpoint-validation ping when the webhook URL was
      // registered, or a test event. Not an error: acknowledge so PayOS doesn't retry.
      console.info("[payos-webhook] no-op: unknown orderCode", data.orderCode, receivedAt.toISOString());
      return NextResponse.json({ received: true });
    }

    if (order.status === "paid") {
      console.info("[payos-webhook] no-op: already paid", data.orderCode, receivedAt.toISOString());
      return NextResponse.json({ received: true });
    }

    await confirmOrderPaid(data.orderCode);
    console.info("[payos-webhook] confirmed payment", data.orderCode, receivedAt.toISOString());
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[payos-webhook] processing error", data.orderCode, receivedAt.toISOString(), error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
