"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateTime, formatMNT } from "@/lib/mock-data";
import { TicketGroup } from "@/lib/ticketGroups";
import { Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export type { TicketGroup };

interface Props {
  groups: TicketGroup[];
  total: number;
  page: number;
  pageSize: number;
}

export default function TicketUnitsTable({ groups, total, page, pageSize }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [refunding, setRefunding] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pageInput, setPageInput] = useState(String(page));

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  function keyOf(g: TicketGroup) {
    return g.purchaseGroupId;
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function goToPage(value: string | number) {
    const n = typeof value === "number" ? value : parseInt(value, 10);
    if (!Number.isFinite(n)) {
      setPageInput(String(page));
      return;
    }
    const clamped = Math.min(Math.max(1, n), totalPages);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(clamped));
    router.push(`${pathname}?${params.toString()}`);
  }

  async function refund(group: TicketGroup) {
    if (!confirm(`${group.phone} дугаарын ${group.unitsCount} ширхэг (${group.codes.length} код) сугалааг устгах уу?`)) return;
    setRefunding(keyOf(group));
    setError("");
    const res = await fetch("/api/tickets/refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: group.phone,
        lotteryId: group.lotteryId,
        purchaseGroupId: group.purchaseGroupId,
      }),
    });
    setRefunding(null);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Алдаа гарлаа");
      return;
    }
    if (groups.length === 1 && page > 1) {
      goToPage(page - 1);
    } else {
      router.refresh();
    }
  }

  if (groups.length === 0) {
    return <p className="text-center text-sm text-gray-400 py-10">Тасалбар байхгүй байна</p>;
  }

  const start = (page - 1) * pageSize;

  return (
    <div>
      {error && <p className="text-red-500 text-sm px-4 py-2">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ширхэг</TableHead>
            <TableHead>Утас</TableHead>
            <TableHead>Сугалааны Нэр</TableHead>
            <TableHead>Сугалааны Код</TableHead>
            <TableHead>Нийт Үнэ</TableHead>
            <TableHead>Цаг</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <TableRow key={keyOf(group)}>
              <TableCell className="text-gray-500 tabular-nums">{group.unitsCount}</TableCell>
              <TableCell className="text-gray-600 font-mono whitespace-nowrap">{group.phone}</TableCell>
              <TableCell className="text-gray-600 whitespace-nowrap">{group.lotteryName}</TableCell>
              <TableCell className="text-gray-900">
                <div className="flex flex-wrap gap-1 max-w-[220px]">
                  {group.codes.map((code) => (
                    <span
                      key={code}
                      className="font-mono text-[11px] bg-gray-100 rounded px-1.5 py-0.5 whitespace-nowrap"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-gray-600 whitespace-nowrap">{formatMNT(group.totalPrice)}</TableCell>
              <TableCell className="text-gray-500 whitespace-nowrap">{formatDateTime(group.lastPurchasedAt)}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs text-red-600 hover:text-red-700"
                  disabled={refunding === keyOf(group)}
                  onClick={() => refund(group)}
                >
                  {refunding === keyOf(group) ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                  Устгах
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <p className="text-xs text-gray-500">
            {start + 1}-{Math.min(start + pageSize, total)} / {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-xs"
              disabled={page === 1}
              onClick={() => goToPage(page - 1)}
            >
              <ChevronLeft className="h-3 w-3" />
              Өмнөх
            </Button>
            <span className="text-xs text-gray-500 tabular-nums flex items-center gap-1">
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={(e) => goToPage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    goToPage(pageInput);
                  }
                }}
                className="w-14 h-7 px-2 text-xs text-center"
              />
              / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-xs"
              disabled={page === totalPages}
              onClick={() => goToPage(page + 1)}
            >
              Дараах
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
