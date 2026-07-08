"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Lottery, formatMNT } from "@/lib/mock-data";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QrCode, CheckCircle2, ChevronLeft } from "lucide-react";
import DarkHeroShell from "@/components/public/DarkHeroShell";

interface Props {
  lotteries: Lottery[];
  initialLotteryId: string;
}

export default function TicketPurchaseClient({ lotteries, initialLotteryId }: Props) {
  const [phone, setPhone] = useState("");
  const [selectedLotteryId, setSelectedLotteryId] = useState(initialLotteryId);
  const [quantity, setQuantity] = useState("1");
  const [qpayOpen, setQpayOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [newCodes, setNewCodes] = useState<string[]>([]);
  const [smsSession, setSmsSession] = useState<{ displayInstruction: string; smsUri: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; lottery?: string; quantity?: string; api?: string }>({});

  const selectedLottery = useMemo(
    () => lotteries.find((l) => l.id === selectedLotteryId) ?? lotteries[0],
    [lotteries, selectedLotteryId]
  );
  const qtyNum = Number.parseInt(quantity, 10) || 1;
  const totalAmount = (selectedLottery?.ticketPrice ?? 0) * qtyNum;

  function handleOpenPay() {
    const errs: typeof errors = {};
    if (!/^\d{8}$/.test(phone)) errs.phone = "8 оронтой утасны дугаар оруулна уу";
    if (!selectedLottery) errs.lottery = "Сугалаа сонгоно уу";
    if (!(qtyNum >= 1 && qtyNum <= 20)) errs.quantity = "Тоо ширхэг 1-20 хооронд байна";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setQpayOpen(true);
  }

  async function handlePaid() {
    setLoading(true);
    setErrors({});
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        lotteryId: selectedLottery?.id,
        quantity: qtyNum,
      }),
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      setNewCodes((data.tickets ?? []).map((t: { code: string }) => t.code));
      setSmsSession(data.session ?? null);
      setQpayOpen(false);
      setSuccessOpen(true);
    } else {
      const data = await res.json();
      setErrors({ api: data.error ?? "Алдаа гарлаа" });
    }
  }

  const phoneConfirmed = phone.length === 8;

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
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 text-center">
          <p className="text-sm text-gray-700 leading-relaxed">
            {phoneConfirmed ? (
              <>
                <span className="font-semibold text-gray-900">{phone}</span> дугаар дээр сугалааны эрх
                бүртгэгдэнэ. Төлбөр баталгаажмагц тасалбарын дугаарууд СМС-ээр илгээгдэнэ.
              </>
            ) : (
              "Утас, сугалаа, тоо ширхгийг сонгоод төлбөр хийнэ үү"
            )}
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
              errors.phone
                ? "border-red-400 focus:border-red-500"
                : "border-gray-200 focus:border-amber-400"
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
            onChange={(e) => {
              setSelectedLotteryId(e.target.value);
              setErrors((prev) => ({ ...prev, lottery: undefined }));
            }}
            className="w-full h-12 border-2 border-gray-200 rounded-lg px-3 text-sm font-black uppercase tracking-wide focus:outline-none focus:border-amber-400"
          >
            {lotteries.map((l) => (
              <option key={l.id} value={l.id}>
                {l.carBrand} {l.carModel} · {formatMNT(l.ticketPrice)}
              </option>
            ))}
          </select>
          {errors.lottery && <p className="text-red-500 text-xs mt-1">{errors.lottery}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
            Хэдэн тасалбар авах вэ
          </label>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={20}
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setErrors((prev) => ({ ...prev, quantity: undefined }));
            }}
            onBlur={() => {
              const v = Math.min(20, Math.max(1, Number.parseInt(quantity, 10) || 1));
              setQuantity(String(v));
            }}
            className="w-full h-12 border-2 border-gray-200 rounded-lg px-4 text-lg font-bold tabular-nums focus:outline-none focus:border-amber-400"
          />
          {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Төлбөрийн дүн</p>
          <p className="text-2xl font-black text-gray-900">{formatMNT(totalAmount)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {formatMNT(selectedLottery?.ticketPrice ?? 0)} × {qtyNum} ширхэг
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3 lg:static lg:bg-transparent lg:border-0 lg:backdrop-blur-none lg:max-w-lg lg:mx-auto lg:w-full lg:pb-8">
        <button
          onClick={handleOpenPay}
          className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-black text-base uppercase tracking-widest py-4 rounded-xl transition-colors shadow-lg"
        >
          QPay-аар төлбөр хийх
        </button>
      </div>

      {/* QPay Modal */}
      <Dialog open={qpayOpen} onOpenChange={setQpayOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-black uppercase tracking-wide">
              QPay Төлбөр
            </DialogTitle>
            <DialogDescription className="sr-only">QPay QR кодоор төлбөр хийх</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-3">
            <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center text-gray-400">
                <QrCode className="h-16 w-16 mx-auto mb-2" />
                <p className="text-xs font-medium">QR код</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-gray-900">{formatMNT(totalAmount)}</p>
              <p className="text-sm text-gray-500 mt-1">Шилжүүлэх дүн</p>
            </div>
            <p className="text-sm text-center text-gray-700 bg-amber-50 border border-amber-200 p-3 rounded-xl w-full">
              {selectedLottery?.carBrand} {selectedLottery?.carModel} · {qtyNum} тасалбар
              <br />
              Төлбөр амжилттай болсны дараа доорх товчийг дарна уу.
            </p>
            {errors.api && (
              <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2 w-full text-center">
                {errors.api}
              </p>
            )}
            <button
              onClick={handlePaid}
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-black text-lg py-4 rounded-xl transition-colors uppercase tracking-wide"
            >
              {loading ? "Хадгалж байна..." : "Төлбөр хийлээ"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="sr-only">Амжилттай</DialogTitle>
            <DialogDescription className="sr-only">Тасалбар амжилттай бүртгэгдлээ</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-5 py-4 text-center">
            <CheckCircle2 className="h-14 w-14 text-green-500" />
            <div>
              <p className="text-lg font-bold text-gray-900 mb-1">Төлбөр амжилттай!</p>
              <p className="text-sm text-gray-500">{newCodes.length} тасалбар бүртгэгдлээ</p>
            </div>

            {smsSession ? (
              <div className="w-full rounded-xl bg-amber-50 border border-amber-200 px-4 py-4 text-left space-y-3">
                <p className="text-sm font-semibold text-gray-900">Тасалбарын дугаараа авах:</p>
                <p className="text-sm text-gray-700 leading-relaxed">{smsSession.displayInstruction}</p>
                <a
                  href={smsSession.smsUri}
                  className="flex items-center justify-center w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold py-3 rounded-lg transition-colors"
                >
                  SMS апп нээх
                </a>
                <p className="text-xs text-gray-500 text-center">
                  SMS илгээсний дараа тасалбарын дугаарууд автоматаар ирнэ
                </p>
              </div>
            ) : (
              <div className="w-full rounded-xl bg-amber-50 border border-amber-200 px-4 py-4">
                <p className="text-sm text-gray-700">Тасалбарын дугаарыг{" "}
                  <span className="font-semibold text-gray-900 tabular-nums">{phone}</span>{" "}
                  дугаарт илгээлээ.
                </p>
              </div>
            )}

            {selectedLottery?.drawDate && (
              <p className="text-xs text-gray-500">
                Сугалааны үр дүн{" "}
                <span className="font-medium text-gray-700">
                  {new Date(selectedLottery.drawDate).toLocaleDateString("mn-MN")}
                </span>
                -д зарлагдана.
              </p>
            )}

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
