"use client";

import { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatMNT } from "@/lib/mock-data";
import { Trash2, Loader2 } from "lucide-react";

export interface TicketGroup {
  phone: string;
  lotteryId: string;
  lotteryName: string;
  codes: string[];
  unitsCount: number;
  totalPrice: number;
  lastPurchasedAt: string;
}

export default function TicketUnitsTable({ groups }: { groups: TicketGroup[] }) {
  const [rows, setRows] = useState(groups);
  const [refunding, setRefunding] = useState<string | null>(null);
  const [error, setError] = useState("");

  function keyOf(g: TicketGroup) {
    return `${g.phone}-${g.lotteryId}`;
  }

  async function refund(group: TicketGroup) {
    if (!confirm(`${group.phone} дугаарын ${group.unitsCount} ширхэг (${group.codes.length} код) сугалааг устгах уу?`)) return;
    setRefunding(keyOf(group));
    setError("");
    const res = await fetch("/api/tickets/refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: group.phone, lotteryId: group.lotteryId }),
    });
    setRefunding(null);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Алдаа гарлаа");
      return;
    }
    setRows((prev) => prev.filter((r) => keyOf(r) !== keyOf(group)));
  }

  if (rows.length === 0) {
    return <p className="text-center text-sm text-gray-400 py-10">Тасалбар байхгүй байна</p>;
  }

  return (
    <div>
      {error && <p className="text-red-500 text-sm px-4 py-2">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ширхэг</TableHead>
            <TableHead>Утас</TableHead>
            <TableHead>Сугалааны нэр</TableHead>
            <TableHead>Кодууд</TableHead>
            <TableHead>Нийт үнэ</TableHead>
            <TableHead>Сүүлд авсан</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((group) => (
            <TableRow key={keyOf(group)}>
              <TableCell className="text-gray-500 tabular-nums">{group.unitsCount}</TableCell>
              <TableCell className="text-gray-600 font-mono whitespace-nowrap">{group.phone}</TableCell>
              <TableCell className="text-gray-600 whitespace-nowrap">{group.lotteryName}</TableCell>
              <TableCell className="text-gray-900 font-mono text-xs">{group.codes.join(", ")}</TableCell>
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
    </div>
  );
}
