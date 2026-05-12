const VERIFY_MN_API_KEY = process.env.VERIFY_MN_API_KEY ?? "";
const VERIFY_MN_SENDER = process.env.VERIFY_MN_SENDER ?? "LottoMN";

export async function sendSMS(phone: string, message: string): Promise<void> {
  if (!VERIFY_MN_API_KEY) {
    console.log(`[SMS mock] To: ${phone} | ${message}`);
    return;
  }
  try {
    const res = await fetch("https://verify.mn/api/sms/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${VERIFY_MN_API_KEY}`,
      },
      body: JSON.stringify({ phone, message, sender: VERIFY_MN_SENDER }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`[SMS] verify.mn error ${res.status}: ${text}`);
    }
  } catch (err) {
    console.error("[SMS] Failed to send:", err);
  }
}
