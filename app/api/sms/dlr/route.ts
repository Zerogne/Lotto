import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// EasySendSMS delivery-report webhook. Registered in the EasySendSMS dashboard
// settings; they POST here (url-encoded) whenever a message's carrier-side
// status resolves: source, msisdn, sent_date, sms_id, response
// (DELIVRD | EXPIRED | UNDELIV). This is the only way to catch failures that
// happen *after* their send API already accepted the message (e.g. a carrier
// silently dropping it) — our own send-time logging can't see those.
//
// Must stay publicly reachable (no admin auth) since EasySendSMS calls it
// directly, and must always return 200 so their dashboard validation ping
// (GET/POST/HEAD with no body) succeeds.

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
