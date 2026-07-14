import { NextResponse } from "next/server";
import { getFailedSmsLogs } from "@/lib/db";

export async function GET() {
  const logs = await getFailedSmsLogs();
  return NextResponse.json(logs);
}
