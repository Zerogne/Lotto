const EASYSENDSMS_API_KEY = process.env.EASYSENDSMS_API_KEY ?? "";

export async function sendSMS(phone: string, message: string): Promise<{ ok: boolean; detail?: string }> {
  if (!EASYSENDSMS_API_KEY) {
    console.log(`[SMS mock] To: ${phone} | ${message}`);
    return { ok: false, detail: "EASYSENDSMS_API_KEY not set" };
  }

  const to = phone.startsWith("+")
    ? phone.slice(1)
    : phone.startsWith("00")
    ? phone.slice(2)
    : `976${phone}`;

  console.log(`[SMS] Sending to ${to}: ${message}`);

  try {
    const res = await fetch("https://restapi.easysendsms.app/v1/rest/sms/send", {
      method: "POST",
      headers: {
        apikey: EASYSENDSMS_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ from: "BLCK", to, text: message, type: "0" }),
    });

    const data = await res.json();
    console.log(`[SMS] EasySendSMS response (${res.status}):`, JSON.stringify(data));

    if (!res.ok || data.error) {
      return { ok: false, detail: JSON.stringify(data) };
    }
    return { ok: true };
  } catch (err) {
    console.error("[SMS] fetch failed:", err);
    return { ok: false, detail: String(err) };
  }
}
