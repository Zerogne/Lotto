import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// Legacy EasySendSMS delivery-report webhook. Registered in the EasySendSMS
// dashboard settings; they POST here (url-encoded) whenever a message's
// carrier-side status resolves: source, msisdn, sent_date, sms_id, response
// (DELIVRD | EXPIRED | UNDELIV).
//
// SMS sending now goes through CallPro (see lib/sms.ts), which has no push
// webhook — only a GET /v1/sms/{message_id} polling endpoint — so this route
// no longer receives real traffic. Left in place in case EasySendSMS is ever
// re-enabled; harmless to keep since it just no-ops without matching sms_id rows.

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const params = new URLSearchParams(raw);
  const smsId = params.get("sms_id");
  const response = params.get("response");

  if (!smsId || !response) {
    // Likely a validation ping from the EasySendSMS dashboard setup flow.
    return NextResponse.json({ ok: true });
  }

  const ok = response === "DELIVRD";
  const db = createAdminClient();
  const { error } = await db
    .from("sms_logs")
    .update({ ok, detail: ok ? null : `DLR: ${response}` })
    .eq("sms_id", smsId);

  if (error) {
    console.error("[SMS DLR] Failed to update sms_logs:", error.message);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
