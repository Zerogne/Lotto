"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PendingGroup {
  phone: string;
  lottery_id: string;
  lottery_name: string;
  codes: string[];
  count: number;
}

interface Lottery {
  id: string;
  car_name: string;
  ticket_price: number;
}

export default function PendingClient() {
  const [groups, setGroups] = useState<PendingGroup[]>([]);
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approving, setApproving] = useState<string | null>(null);
  const [approved, setApproved] = useState<string[]>([]);
  const [smsError, setSmsError] = useState<string>("");

  const [manualPhone, setManualPhone] = useState("");
  const [manualLotteryId, setManualLotteryId] = useState("");
  const [manualQty, setManualQty] = useState("1");
  const [manualLoading, setManualLoading] = useState(false);
  const [manualMsg, setManualMsg] = useState({ text: "", ok: true });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pending");
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Алдаа гарлаа"); return; }
      setGroups(json.groups);
    } catch {
      setError("Сүлжээний алдаа");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLotteries = useCallback(async () => {
    try {
      const res = await fetch("/api/lotteries");
      const json = await res.json();
      if (!res.ok) return;
      setLotteries(json);
      setManualLotteryId((prev) => prev || json[0]?.id || "");
    } catch {
      // manual-add form just won't have options; pending list still works
    }
  }, []);

  useEffect(() => { fetchData(); fetchLotteries(); }, [fetchData, fetchLotteries]);

  async function approve(phone: string, lotteryId: string) {
    const key = `${phone}-${lotteryId}`;
    setApproving(key);
    const res = await fetch("/api/tickets/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, lotteryId }),
    });
    setApproving(null);
    if (res.ok) {
      const data = await res.json();
      setApproved((prev) => [...prev, key]);
      setGroups((prev) => prev.filter((g) => !(g.phone === phone && g.lottery_id === lotteryId)));
      if (!data.sms?.ok) {
        setSmsError(`SMS алдаа (${phone}): ${data.sms?.detail ?? "тодорхойгүй"}`);
      } else {
        setSmsError("");
      }
    }
  }

  async function handleManualAdd(e: React.FormEvent) {
    e.preventDefault();
    setManualMsg({ text: "", ok: true });
    if (!/^\d{8}$/.test(manualPhone)) {
      setManualMsg({ text: "8 оронтой дугаар оруулна уу", ok: false });
      return;
    }
    setManualLoading(true);
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: manualPhone, lotteryId: manualLotteryId, quantity: Number(manualQty), paid: true }),
    });
    const data = await res.json();
    setManualLoading(false);
    if (!res.ok) {
      setManualMsg({ text: data.error ?? "Алдаа гарлаа", ok: false });
      return;
    }
    const codes = (data.tickets ?? []).map((t: { code: string }) => t.code);
    if (!data.sms?.ok) {
      setManualMsg({ text: `✓ Нэмэгдлээ (${codes.join(",")}) — SMS алдаа: ${data.sms?.detail ?? "тодорхойгүй"}`, ok: false });
    } else {
      setManualMsg({ text: `✓ SMS илгээгдлээ → ${manualPhone} (${codes.join(",")})`, ok: true });
    }
    setManualPhone("");
    setManualQty("1");
    fetchData();
  }

  return (
    <div className="space-y-6">
      {/* Manual add */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-amber-500" />
            Гараар нэмэх
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleManualAdd} className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1.5">
              <Label>Утасны дугаар</Label>
              <Input
                type="tel"
                inputMode="numeric"
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder="88001234"
                className="w-36 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Сугалаа</Label>
              <Select value={manualLotteryId} onValueChange={setManualLotteryId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Сугалаа сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {lotteries.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.car_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Ширхэг</Label>
              <Input
                type="number"
                min={1}
                value={manualQty}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  setManualQty(digits === "" ? "" : String(Number.parseInt(digits, 10)));
                }}
                onBlur={() => setManualQty(String(Math.max(1, Number.parseInt(manualQty, 10) || 1)))}
                className="w-20"
              />
            </div>
            <Button type="submit" disabled={manualLoading} className="bg-amber-500 hover:bg-amber-600 text-white">
              {manualLoading ? "..." : "Нэмэх + SMS"}
            </Button>
          </form>
          {manualMsg.text && (
            <p className={`text-xs mt-3 font-mono ${manualMsg.ok ? "text-green-600" : "text-red-500"}`}>
              {manualMsg.text}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Pending list (hidden — automatic/QPay pending approvals not currently used) */}
      {false && (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Хүлээгдэж буй төлбөрүүд {!loading && <span className="text-gray-400 font-normal">({groups.length})</span>}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="gap-2">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Шинэчлэх
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error && <p className="text-red-500 text-sm px-4 py-3">{error}</p>}
          {smsError && <p className="text-red-500 text-xs px-4 py-2 bg-red-50">{smsError}</p>}

          {loading ? (
            <p className="text-center text-sm text-gray-400 py-10">Ачааллаж байна...</p>
          ) : groups.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-10">Хүлээгдэж буй захиалга байхгүй</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {groups.map((g) => {
                const key = `${g.phone}-${g.lottery_id}`;
                const isApproved = approved.includes(key);
                return (
                  <div key={key} className="flex items-center justify-between px-4 py-4 gap-4">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 tabular-nums text-base">{g.phone}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{g.lottery_name || "—"} · {g.count} тасалбар</p>
                      <p className="text-xs text-amber-600 font-mono mt-1">{g.codes.join(", ")}</p>
                    </div>
                    {isApproved ? (
                      <Badge variant="success" className="shrink-0">Төлөгдсөн</Badge>
                    ) : (
                      <Select
                        defaultValue="pending"
                        disabled={approving === key}
                        onValueChange={(val) => { if (val === "paid") approve(g.phone, g.lottery_id); }}
                      >
                        <SelectTrigger className="w-40 shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Хүлээгдэж байна</SelectItem>
                          <SelectItem value="paid">Төлөгдсөн</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      )}
    </div>
  );
}
