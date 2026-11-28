import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

const TOKEN_HASH = "a922d05df00f684139d099f966f5e3d5d94318665c65b4d3f58782a30105b234";
const PAGE_SIZE = 1000;

const targets = [
  { id: "bfcfa3f1-2525-4362-8160-f46b70bbd1a3", name: "Tesla", digits: 5 },
  { id: "e740a040-24cb-45ed-bdd5-6d773346319f", name: "IPhone 18 Pro", digits: 4 },
] as const;

async function sha256(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

interface CodeRow {
  code: string;
  phone: string;
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if ((await sha256(token)) !== TOKEN_HASH) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const db = createAdminClient();
  const reports = [];

  for (const target of targets) {
    const pattern = "_".repeat(target.digits);
    const { count: total, error: totalError } = await db
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("lottery_id", target.id);
    if (totalError) throw new Error(totalError.message);

    const invalidRows: CodeRow[] = [];
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await db
        .from("tickets")
        .select("code, phone")
        .eq("lottery_id", target.id)
        .not("code", "like", pattern)
        .order("code", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);
      if (error) throw new Error(error.message);
      invalidRows.push(...((data ?? []) as CodeRow[]));
      if (!data || data.length < PAGE_SIZE) break;
    }

    const maxCode = 10 ** target.digits - 1;
    const canonicalCodes = new Set<string>();
    for (const row of invalidRows) {
      if (!/^\d+$/.test(row.code)) continue;
      const numeric = Number(row.code);
      if (numeric >= 1 && numeric <= maxCode) {
        canonicalCodes.add(String(numeric).padStart(target.digits, "0"));
      }
    }

    const canonicalRows: CodeRow[] = [];
    const canonicalList = Array.from(canonicalCodes);
    for (let index = 0; index < canonicalList.length; index += 100) {
      const chunk = canonicalList.slice(index, index + 100);
      const { data, error } = await db
        .from("tickets")
        .select("code, phone")
        .eq("lottery_id", target.id)
        .in("code", chunk);
      if (error) throw new Error(error.message);
      canonicalRows.push(...((data ?? []) as CodeRow[]));
    }

    const byNumericCode = new Map<string, CodeRow[]>();
    for (const row of [...invalidRows, ...canonicalRows]) {
      if (!/^\d+$/.test(row.code)) continue;
      const key = String(Number(row.code));
      const rows = byNumericCode.get(key) ?? [];
      rows.push(row);
      byNumericCode.set(key, rows);
    }

    const normalizedCollisions = Array.from(byNumericCode.entries())
      .filter(([, rows]) => new Set(rows.map((row) => row.code)).size > 1)
      .map(([numericCode, rows]) => ({ numericCode, registrations: rows }));

    reports.push({
      lottery: target.name,
      lotteryId: target.id,
      expectedDigits: target.digits,
      totalRows: total ?? 0,
      invalidLengthCount: invalidRows.length,
      invalidRows,
      normalizedCollisionCount: normalizedCollisions.length,
      normalizedCollisions,
    });
  }

  return NextResponse.json({ reports });
}
