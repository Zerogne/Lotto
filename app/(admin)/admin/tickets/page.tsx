import { getLotteries, getTickets } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buildTicketGroups } from "@/lib/ticketGroups";
import TicketsSearch from "./TicketsSearch";
import ManualTicketAdd from "./ManualTicketAdd";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  const [lotteries, allTickets] = await Promise.all([getLotteries(), getTickets()]);

  const groups = buildTicketGroups(lotteries, allTickets);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Бүх тасалбарууд</h1>
        <p className="text-sm text-gray-500">Нийт {allTickets.length} код</p>
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

      <TicketsSearch groups={groups} />
    </div>
  );
}
