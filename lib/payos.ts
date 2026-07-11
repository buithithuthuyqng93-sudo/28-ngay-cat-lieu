import "server-only";
import { PayOS } from "@payos/node";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

let client: PayOS | undefined;

/**
 * Lazily constructed so importing this module (e.g. for Next.js build-time page-data
 * collection of app/api/webhook/payos/route.ts) never requires PAYOS_* env vars to be
 * set — only actually calling the PayOS API does.
 */
export function getPayOS(): PayOS {
  if (!client) {
    client = new PayOS({
      clientId: requireEnv("PAYOS_CLIENT_ID"),
      apiKey: requireEnv("PAYOS_API_KEY"),
      checksumKey: requireEnv("PAYOS_CHECKSUM_KEY"),
    });
  }
  return client;
}
