import { NextResponse } from "next/server";
import { runMigrations } from "@/lib/migrate";

export async function POST() {
  const result = await runMigrations();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, message: "Хүснэгтүүд амжилттай үүслээ" });
}
