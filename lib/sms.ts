const VERIFY_MN_API_KEY = process.env.VERIFY_MN_API_KEY ?? "";

// Placeholder — replace with a real outbound SMS provider for winner notifications
export async function sendSMS(phone: string, message: string): Promise<void> {
  console.log(`[SMS] To: ${phone} | ${message}`);
}

export interface VerifySession {
  sessionId: string;
  displayInstruction: string;
  smsUri: string;
  text: string;
}

export async function createTicketSession(
  phone: string,
  codes: string[]
): Promise<VerifySession | null> {
  // Random 4-char trigger word unique per session
  const triggerText = Math.random().toString(36).slice(2, 6).toUpperCase();
  // responseSms is ASCII only, max 160 chars
  const responseSms = `LottoMN: ${codes.join(",")}`.slice(0, 160);

  if (!VERIFY_MN_API_KEY) {
    console.log(`[SMS mock] phone=${phone} codes=${codes.join(",")} trigger=${triggerText}`);
    return {
      sessionId: "mock",
      displayInstruction: `144773 дугаарт "${triggerText}" гэж SMS илгээнэ үү`,
      smsUri: `sms:144773?body=${encodeURIComponent(triggerText)}`,
      text: triggerText,
    };
  }

  try {
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://lottomn.vercel.app"}/api/verify-callback`;

    const res = await fetch("https://api.verify.mn/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${VERIFY_MN_API_KEY}`,
      },
      body: JSON.stringify({ phone, text: triggerText, responseSms, callback: callbackUrl }),
    });
    if (!res.ok) {
      console.error("[verify.mn] session error:", res.status, await res.text());
      return null;
    }
    return res.json();
  } catch (err) {
    console.error("[verify.mn] failed:", err);
    return null;
  }
}
