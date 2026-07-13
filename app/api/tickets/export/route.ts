import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getLotteries, getTickets } from "@/lib/db";
import { formatDateTime } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const lotteryId = req.nextUrl.searchParams.get("lotteryId");

  const [lotteries, allTickets] = await Promise.all([getLotteries(), getTickets()]);
  const tickets = lotteryId ? allTickets.filter((t) => t.lotteryId === lotteryId) : allTickets;
  const priceByLotteryId = new Map(lotteries.map((l) => [l.id, l.ticketPrice]));
  const lottery = lotteryId ? lotteries.find((l) => l.id === lotteryId) : undefined;

  const groups = new Map<
    string,
    { phone: string; lotteryId: string; lotteryName: string; codes: string[]; unitIds: Set<string>; lastPurchasedAt: string }
  >();
  for (const t of tickets) {
    const key = `${t.phone}-${t.lotteryId}`;
    const existing = groups.get(key);
    if (existing) {
      existing.codes.push(t.code);
      existing.unitIds.add(t.purchaseGroupId);
      if (t.createdAt > existing.lastPurchasedAt) existing.lastPurchasedAt = t.createdAt;
    } else {
      groups.set(key, {
        phone: t.phone,
        lotteryId: t.lotteryId,
        lotteryName: t.lotteryName,
        codes: [t.code],
        unitIds: new Set([t.purchaseGroupId]),
        lastPurchasedAt: t.createdAt,
      });
    }
  }
  const sortedGroups = Array.from(groups.values()).sort((a, b) =>
    b.lastPurchasedAt.localeCompare(a.lastPurchasedAt)
  );

  const rows = sortedGroups.map((g) => ({
    "Ширхэг": g.unitIds.size,
    "Утас": g.phone,
    "Сугалааны нэр": g.lotteryName,
    "Кодууд": g.codes.join(", "),
    "Нийт үнэ": (priceByLotteryId.get(g.lotteryId) ?? 0) * g.unitIds.size,
    "Сүүлд авсан": formatDateTime(g.lastPurchasedAt),
  }));

  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Тасалбарууд");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  const namePart = lottery ? `${lottery.carName.replace(/[^a-zA-Z0-9а-яА-ЯөүӨҮ]+/g, "-")}-` : "";
  const filename = `tickets-${namePart}${new Date().toISOString().split("T")[0]}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
