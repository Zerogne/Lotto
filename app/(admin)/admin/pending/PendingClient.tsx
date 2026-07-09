"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, UserPlus, RefreshCw, Clock } from "lucide-react";

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
  car_brand: string;
  car_model: string;
  ticket_price: number;
}

export default function PendingClient() {
  const [groups, setGroups] = useState<PendingGroup[]>([]);
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approving, setApproving] = useState<string | null>(null);
  const [approved, setApproved] = useState<string[]>([]);

  // Manual add state
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
      setLotteries(json.lotteries);
      if (!manualLotteryId && json.lotteries[0]) setManualLotteryId(json.lotteries[0].id);
    } catch {
      setError("Сүлжээний алдаа");
    } finally {
      setLoading(false);
    }
  }, [manualLotteryId]);

  useEffect(() => { fetchData(); }, []);

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
      setApproved((prev) => [...prev, key]);
      setGroups((prev) => prev.filter((g) => !(g.phone === phone && g.lottery_id === lotteryId)));
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
    if (!res.ok) {
      setManualLoading(false);
      setManualMsg({ text: data.error ?? "Алдаа гарлаа", ok: false });
      return;
    }
    // Send SMS
    await fetch("/api/tickets/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: manualPhone, lotteryId: manualLotteryId }),
    });
    setManualLoading(false);
    const codes = (data.tickets ?? []).map((t: { code: string }) => t.code);
    setManualMsg({ text: `✓ ${manualPhone} → ${codes.join(",")}`, ok: true });
    setManualPhone("");
    setManualQty("1");
  }

  return (
    <div className="space-y-6">
      {/* Manual add */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="h-5 w-5 text-amber-500" />
          <h2 className="font-bold text-gray-900">Гараар нэмэх</h2>
        </div>
        <form onSubmit={handleManualAdd} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Утасны дугаар</label>
            <input
              type="tel"
              inputMode="numeric"
              value={manualPhone}
              onChange={(e) => setManualPhone(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="88001234"
              className="h-10 border border-gray-200 rounded-lg px-3 text-sm font-mono w-36 focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Сугалаа</label>
            <select
              value={manualLotteryId}
              onChange={(e) => setManualLotteryId(e.target.value)}
              className="h-10 border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:border-amber-400"
            >
              {lotteries.map((l) => (
                <option key={l.id} value={l.id}>{l.car_brand} {l.car_model}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Ширхэг</label>
            <input
              type="number"
              min={1}
              max={20}
              value={manualQty}
              onChange={(e) => setManualQty(e.target.value)}
              className="h-10 border border-gray-200 rounded-lg px-3 text-sm w-20 focus:outline-none focus:border-amber-400"
            />
          </div>
          <button
            type="submit"
            disabled={manualLoading}
            className="h-10 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-bold px-4 rounded-lg"
          >
            {manualLoading ? "..." : "Нэмэх + SMS"}
          </button>
        </form>
        {manualMsg.text && (
          <p className={`text-xs mt-2 font-mono ${manualMsg.ok ? "text-green-600" : "text-red-500"}`}>
            {manualMsg.text}
          </p>
        )}
      </div>

      {/* Pending list */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <h2 className="font-bold text-gray-900">
              Хүлээгдэж буй төлбөрүүд {!loading && `(${groups.length})`}
            </h2>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-40"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {error && <p className="text-red-500 text-sm px-4 py-3">{error}</p>}

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
                <div key={key} className="flex items-center justify-between px-4 py-3 gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 tabular-nums text-lg">{g.phone}</p>
                    <p className="text-xs text-gray-500">{g.lottery_name || "—"} · {g.count} тасалбар</p>
                    <p className="text-xs text-amber-600 font-mono mt-0.5">{g.codes.join(", ")}</p>
                  </div>
                  {isApproved ? (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-semibold shrink-0">
                      <CheckCircle2 className="h-4 w-4" /> Илгээгдлээ
                    </span>
                  ) : (
                    <button
                      onClick={() => approve(g.phone, g.lottery_id)}
                      disabled={approving === key}
                      className="shrink-0 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white text-xs font-bold px-3 py-2 rounded-lg"
                    >
                      {approving === key ? "..." : "Баталгаажуулах"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
