import Link from "next/link";
import { LOTTERIES, formatMNT } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import DrawButton from "./DrawButton";

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

export default function LotteriesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Сугалаанууд</h1>
          <p className="text-sm text-gray-500">Нийт {LOTTERIES.length} сугалаа</p>
        </div>
        <Link href="/admin/lotteries/new">
          <Button className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Шинэ сугалаа</span>
            <span className="sm:hidden">Шинэ</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap sticky left-0 bg-gray-50">
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
                {LOTTERIES.map((lottery) => (
                  <tr
                    key={lottery.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap sticky left-0 bg-white">
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
                      <Badge variant={statusVariant[lottery.status]}>
                        {statusLabel[lottery.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {lottery.status === "active" && (
                        <DrawButton lotteryId={lottery.id} lotteryName={lottery.carName} />
                      )}
                      {lottery.status === "ended" && (
                        <span className="text-xs text-gray-400">Дууссан</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
