"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TicketUnitsTable, { TicketGroup } from "./TicketUnitsTable";

interface Props {
  groups: TicketGroup[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
}

export default function TicketsSearch({ groups, total, page, pageSize, search }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState(search);

  useEffect(() => setInputValue(search), [search]);

  useEffect(() => {
    const digits = inputValue.replace(/\D/g, "");
    if (digits === search) return;
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (digits) params.set("q", digits);
      else params.delete("q");
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`);
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

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
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <TicketUnitsTable groups={groups} total={total} page={page} pageSize={pageSize} />
      </CardContent>
    </Card>
  );
}
