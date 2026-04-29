"use client";

import { useState, useId } from "react";
import { Lottery, formatMNT, getTicketsByLottery } from "@/lib/mock-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QrCode, CheckCircle2 } from "lucide-react";

function genCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function mathCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b, answer: a + b };
}

interface Props {
  lottery: Lottery;
}

export default function TicketPurchaseClient({ lottery }: Props) {
  const existingTickets = getTicketsByLottery(lottery.id);

  const [phone, setPhone] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captcha] = useState(mathCaptcha);
  const [qpayOpen, setQpayOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [errors, setErrors] = useState<{ phone?: string; captcha?: string }>({});

  const formId = useId();

  function validate() {
    const errs: typeof errors = {};
    if (!/^\d{8}$/.test(phone)) errs.phone = "8 оронтой утасны дугаар оруулна уу";
    if (parseInt(captchaInput) !== captcha.answer) errs.captcha = "Буруу хариулт";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setQpayOpen(true);
  }

  function handlePaid() {
    const code = genCode();
    setNewCode(code);
    setQpayOpen(false);
    setSuccessOpen(true);
  }

  const allCodes = existingTickets.map((t) => t.code);

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-6">
      {/* Mobile layout */}
      <div className="lg:hidden">
        {/* Car image */}
        <div className="relative w-full aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <span className="text-white/20 text-8xl font-bold">🚗</span>
        </div>

        <div className="px-4 pt-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{lottery.carName}</h1>
          <p className="text-amber-500 font-bold text-lg mb-1">{formatMNT(lottery.prizeValue)}</p>
          <p className="text-sm text-gray-500 mb-6">{formatMNT(lottery.ticketPrice)} / тасалбар</p>

          <PurchaseForm
            id={formId}
            phone={phone}
            setPhone={setPhone}
            captcha={captcha}
            captchaInput={captchaInput}
            setCaptchaInput={setCaptchaInput}
            errors={errors}
            onSubmit={handleSubmit}
          />

          {/* Ticket code grid */}
          <TicketCodeGrid codes={allCodes} lotteryId={lottery.id} />
        </div>

        {/* Sticky bottom buy button */}
        <div className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 p-4">
          <button
            form={formId}
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-lg py-4 rounded-xl transition-colors"
          >
            QPay-аар төлбөр хийх
          </button>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:block max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 gap-12 items-start">
          <div>
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl flex items-center justify-center mb-6">
              <span className="text-white/20 text-8xl font-bold">🚗</span>
            </div>
            <TicketCodeGrid codes={allCodes} lotteryId={lottery.id} />
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">{lottery.carName}</h1>
            <p className="text-amber-500 font-bold text-2xl mb-1">
              {formatMNT(lottery.prizeValue)}
            </p>
            <p className="text-sm text-gray-500 mb-6">{formatMNT(lottery.ticketPrice)} / тасалбар</p>

            <PurchaseForm
              id={formId}
              phone={phone}
              setPhone={setPhone}
              captcha={captcha}
              captchaInput={captchaInput}
              setCaptchaInput={setCaptchaInput}
              errors={errors}
              onSubmit={handleSubmit}
              showSubmitInline
            />
          </div>
        </div>
      </div>

      {/* QPay Modal */}
      <Dialog open={qpayOpen} onOpenChange={setQpayOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">QPay Төлбөр</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center text-gray-400">
                <QrCode className="h-16 w-16 mx-auto mb-2" />
                <p className="text-xs">QR код</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatMNT(lottery.ticketPrice)}</p>
              <p className="text-sm text-gray-500 mt-1">Шилжүүлэх дүн</p>
            </div>
            <p className="text-sm text-center text-gray-600 bg-amber-50 p-3 rounded-lg w-full">
              QPay-аар төлбөр хийнэ үү. Төлбөр амжилттай болсны дараа доорх товчийг дарна уу.
            </p>
            <button
              onClick={handlePaid}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl transition-colors text-lg"
            >
              Төлбөр хийлээ
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-green-700">
              Амжилттай!
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <div className="text-center">
              <p className="text-gray-600 mb-3">Таны сугалааны код:</p>
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl px-6 py-3">
                <p className="text-2xl font-bold font-mono tracking-widest text-amber-700">
                  {newCode}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Энэ кодыг хадгалаарай. Сугалааны үр дүн{" "}
              {new Date(lottery.drawDate).toLocaleDateString("mn-MN")} -д зарлагдана.
            </p>
            <button
              onClick={() => setSuccessOpen(false)}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Хаах
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface FormProps {
  id: string;
  phone: string;
  setPhone: (v: string) => void;
  captcha: { a: number; b: number; answer: number };
  captchaInput: string;
  setCaptchaInput: (v: string) => void;
  errors: { phone?: string; captcha?: string };
  onSubmit: (e: React.FormEvent) => void;
  showSubmitInline?: boolean;
}

function PurchaseForm({
  id,
  phone,
  setPhone,
  captcha,
  captchaInput,
  setCaptchaInput,
  errors,
  onSubmit,
  showSubmitInline,
}: FormProps) {
  return (
    <form id={id} onSubmit={onSubmit} className="space-y-4 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Утасны дугаар
        </label>
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))}
          placeholder="8 оронтой дугаар"
          className="w-full h-14 border border-gray-300 rounded-xl px-4 text-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Баталгаажуулалт: {captcha.a} + {captcha.b} = ?
        </label>
        <input
          type="number"
          inputMode="numeric"
          value={captchaInput}
          onChange={(e) => setCaptchaInput(e.target.value)}
          placeholder="Хариулт"
          className="w-full h-14 border border-gray-300 rounded-xl px-4 text-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        {errors.captcha && <p className="text-red-500 text-xs mt-1">{errors.captcha}</p>}
      </div>

      {showSubmitInline && (
        <button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-lg py-4 rounded-xl transition-colors"
        >
          QPay-аар төлбөр хийх
        </button>
      )}
    </form>
  );
}

interface GridProps {
  codes: string[];
  lotteryId: string;
}

function TicketCodeGrid({ codes, lotteryId }: GridProps) {
  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          {lotteryId.toUpperCase()}
        </span>
        <span className="text-sm text-gray-500">Одоогийн тасалбарууд</span>
      </div>
      <div className="max-h-64 overflow-y-auto bg-gray-50 rounded-xl p-3">
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {codes.map((code) => (
            <div
              key={code}
              className="bg-white border border-gray-200 rounded-lg px-2 py-2 text-center"
            >
              <span className="text-xs font-mono font-medium text-gray-700">{code}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
