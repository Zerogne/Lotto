import { getLotteries, getTickets } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import TicketUnitsTable, { TicketGroup } from "./TicketUnitsTable";
import ManualTicketAdd from "./ManualTicketAdd";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  const [lotteries, allTickets] = await Promise.all([getLotteries(), getTickets()]);

  const priceByLotteryId = new Map(lotteries.map((l) => [l.id, l.ticketPrice]));

  const groupMap = new Map<string, TicketGroup & { unitIds: Set<string> }>();
  for (const t of allTickets) {
    const key = `${t.phone}-${t.lotteryId}`;
    const existing = groupMap.get(key);
    if (existing) {
      existing.codes.push(t.code);
      existing.unitIds.add(t.purchaseGroupId);
      if (t.createdAt > existing.lastPurchasedAt) existing.lastPurchasedAt = t.createdAt;
    } else {
      groupMap.set(key, {
        phone: t.phone,
        lotteryId: t.lotteryId,
        lotteryName: t.lotteryName,
        codes: [t.code],
        unitsCount: 0,
        totalPrice: 0,
        lastPurchasedAt: t.createdAt,
        unitIds: new Set([t.purchaseGroupId]),
      });
    }
  }

  const groups = Array.from(groupMap.values())
    .map((g) => {
      const unitsCount = g.unitIds.size;
      const price = priceByLotteryId.get(g.lotteryId) ?? 0;
      return {
        phone: g.phone,
        lotteryId: g.lotteryId,
        lotteryName: g.lotteryName,
        codes: g.codes,
        unitsCount,
        totalPrice: price * unitsCount,
        lastPurchasedAt: g.lastPurchasedAt,
      };
    })
    .sort((a, b) => b.lastPurchasedAt.localeCompare(a.lastPurchasedAt));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Бүх тасалбарууд</h1>
          <p className="text-sm text-gray-500">Нийт {allTickets.length} код</p>
        </div>
        <a href="/api/tickets/export">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-3.5 w-3.5" />
            Excel татах
          </Button>
        </a>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6 items-stretch">
        <div className="lg:w-[420px] shrink-0">
          <ManualTicketAdd />
        </div>

        {/* Summary by lottery */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lotteries.map((lottery) => {
            return (
              <Card key={lottery.id}>
                <CardContent className="p-4">
                  <p className="font-medium text-gray-900 text-sm mb-1 truncate">{lottery.carName}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">{lottery.ticketsSold}</span>
                    <Badge
                      variant={lottery.status === "active" ? "success" : "outline"}
                      className="text-xs"
                    >
                      {lottery.status === "active" ? "Идэвхтэй" : "Дууссан"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {lottery.ticketsSold}/{lottery.maxTickets} ширхэг зарагдсан
                  </p>
                </CardContent>
              </Card>
            );
          })}
          {lotteries.length === 0 && (
            <p className="text-sm text-gray-400 col-span-2 py-4">Сугалаа байхгүй байна</p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Тасалбарын жагсаалт</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <TicketUnitsTable groups={groups} />
        </CardContent>
      </Card>
    </div>
  );
}
