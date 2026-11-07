const PAYSTACK_API = "https://api.paystack.co";

export async function paystackRequest<T>(path: string, body?: unknown, method = "POST"): Promise<T> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("Card payments are not configured. Add PAYSTACK_SECRET_KEY.");
  const response = await fetch(`${PAYSTACK_API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store"
  });
  const data = await response.json();
  if (!response.ok || !data.status) throw new Error(data.message || "Payment provider request failed.");
  return data;
}
