/**
 * One-off script: register this app's production webhook URL with PayOS so they know
 * where to send payment notifications. Run once after PAYOS_* env vars are set for real
 * and the app is deployed:
 *
 *   npx tsx scripts/register-payos-webhook.ts https://your-domain.vercel.app
 *
 * Re-running with the same URL is safe (PayOS just re-confirms/overwrites it).
 */
import "dotenv/config";
import { PayOS } from "@payos/node";

async function main() {
  const baseUrl = process.argv[2];
  if (!baseUrl) {
    console.error("Usage: npx tsx scripts/register-payos-webhook.ts https://your-domain.vercel.app");
    process.exit(1);
  }

  const payos = new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID!,
    apiKey: process.env.PAYOS_API_KEY!,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY!,
  });

  const webhookUrl = new URL("/api/webhook/payos", baseUrl).toString();
  const result = await payos.webhooks.confirm(webhookUrl);
  console.log("Webhook registered:", result);
}

main().catch((error) => {
  console.error("Failed to register webhook:", error);
  process.exit(1);
});
