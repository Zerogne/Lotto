"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TicketUnitsTable, { TicketGroup } from "./TicketUnitsTable";

export default function TicketsSearch({ groups }: { groups: TicketGroup[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.replace(/\D/g, "");
    if (!q) return groups;
    return groups.filter((g) => g.phone.includes(q));
  }, [groups, search]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-base">Сугалааны жагсаалт</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="tel"
              inputMode="numeric"
              placeholder="Утасны дугаараар хайх..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <TicketUnitsTable groups={filtered} key={search} />
      </CardContent>
    </Card>
  );
}
