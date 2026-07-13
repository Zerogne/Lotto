import { getLotteries, getTickets } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import TicketUnitsTable, { TicketUnit } from "./TicketUnitsTable";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  const [lotteries, allTickets] = await Promise.all([getLotteries(), getTickets()]);

  const unitMap = new Map<string, TicketUnit>();
  for (const t of allTickets) {
    const existing = unitMap.get(t.purchaseGroupId);
    if (existing) {
      existing.codes.push(t.code);
    } else {
      unitMap.set(t.purchaseGroupId, {
        purchaseGroupId: t.purchaseGroupId,
        lotteryId: t.lotteryId,
        lotteryName: t.lotteryName,
        phone: t.phone,
        codes: [t.code],
        createdAt: t.createdAt,
      });
    }
  }
  const units = Array.from(unitMap.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Бүх тасалбарууд</h1>
          <p className="text-sm text-gray-500">Нийт {allTickets.length} тасалбар</p>
        </div>
        <a href="/api/tickets/export">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-3.5 w-3.5" />
            Excel татах
          </Button>
        </a>
      </div>

      {/* Summary by lottery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {lotteries.map((lottery) => {
          const count = allTickets.filter((t) => t.lotteryId === lottery.id).length;
          return (
            <Card key={lottery.id}>
              <CardContent className="p-4">
                <p className="font-medium text-gray-900 text-sm mb-1 truncate">{lottery.carName}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">{count}</span>
                  <Badge
                    variant={lottery.status === "active" ? "success" : "outline"}
                    className="text-xs"
                  >
                    {lottery.status === "active" ? "Идэвхтэй" : "Дууссан"}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {lottery.maxTickets - count} тасалбар үлдсэн
                </p>
              </CardContent>
            </Card>
          );
        })}
        {lotteries.length === 0 && (
          <p className="text-sm text-gray-400 col-span-3 py-4">Сугалаа байхгүй байна</p>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Тасалбарын жагсаалт</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <TicketUnitsTable units={units} />
        </CardContent>
      </Card>
    </div>
  );
}
