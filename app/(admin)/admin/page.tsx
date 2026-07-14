import { getLotteries, getTickets } from "@/lib/db";
import { formatMNT } from "@/lib/mock-data";
import { buildTicketGroups } from "@/lib/ticketGroups";
import { Card, CardContent } from "@/components/ui/card";
import TicketsSearch from "./tickets/TicketsSearch";
import { Car, Ticket, TrendingUp, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [lotteries, tickets] = await Promise.all([getLotteries(), getTickets()]);

  const totalUnitsSold = lotteries.reduce((sum, l) => sum + l.ticketsSold, 0);
  const totalRevenue = lotteries.reduce((sum, l) => sum + l.ticketsSold * l.ticketPrice, 0);

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
      value: totalUnitsSold,
      icon: Ticket,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Нийт орлого",
      value: formatMNT(totalRevenue),
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
      large: true,
    },
  ];

  const groups = buildTicketGroups(lotteries, tickets);

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

      <TicketsSearch groups={groups} />
    </div>
  );
}
