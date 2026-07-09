import Link from "next/link";
import { getLotteries } from "@/lib/db";
import { formatMNT } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil } from "lucide-react";
import DrawButton from "./DrawButton";
import DeleteLotteryButton from "./DeleteLotteryButton";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  active: "Идэвхтэй",
  ended: "Дууссан",
  drawing: "Шалгаруулж байна",
};

const statusVariant: Record<string, "success" | "outline" | "warning"> = {
  active: "success",
  ended: "outline",
  drawing: "warning",
};

export default async function LotteriesPage() {
  const lotteries = await getLotteries();

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Сугалаанууд</h1>
          <p className="text-sm text-gray-500">Нийт {lotteries.length} сугалаа</p>
        </div>
        <Link href="/admin/lotteries/new">
          <Button className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Шинэ сугалаа</span>
            <span className="sm:hidden">Шинэ</span>
          </Button>
        </Link>
      </div>

      {lotteries.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="mb-4">Сугалаа байхгүй байна</p>
          <Link href="/admin/lotteries/new">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
              <PlusCircle className="h-4 w-4" />
              Шинэ сугалаа үүсгэх
            </Button>
          </Link>
        </div>
      )}

      {/* Mobile card list */}
      <div className="flex flex-col gap-3 md:hidden">
        {lotteries.map((lottery) => (
          <Card key={lottery.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{lottery.carName}</p>
                  <p className="text-xs text-gray-500">
                    {lottery.carBrand} {lottery.carModel}
                  </p>
                </div>
                <Badge variant={statusVariant[lottery.status] ?? "outline"} className="shrink-0">
                  {statusLabel[lottery.status] ?? lottery.status}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-3">
                <div>
                  <p className="text-gray-400">Үнэ</p>
                  <p className="font-medium">{formatMNT(lottery.ticketPrice)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Тасалбар</p>
                  <p className="font-medium">
                    {lottery.ticketsSold}
                    <span className="text-gray-400">/{lottery.maxTickets}</span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Огноо</p>
                  <p className="font-medium">{lottery.endDate}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/lotteries/${lottery.id}/edit`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full gap-1">
                    <Pencil className="h-3 w-3" />
                    Засах
                  </Button>
                </Link>
                {lottery.status === "active" && (
                  <div className="flex-1">
                    <DrawButton lotteryId={lottery.id} lotteryName={lottery.carName} />
                  </div>
                )}
                <DeleteLotteryButton lotteryId={lottery.id} lotteryName={lottery.carName} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop table */}
      {lotteries.length > 0 && (
        <Card className="hidden md:block">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                      Машины нэр
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                      Үнэ
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                      Тасалбар
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                      Дуусах огноо
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                      Төлөв
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                      Үйлдэл
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lotteries.map((lottery) => (
                    <tr
                      key={lottery.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {lottery.carName}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {formatMNT(lottery.ticketPrice)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        <span className="font-medium">{lottery.ticketsSold}</span>
                        <span className="text-gray-400"> / {lottery.maxTickets}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {lottery.endDate}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant={statusVariant[lottery.status] ?? "outline"}>
                          {statusLabel[lottery.status] ?? lottery.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/lotteries/${lottery.id}/edit`}>
                            <Button size="sm" variant="outline" className="gap-1 text-xs">
                              <Pencil className="h-3 w-3" />
                              Засах
                            </Button>
                          </Link>
                          {lottery.status === "active" && (
                            <DrawButton lotteryId={lottery.id} lotteryName={lottery.carName} />
                          )}
                          <DeleteLotteryButton lotteryId={lottery.id} lotteryName={lottery.carName} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
