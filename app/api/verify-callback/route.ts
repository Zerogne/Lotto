import { NextRequest, NextResponse } from "next/server";

// verify.mn calls this GET endpoint after the user texts 144773 and the session is verified.
// Must return 2xx within 3 seconds. No body is sent by verify.mn.
export async function GET(_req: NextRequest) {
  return NextResponse.json({ ok: true });
}
