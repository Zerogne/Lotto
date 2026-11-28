"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { Download, Pencil } from "lucide-react";
import type { Lottery } from "@/lib/mock-data";
import { formatMNT } from "@/lib/mock-data";
import { codePoolSize } from "@/lib/lotteryCodes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import DeleteLotteryButton from "./DeleteLotteryButton";
import { AvailableLotterySearch, AvailableLotteryToggle } from "./AvailableLotteryNumbers";

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

interface Props {
  lottery: Lottery;
  registeredCodeCount: number;
}

export default function DesktopLotteryRow({ lottery, registeredCodeCount }: Props) {
  const [open, setOpen] = useState(false);
  const remainingCount = Math.max(
    0,
    codePoolSize(lottery.codeDigits ?? 5) - registeredCodeCount
  );

  return (
    <Fragment>
      <TableRow>
        <TableCell className="font-medium text-gray-900">{lottery.carName}</TableCell>
        <TableCell className="text-gray-600">{formatMNT(lottery.ticketPrice)}</TableCell>
        <TableCell className="text-gray-600">
          <span className="font-medium">{lottery.ticketsSold}</span>
          <span className="text-gray-400"> / {lottery.maxTickets}</span>
        </TableCell>
        <TableCell className="text-gray-500">{lottery.endDate}</TableCell>
        <TableCell>
          <Badge variant={statusVariant[lottery.status] ?? "outline"}>
            {statusLabel[lottery.status] ?? lottery.status}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap items-center gap-2">
            <AvailableLotteryToggle
              lotteryId={lottery.id}
              lotteryName={lottery.carName}
              codeDigits={lottery.codeDigits ?? 5}
              remainingCount={remainingCount}
              open={open}
              onToggle={() => setOpen((current) => !current)}
            />
            <Link href={`/admin/lotteries/${lottery.id}/edit`}>
              <Button size="sm" variant="outline" className="gap-1 text-xs">
                <Pencil className="h-3 w-3" />
                Засах
              </Button>
            </Link>
            <a href={`/api/tickets/export?lotteryId=${lottery.id}`}>
              <Button size="sm" variant="outline" className="gap-1 text-xs">
                <Download className="h-3 w-3" />
                Excel
              </Button>
            </a>
            <DeleteLotteryButton lotteryId={lottery.id} lotteryName={lottery.carName} />
          </div>
        </TableCell>
      </TableRow>
      {open && (
        <TableRow className="hover:bg-white">
          <TableCell colSpan={6} className="whitespace-normal bg-white px-4 pb-4 pt-0">
            <AvailableLotterySearch lotteryId={lottery.id} codeDigits={lottery.codeDigits ?? 5} />
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
}
