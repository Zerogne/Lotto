"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Lottery {
  id: string;
  car_name: string;
  ticket_price: number;
}

export default function ManualTicketAdd() {
  const router = useRouter();
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [manualPhone, setManualPhone] = useState("");
  const [manualLotteryId, setManualLotteryId] = useState("");
  const [manualQty, setManualQty] = useState("1");
  const [manualLoading, setManualLoading] = useState(false);
  const [manualMsg, setManualMsg] = useState({ text: "", ok: true });

  const fetchLotteries = useCallback(async () => {
    try {
      const res = await fetch("/api/lotteries");
      const json = await res.json();
      if (!res.ok) return;
      setLotteries(json);
      setManualLotteryId((prev) => prev || json[0]?.id || "");
    } catch {
      // manual-add form just won't have options
    }
  }, []);

  useEffect(() => { fetchLotteries(); }, [fetchLotteries]);

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
    router.refresh();
  }

  return (
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
  );
}
