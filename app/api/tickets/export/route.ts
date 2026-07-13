import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getLotteries, getTickets } from "@/lib/db";
import { formatDateTime } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const [lotteries, tickets] = await Promise.all([getLotteries(), getTickets()]);
  const priceByLotteryId = new Map(lotteries.map((l) => [l.id, l.ticketPrice]));

  const groups = new Map<string, { unit: (typeof tickets)[number]; codes: string[] }>();
  for (const t of tickets) {
    const existing = groups.get(t.purchaseGroupId);
    if (existing) existing.codes.push(t.code);
    else groups.set(t.purchaseGroupId, { unit: t, codes: [t.code] });
  }
  const units = Array.from(groups.values()).sort((a, b) =>
    b.unit.createdAt.localeCompare(a.unit.createdAt)
  );

  const rows = units.map(({ unit, codes }, i) => ({
    "№": units.length - i,
    "Утас": unit.phone,
    "Сугалааны нэр": unit.lotteryName,
    "Кодууд": codes.join(", "),
    "Үнэ": priceByLotteryId.get(unit.lotteryId) ?? 0,
    "Огноо, цаг": formatDateTime(unit.createdAt),
  }));

  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Тасалбарууд");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="tickets-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
}
