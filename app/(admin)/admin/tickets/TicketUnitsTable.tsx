"use client";

import { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/mock-data";
import { Trash2, Loader2 } from "lucide-react";

export interface TicketUnit {
  purchaseGroupId: string;
  lotteryId: string;
  lotteryName: string;
  phone: string;
  codes: string[];
  createdAt: string;
}

export default function TicketUnitsTable({ units }: { units: TicketUnit[] }) {
  const [rows, setRows] = useState(units);
  const [refunding, setRefunding] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function refund(unit: TicketUnit) {
    if (!confirm(`${unit.phone} дугаарын ${unit.codes.length} код бүхий сугалааг устгах уу?`)) return;
    setRefunding(unit.purchaseGroupId);
    setError("");
    const res = await fetch("/api/tickets/refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purchaseGroupId: unit.purchaseGroupId, lotteryId: unit.lotteryId }),
    });
    setRefunding(null);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Алдаа гарлаа");
      return;
    }
    setRows((prev) => prev.filter((r) => r.purchaseGroupId !== unit.purchaseGroupId));
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
            <TableHead>Утас</TableHead>
            <TableHead>Сугалааны нэр</TableHead>
            <TableHead>Кодууд</TableHead>
            <TableHead>Огноо, цаг</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((unit) => (
            <TableRow key={unit.purchaseGroupId}>
              <TableCell className="text-gray-600 font-mono whitespace-nowrap">{unit.phone}</TableCell>
              <TableCell className="text-gray-600 whitespace-nowrap">{unit.lotteryName}</TableCell>
              <TableCell className="text-gray-900 font-mono text-xs">{unit.codes.join(", ")}</TableCell>
              <TableCell className="text-gray-500 whitespace-nowrap">{formatDateTime(unit.createdAt)}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs text-red-600 hover:text-red-700"
                  disabled={refunding === unit.purchaseGroupId}
                  onClick={() => refund(unit)}
                >
                  {refunding === unit.purchaseGroupId ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                  Буцаах
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
