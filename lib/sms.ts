import { createAdminClient } from "./supabase";

const EASYSENDSMS_API_KEY = process.env.EASYSENDSMS_API_KEY ?? "";

const SMS_MAX_ATTEMPTS = 3;
const SMS_RETRY_DELAY_MS = 1000;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface SmsMeta {
  lotteryId?: string;
  purchaseGroupId?: string;
}

// Best-effort audit log so failed sends can be found and resent later. Never
// throws — a logging failure must not affect whether the SMS send is reported as ok.
async function logSmsAttempt(
  phone: string,
  message: string,
  result: { ok: boolean; detail?: string },
  meta?: SmsMeta
) {
  try {
    const db = createAdminClient();
    await db.from("sms_logs").insert({
      phone,
      message,
      ok: result.ok,
      detail: result.detail ?? null,
      lottery_id: meta?.lotteryId ?? null,
      purchase_group_id: meta?.purchaseGroupId ?? null,
    });
  } catch (err) {
    console.error("[SMS] Failed to write sms_logs entry:", err);
  }
}

async function sendSMSOnce(phone: string, message: string): Promise<{ ok: boolean; detail?: string }> {
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

// Retries transient failures (network errors, non-2xx, EasySendSMS `error` field)
// since messages carrying real lottery codes must not silently fail to send.
// Every final outcome (ok or failed) is recorded to sms_logs so failed sends
// can be listed and resent later from the admin panel.
export async function sendSMS(
  phone: string,
  message: string,
  meta?: SmsMeta
): Promise<{ ok: boolean; detail?: string }> {
  let lastResult: { ok: boolean; detail?: string } = { ok: false, detail: "not attempted" };

  for (let attempt = 1; attempt <= SMS_MAX_ATTEMPTS; attempt++) {
    lastResult = await sendSMSOnce(phone, message);
    if (lastResult.ok) {
      await logSmsAttempt(phone, message, lastResult, meta);
      return lastResult;
    }

    // Missing API key is not transient — retrying won't help.
    if (lastResult.detail === "EASYSENDSMS_API_KEY not set") {
      await logSmsAttempt(phone, message, lastResult, meta);
      return lastResult;
    }

    if (attempt < SMS_MAX_ATTEMPTS) {
      console.warn(`[SMS] Attempt ${attempt} failed for ${phone}, retrying... (${lastResult.detail})`);
      await delay(SMS_RETRY_DELAY_MS * attempt);
    }
  }

  console.error(`[SMS] All ${SMS_MAX_ATTEMPTS} attempts failed for ${phone}: ${lastResult.detail}`);
  await logSmsAttempt(phone, message, lastResult, meta);
  return lastResult;
}
