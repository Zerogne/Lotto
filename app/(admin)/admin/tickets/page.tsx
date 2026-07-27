import { getLotteries, getTicketGroupsPage, getTicketCodeCount } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toTicketGroup } from "@/lib/ticketGroups";
import TicketsSearch from "./TicketsSearch";
import ManualTicketAdd from "./ManualTicketAdd";
import BackfillButton from "./BackfillButton";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const search = (sp.q ?? "").trim();

  const [lotteries, groupsPage, codeCount] = await Promise.all([
    getLotteries(),
    getTicketGroupsPage({ search, page, pageSize: PAGE_SIZE }),
    getTicketCodeCount(),
  ]);

  const priceByLotteryId = new Map(lotteries.map((l) => [l.id, l.ticketPrice]));
  const groups = groupsPage.rows.map((r) => toTicketGroup(r, priceByLotteryId));

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Бүх тасалбарууд</h1>
          <p className="text-sm text-gray-500">Нийт {codeCount} код</p>
        </div>
        <BackfillButton />
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

      <TicketsSearch groups={groups} total={groupsPage.total} page={page} pageSize={PAGE_SIZE} search={search} />
    </div>
  );
}
