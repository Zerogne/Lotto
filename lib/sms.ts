const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID ?? "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN ?? "";
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER ?? "";

export async function sendSMS(phone: string, message: string): Promise<void> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.log(`[SMS mock] To: ${phone} | ${message}`);
    return;
  }

  // Mongolian numbers need +976 prefix
  const to = phone.startsWith("+") ? phone : `+976${phone}`;

  const body = new URLSearchParams({
    From: TWILIO_PHONE_NUMBER,
    To: to,
    Body: message,
  });

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64")}`,
        },
        body: body.toString(),
      }
    );
    if (!res.ok) {
      const text = await res.text();
      console.error(`[Twilio] error ${res.status}:`, text);
    }
  } catch (err) {
    console.error("[Twilio] failed:", err);
  }
}
