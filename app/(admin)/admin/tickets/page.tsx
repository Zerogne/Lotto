import { getLotteries, getTickets } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  const [lotteries, allTickets] = await Promise.all([getLotteries(), getTickets()]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Бүх тасалбарууд</h1>
        <p className="text-sm text-gray-500">Нийт {allTickets.length} тасалбар</p>
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
          {allTickets.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-10">Тасалбар байхгүй байна</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-gray-50">Тасалбарын код</TableHead>
                  <TableHead>Утас</TableHead>
                  <TableHead>Сугалааны нэр</TableHead>
                  <TableHead>Огноо</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allTickets.map((ticket, i) => (
                  <TableRow key={`${ticket.code}-${i}`}>
                    <TableCell className="sticky left-0 bg-white font-mono font-medium text-gray-900">
                      {ticket.code}
                    </TableCell>
                    <TableCell className="text-gray-600 font-mono">{ticket.phone}</TableCell>
                    <TableCell className="text-gray-600">{ticket.lotteryName}</TableCell>
                    <TableCell className="text-gray-500">{ticket.purchaseDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
