import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase";
import { DEFAULT_CODE_DIGITS, isLotteryCodeDigits } from "@/lib/lotteryCodes";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
  }

  const { id } = await params;
  const code = req.nextUrl.searchParams.get("code")?.trim() ?? "";
  const prefix = req.nextUrl.searchParams.get("prefix")?.trim() ?? "";
  const db = createAdminClient();
  const { data: lottery, error: lotteryError } = await db
    .from("lotteries")
    .select("code_digits")
    .eq("id", id)
    .maybeSingle();

  if (lotteryError) return NextResponse.json({ error: lotteryError.message }, { status: 500 });
  if (!lottery) return NextResponse.json({ error: "Сугалаа олдсонгүй" }, { status: 404 });

  const codeDigits = isLotteryCodeDigits(lottery.code_digits) ? lottery.code_digits : DEFAULT_CODE_DIGITS;

  if (prefix) {
    const prefixPattern = new RegExp(`^\\d{2,${codeDigits}}$`);
    if (!prefixPattern.test(prefix)) {
      return NextResponse.json(
        { error: `2-${codeDigits} оронтой дугаар оруулна уу` },
        { status: 400 }
      );
    }

    const remainingDigits = codeDigits - prefix.length;
    const candidateCount = 10 ** remainingDigits;
    const rangeStart = Number(prefix) * candidateCount;
    const candidates = Array.from({ length: candidateCount }, (_, index) => rangeStart + index)
      .filter((value) => value > 0)
      .map((value) => String(value).padStart(codeDigits, "0"));
    if (candidates.length === 0) return NextResponse.json({ prefix, matches: [] });

    const { data: registered, error: registeredError } = await db
      .from("tickets")
      .select("code")
      .eq("lottery_id", id)
      .gte("code", candidates[0])
      .lte("code", candidates[candidates.length - 1])
      .limit(candidateCount);

    if (registeredError) {
      return NextResponse.json({ error: registeredError.message }, { status: 500 });
    }

    const registeredCodes = new Set((registered ?? []).map((ticket) => ticket.code));
    const matches = candidates.filter((candidate) => !registeredCodes.has(candidate)).slice(0, 20);
    return NextResponse.json({ prefix, matches });
  }

  if (!new RegExp(`^\\d{${codeDigits}}$`).test(code) || Number(code) === 0) {
    return NextResponse.json(
      { error: `${codeDigits} оронтой зөв дугаар оруулна уу` },
      { status: 400 }
    );
  }

  const { data: ticket, error: ticketError } = await db
    .from("tickets")
    .select("code")
    .eq("lottery_id", id)
    .eq("code", code)
    .maybeSingle();

  if (ticketError) return NextResponse.json({ error: ticketError.message }, { status: 500 });
  return NextResponse.json({ code, available: !ticket });
}
