const EASYSENDSMS_API_KEY = process.env.EASYSENDSMS_API_KEY ?? "";

export async function sendSMS(phone: string, message: string): Promise<void> {
  if (!EASYSENDSMS_API_KEY) {
    console.log(`[SMS mock] To: ${phone} | ${message}`);
    return;
  }

  // EasySendSMS wants number without + or 00, just country code + number
  const to = phone.startsWith("+")
    ? phone.slice(1)
    : phone.startsWith("00")
    ? phone.slice(2)
    : `976${phone}`;

  try {
    const res = await fetch("https://restapi.easysendsms.app/v1/rest/sms/send", {
      method: "POST",
      headers: {
        apikey: EASYSENDSMS_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        from: "LottoMN",
        to,
        text: message,
        type: "0",
      }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      console.error("[EasySendSMS] error:", data);
    }
  } catch (err) {
    console.error("[EasySendSMS] failed:", err);
  }
}
