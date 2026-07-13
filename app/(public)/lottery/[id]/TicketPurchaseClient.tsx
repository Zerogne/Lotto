"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Lottery, formatMNT } from "@/lib/mock-data";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, ChevronLeft, Building2 } from "lucide-react";
import DarkHeroShell from "@/components/public/DarkHeroShell";

interface Props {
  lotteries: Lottery[];
  initialLotteryId: string;
}

const BANK_INFO = {
  bank: "Хаан банк",
  account: "MN100005005434023440 ",
  name: "Ядам Оюунбат",
};

export default function TicketPurchaseClient({ lotteries, initialLotteryId }: Props) {
  const [phone, setPhone] = useState("");
  const [selectedLotteryId, setSelectedLotteryId] = useState(initialLotteryId);
  const [quantity, setQuantity] = useState("1");
  const [successOpen, setSuccessOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; lottery?: string; quantity?: string; api?: string }>({});

  const selectedLottery = useMemo(
    () => lotteries.find((l) => l.id === selectedLotteryId) ?? lotteries[0],
    [lotteries, selectedLotteryId]
  );
  const qtyNum = Number.parseInt(quantity, 10) || 1;
  const totalAmount = (selectedLottery?.ticketPrice ?? 0) * qtyNum;

  function validate() {
    const errs: typeof errors = {};
    if (!/^\d{8}$/.test(phone)) errs.phone = "8 оронтой утасны дугаар оруулна уу";
    if (!selectedLottery) errs.lottery = "Сугалаа сонгоно уу";
    if (!(qtyNum >= 1)) errs.quantity = "Тоо ширхэг 1-ээс дээш байна";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, lotteryId: selectedLottery?.id, quantity: qtyNum }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccessOpen(true);
    } else {
      const data = await res.json();
      setErrors({ api: data.error ?? "Алдаа гарлаа" });
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DarkHeroShell className="shrink-0">
        <div className="relative z-10 px-4 py-8 max-w-lg mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white mb-4"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Буцах
          </Link>
          <div className="text-center">
            <p className="text-amber-400 font-black text-2xl sm:text-3xl uppercase tracking-widest leading-none mb-1 drop-shadow-lg">
              {selectedLottery?.carBrand}
            </p>
            <h1 className="text-white font-black text-3xl sm:text-4xl uppercase tracking-widest leading-none drop-shadow-lg">
              {selectedLottery?.carModel} СУГАЛАА
            </h1>
          </div>
        </div>
      </DarkHeroShell>

      <div className="flex-1 px-4 pt-4 pb-32 lg:pb-10 max-w-lg mx-auto w-full">
        {/* Bank info */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-amber-600" />
            <p className="text-sm font-bold text-amber-800">Банкны шилжүүлэг</p>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Банк</span>
              <span className="font-semibold text-gray-900">{BANK_INFO.bank}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Дансны дугаар</span>
              <span className="font-semibold text-gray-900 tabular-nums">{BANK_INFO.account}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Хүлээн авагч</span>
              <span className="font-semibold text-gray-900">{BANK_INFO.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Гүйлгээний утга</span>
              <span className="font-semibold text-gray-900 tabular-nums">
                {phone.length === 8 ? phone : "Утасны дугаар"}
              </span>
            </div>
          </div>
          <p className="text-xs text-amber-700 mt-2">
            Гүйлгээний утганд заавал утасны дугаараа бичнэ үү — эс бөгөөс тасалбар баталгаажихгүй.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
            Утасны дугаар:
          </label>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder="••••••••"
            className={`w-full h-12 border-2 rounded-lg px-4 text-xl font-mono tracking-widest focus:outline-none transition-colors ${
              errors.phone ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-amber-400"
            }`}
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
            Машины сугалаа
          </label>
          <select
            value={selectedLotteryId}
            onChange={(e) => { setSelectedLotteryId(e.target.value); setErrors((p) => ({ ...p, lottery: undefined })); }}
            className="w-full h-12 border-2 border-gray-200 rounded-lg px-3 text-sm font-black uppercase tracking-wide focus:outline-none focus:border-amber-400"
          >
            {lotteries.map((l) => (
              <option key={l.id} value={l.id}>
                {l.carBrand} {l.carModel} · {formatMNT(l.ticketPrice)}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
            Хэдэн тасалбар авах вэ
          </label>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={quantity}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              setQuantity(digits === "" ? "" : String(Number.parseInt(digits, 10)));
              setErrors((p) => ({ ...p, quantity: undefined }));
            }}
            onBlur={() => setQuantity(String(Math.max(1, Number.parseInt(quantity, 10) || 1)))}
            className="w-full h-12 border-2 border-gray-200 rounded-lg px-4 text-lg font-bold tabular-nums focus:outline-none focus:border-amber-400"
          />
          {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Төлбөрийн дүн</p>
          <p className="text-2xl font-black text-gray-900">{formatMNT(totalAmount)}</p>
          <p className="text-xs text-gray-500 mt-1">{formatMNT(selectedLottery?.ticketPrice ?? 0)} × {qtyNum} ширхэг</p>
        </div>

        {errors.api && (
          <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2 mt-4 text-center">{errors.api}</p>
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3 lg:static lg:bg-transparent lg:border-0 lg:backdrop-blur-none lg:max-w-lg lg:mx-auto lg:w-full lg:pb-8">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 active:bg-amber-700 text-white font-black text-base uppercase tracking-widest py-4 rounded-xl transition-colors shadow-lg"
        >
          {loading ? "Хадгалж байна..." : "Захиалга илгээх"}
        </button>
      </div>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="sr-only">Амжилттай</DialogTitle>
            <DialogDescription className="sr-only">Захиалга хүлээн авлаа</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-5 py-4 text-center">
            <CheckCircle2 className="h-14 w-14 text-green-500" />
            <div>
              <p className="text-lg font-bold text-gray-900 mb-1">Захиалга хүлээн авлаа!</p>
              <p className="text-sm text-gray-500">{qtyNum} тасалбарын захиалга бүртгэгдлээ</p>
            </div>
            <div className="w-full rounded-xl bg-amber-50 border border-amber-200 px-4 py-4 text-left space-y-2">
              <p className="text-sm font-bold text-gray-900">Дараагийн алхам:</p>
              <p className="text-sm text-gray-700">
                1. <span className="font-semibold">{formatMNT(totalAmount)}</span>-г <span className="font-semibold">{BANK_INFO.account}</span> ({BANK_INFO.bank}) дансанд шилжүүлнэ үү
              </p>
              <p className="text-sm text-gray-700">
                2. Гүйлгээний утганд заавал <span className="font-semibold">{phone}</span> дугаараа бичнэ үү
              </p>
              <p className="text-sm text-gray-700">
                3. Шилжүүлэг баталгаажсаны дараа тасалбарын дугаар <span className="font-semibold">{phone}</span> дугаарт илгээгдэнэ
              </p>
            </div>
            <button
              onClick={() => setSuccessOpen(false)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Хаах
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
