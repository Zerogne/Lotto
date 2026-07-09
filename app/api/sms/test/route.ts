import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "@/lib/sms";

export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });
  const result = await sendSMS(phone, "BLCK: Test message 12345");
  return NextResponse.json(result);
}
