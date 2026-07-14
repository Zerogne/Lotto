"use client";

import { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/mock-data";
import type { SmsLog } from "@/lib/db";
import { RefreshCw, Loader2 } from "lucide-react";

export default function FailedSmsTable({ logs }: { logs: SmsLog[] }) {
  const [rows, setRows] = useState(logs);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resendingAll, setResendingAll] = useState(false);
  const [error, setError] = useState("");

  async function resend(ids: string[]) {
    setError("");
    const res = await fetch("/api/sms/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Алдаа гарлаа");
      return;
    }
    const { results } = await res.json();
    const okIds = new Set(
      (results as { id: string; ok: boolean }[]).filter((r) => r.ok).map((r) => r.id)
    );
    setRows((prev) => prev.filter((r) => !okIds.has(r.id)));

    const failedCount = ids.length - okIds.size;
    if (failedCount > 0) {
      setError(`${failedCount} мессеж дахин илгээхэд амжилтгүй боллоо. Дахин оролдоно уу.`);
    }
  }

  async function resendOne(id: string) {
    setResendingId(id);
    await resend([id]);
    setResendingId(null);
  }

  async function resendAll() {
    setResendingAll(true);
    await resend(rows.map((r) => r.id));
    setResendingAll(false);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-base">Амжилтгүй мессежүүд</CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            disabled={rows.length === 0 || resendingAll}
            onClick={resendAll}
          >
            {resendingAll ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Бүгдийг дахин илгээх
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {error && <p className="text-red-500 text-sm px-4 py-2">{error}</p>}
        {rows.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">Амжилтгүй мессеж байхгүй байна</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Утас</TableHead>
                <TableHead>Мессежийн агуулга</TableHead>
                <TableHead>Алдаа</TableHead>
                <TableHead>Цаг</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-gray-600 font-mono whitespace-nowrap">{log.phone}</TableCell>
                  <TableCell className="text-gray-900 font-mono text-xs max-w-[320px] break-words">
                    {log.message}
                  </TableCell>
                  <TableCell className="text-red-500 text-xs max-w-[220px] break-words">
                    {log.detail ?? "-"}
                  </TableCell>
                  <TableCell className="text-gray-500 whitespace-nowrap">{formatDateTime(log.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs"
                      disabled={resendingId === log.id || resendingAll}
                      onClick={() => resendOne(log.id)}
                    >
                      {resendingId === log.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                      Дахин илгээх
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
