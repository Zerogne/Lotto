import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getTickets } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const tickets = await getTickets();

  const rows = tickets.map((t) => ({
    "Тасалбарын код": t.code,
    "Утас": t.phone,
    "Сугалааны нэр": t.lotteryName,
    "Огноо": t.purchaseDate,
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
