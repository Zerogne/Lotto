import { NextRequest, NextResponse, after } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/adminAuth";
import { sendSMS } from "@/lib/sms";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lotteryId = searchParams.get("lotteryId");
  const status = searchParams.get("status");
  const db = createAdminClient();
  let query = db.from("tickets").select("*");
  if (lotteryId) query = query.eq("lottery_id", lotteryId);
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

const CODES_PER_TICKET = 10; // 1 purchased unit = 10 lottery codes
const CODES_PER_SMS = 20; // split into multiple SMS messages beyond 2 units' worth of codes
const CODE_POOL_SIZE = 99999; // 00001-99999
const MAX_INSERT_RETRIES = 5;

type Db = ReturnType<typeof createAdminClient>;

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  if (err.code === "23505") return true;
  const msg = err.message?.toLowerCase() ?? "";
  return msg.includes("duplicate key") || msg.includes("tickets_pkey");
}

const SUPABASE_PAGE_SIZE = 1000; // PostgREST caps unbounded selects at 1000 rows

async function fetchExistingCodes(db: Db, lotteryId: string): Promise<Set<string>> {
  const codes = new Set<string>();
  let from = 0;
  for (;;) {
    const { data, error } = await db
      .from("tickets")
      .select("code")
      .eq("lottery_id", lotteryId)
      .range(from, from + SUPABASE_PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    for (const row of data ?? []) codes.add((row as { code: string }).code);
    if (!data || data.length < SUPABASE_PAGE_SIZE) break;
    from += SUPABASE_PAGE_SIZE;
  }
  return codes;
}

function generateUniqueCodes(count: number, existing: Set<string>): string[] {
  const used = new Set(existing);
  const codes: string[] = [];
  while (codes.length < count) {
    const n = Math.floor(1 + Math.random() * CODE_POOL_SIZE); // 1..99999
    const code = String(n).padStart(5, "0");
    if (used.has(code)) continue;
    used.add(code);
    codes.push(code);
  }
  return codes;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const isPaid = body.paid === true; // admin manual add = paid immediately
  if (isPaid && !isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const quantity = Number(body.quantity ?? 1);
  if (!Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json({ error: "Тоо ширхэг буруу байна" }, { status: 400 });
  }

  const db = createAdminClient();

  const { data: lottery } = await db
    .from("lotteries")
    .select("car_name, tickets_sold, max_tickets")
    .eq("id", body.lotteryId)
    .single();

  if (!lottery) return NextResponse.json({ error: "Lottery not found" }, { status: 404 });
  if (lottery.tickets_sold >= lottery.max_tickets)
    return NextResponse.json({ error: "Sold out" }, { status: 400 });

  const carName = lottery.car_name;
  const codesNeeded = quantity * CODES_PER_TICKET;

  let existingCodes: Set<string>;
  try {
    existingCodes = await fetchExistingCodes(db, body.lotteryId);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch existing codes" },
      { status: 500 }
    );
  }

  if (existingCodes.size + codesNeeded > CODE_POOL_SIZE) {
    return NextResponse.json(
      { error: "Энэ сугалааны кодын багтаамж дууссан" },
      { status: 400 }
    );
  }

  function buildTickets(codes: string[]) {
    const rows = [];
    let codeIdx = 0;
    for (let i = 0; i < quantity; i++) {
      const purchaseGroupId = crypto.randomUUID();
      for (let j = 0; j < CODES_PER_TICKET; j++) {
        rows.push({
          code: codes[codeIdx++],
          phone: body.phone,
          lottery_id: body.lotteryId,
          lottery_name: carName,
          purchase_date: new Date().toISOString().split("T")[0],
          purchase_group_id: purchaseGroupId,
          status: isPaid ? "paid" : "pending",
        });
      }
    }
    return rows;
  }

  let tickets = buildTickets(generateUniqueCodes(codesNeeded, existingCodes));

  let data: unknown[] | null = null;
  let lastErrorMessage = "";
  for (let attempt = 0; attempt < MAX_INSERT_RETRIES; attempt++) {
    const { data: inserted, error } = await db.from("tickets").insert(tickets).select();
    if (!error) {
      data = inserted;
      break;
    }

    if (!isUniqueViolation(error) || attempt === MAX_INSERT_RETRIES - 1) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    lastErrorMessage = error.message;
    // Race condition: another request grabbed one of our codes first.
    // Re-fetch existing codes and regenerate the whole batch, then retry.
    try {
      existingCodes = await fetchExistingCodes(db, body.lotteryId);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Failed to fetch existing codes" },
        { status: 500 }
      );
    }
    if (existingCodes.size + codesNeeded > CODE_POOL_SIZE) {
      return NextResponse.json(
        { error: "Энэ сугалааны кодын багтаамж дууссан" },
        { status: 400 }
      );
    }
    tickets = buildTickets(generateUniqueCodes(codesNeeded, existingCodes));
  }

  if (!data) {
    return NextResponse.json(
      { error: lastErrorMessage || "Failed to insert tickets after retries" },
      { status: 500 }
    );
  }

  // Only count toward tickets_sold once actually paid (pending tickets don't reserve a slot).
  // tickets_sold tracks purchased units, not individual codes.
  let smsQueued = false;
  if (isPaid) {
    await db
      .from("lotteries")
      .update({ tickets_sold: lottery.tickets_sold + quantity })
      .eq("id", body.lotteryId);

    // Send SMS after the response is flushed so ticket creation (and the admin
    // table refresh) isn't blocked by SMS retries — failures are still tracked
    // in sms_logs / visible on /admin/sms-failures.
    const codes = tickets.map((t) => t.code);
    after(() => sendChunkedSMS(body.phone, codes, body.lotteryId));
    smsQueued = true;
  }

  return NextResponse.json({ tickets: data, smsQueued }, { status: 201 });
}

async function sendChunkedSMS(
  phone: string,
  codes: string[],
  lotteryId: string
): Promise<{ ok: boolean; detail?: string }> {
  const chunks: string[][] = [];
  for (let i = 0; i < codes.length; i += CODES_PER_SMS) {
    chunks.push(codes.slice(i, i + CODES_PER_SMS));
  }

  let ok = true;
  const failures: string[] = [];
  for (const chunk of chunks) {
    const message = `BLCK: ${chunk.join(",")}`;
    const result = await sendSMS(phone, message, { lotteryId });
    if (!result.ok) {
      ok = false;
      if (result.detail) failures.push(result.detail);
    }
  }
  return { ok, detail: failures.length ? failures.join("; ") : undefined };
}
