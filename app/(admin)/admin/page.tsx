import { getLotteries, getTickets, getTotalRevenue } from "@/lib/db";
import { formatMNT } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Ticket, TrendingUp, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [lotteries, tickets, revenue] = await Promise.all([
    getLotteries(),
    getTickets(),
    getTotalRevenue(),
  ]);

  const stats = [
    {
      label: "Нийт сугалаа",
      value: lotteries.length,
      icon: Car,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Идэвхтэй сугалаа",
      value: lotteries.filter((l) => l.status === "active").length,
      icon: Activity,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Нийт тасалбар",
      value: tickets.length,
      icon: Ticket,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Нийт орлого",
      value: formatMNT(revenue),
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
      large: true,
    },
  ];

  const recentTickets = tickets.slice(0, 10);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Хяналтын самбар</h1>
        <p className="text-sm text-gray-500">LottoMN - Сугалааны систем</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg, large }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`font-bold text-gray-900 ${large ? "text-base" : "text-xl"}`}>
                {value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Сүүлийн үйл ажиллагаа</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentTickets.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-10">Тасалбар байхгүй байна</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                      Тасалбарын код
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                      Утас
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                      Сугалаа
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 whitespace-nowrap">
                      Огноо
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentTickets.map((ticket, i) => (
                    <tr
                      key={`${ticket.code}-${i}`}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-medium text-gray-900 whitespace-nowrap">
                        {ticket.code}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{ticket.phone}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {ticket.lotteryName}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {ticket.purchaseDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
