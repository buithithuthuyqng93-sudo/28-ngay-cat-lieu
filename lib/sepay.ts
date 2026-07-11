import "server-only";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function buildQrImageUrl(orderCode: string, amount: number): string {
  const account = requireEnv("SEPAY_BANK_ACCOUNT");
  const bank = requireEnv("SEPAY_BANK_NAME");
  const params = new URLSearchParams({
    acc: account,
    bank,
    amount: String(amount),
    des: orderCode,
    template: "compact",
  });
  return `https://qr.sepay.vn/img?${params.toString()}`;
}

type SepayTransaction = {
  id: string;
  account_number: string;
  transaction_content: string;
  code: string | null;
  amount_in: string;
  reference_number: string;
};

/**
 * Fallback reconciliation: ask SePay directly (server-to-server, our own token) whether a
 * matching bank transaction has already arrived, in case the webhook was delayed or missed.
 */
export async function findMatchingSepayTransaction(
  orderCode: string,
  amount: number
): Promise<SepayTransaction | null> {
  const account = requireEnv("SEPAY_BANK_ACCOUNT");
  const token = requireEnv("SEPAY_USER_API_TOKEN");

  const url = `https://my.sepay.vn/userapi/transactions/list?account_number=${encodeURIComponent(account)}&limit=20`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`SePay transactions API returned ${res.status}`);
  }

  const body: { transactions?: SepayTransaction[] } = await res.json();
  const transactions = body.transactions ?? [];

  return (
    transactions.find((tx) => {
      const codeMatches = tx.code === orderCode || tx.transaction_content?.includes(orderCode);
      const amountMatches = Math.round(Number(tx.amount_in)) === amount;
      return codeMatches && amountMatches;
    }) ?? null
  );
}
