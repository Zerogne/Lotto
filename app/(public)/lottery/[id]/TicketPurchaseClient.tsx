"use client";

import { useState } from "react";
import { Lottery, formatMNT, getTicketsByLottery, gen6DigitRandom } from "@/lib/mock-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QrCode, CheckCircle2 } from "lucide-react";

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
  const [captchaOk, setCaptchaOk] = useState(false);
  const [qpayOpen, setQpayOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [errors, setErrors] = useState<{ phone?: string; captcha?: string; general?: string }>({});

  function handleCaptchaCheck() {
    if (parseInt(captchaInput) === captcha.answer) {
      setCaptchaOk(true);
      setErrors((prev) => ({ ...prev, captcha: undefined }));
    } else {
      setCaptchaOk(false);
      setErrors((prev) => ({ ...prev, captcha: "Буруу хариулт байна" }));
    }
  }

  function handleBuy() {
    const errs: typeof errors = {};
    if (!/^\d{8}$/.test(phone)) errs.phone = "8 оронтой утасны дугаар оруулна уу";
    if (!captchaOk) errs.captcha = "Хамгаалалтыг шалгана уу";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setQpayOpen(true);
  }

  function handlePaid() {
    setNewCode(gen6DigitRandom());
    setQpayOpen(false);
    setSuccessOpen(true);
  }

  const codes = existingTickets.map((t) => t.code);
  const phoneConfirmed = phone.length === 8;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Hero header ── */}
      <div className="relative bg-gray-900 overflow-hidden shrink-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
          }}
        />
        {/* decorative diagonal lines */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(255,255,255,0.05) 20px,rgba(255,255,255,0.05) 40px)",
          }}
        />
        <div className="relative z-10 text-center py-8 px-4">
          <p className="text-amber-400 font-black text-2xl sm:text-3xl uppercase tracking-widest leading-none mb-1 drop-shadow-lg">
            {lottery.carBrand}
          </p>
          <h1 className="text-white font-black text-3xl sm:text-4xl uppercase tracking-widest leading-none drop-shadow-lg">
            {lottery.carModel} СУГАЛАА
          </h1>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 px-4 pt-4 pb-32 lg:pb-10 max-w-lg mx-auto w-full">

        {/* Info banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5 text-center">
          <p className="text-sm text-gray-800 italic leading-relaxed">
            {phoneConfirmed ? (
              <>
                <strong className="not-italic">{phone}</strong> дугаар дээр сугалааны эрх
                бүртгэгдэж баталгаажсан байна.
                <br />
                <span className="text-amber-700 font-medium">Таныг Азын тэнгэр ивээг</span>
              </>
            ) : (
              "Утасны дугаараа оруулж, сугалааны кодоо аваарай"
            )}
          </p>
        </div>

        {/* Phone input */}
        <div className="mb-4">
          <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-gray-700 mb-1.5">
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
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        {/* CAPTCHA row */}
        <div className="mb-5">
          <p className="text-red-500 text-sm font-semibold italic mb-2">
            Хамгаалалтын хүрээнд заавал бөглөнө!
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl select-none">🔐</span>
            <span className="text-2xl select-none">❓</span>
            <span className="font-black text-gray-900 text-base whitespace-nowrap">
              {captcha.a}+{captcha.b} =
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={captchaInput}
              onChange={(e) => {
                setCaptchaInput(e.target.value);
                if (captchaOk) setCaptchaOk(false);
              }}
              className={`w-14 h-10 border-2 rounded-lg text-center text-base font-bold focus:outline-none transition-colors ${
                captchaOk
                  ? "border-green-400 bg-green-50"
                  : errors.captcha
                  ? "border-red-400"
                  : "border-gray-300 focus:border-amber-400"
              }`}
            />
            <button
              type="button"
              onClick={handleCaptchaCheck}
              className={`h-10 px-4 rounded-lg font-black text-sm uppercase tracking-wide transition-colors shadow-sm ${
                captchaOk
                  ? "bg-green-500 text-white"
                  : "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white"
              }`}
            >
              {captchaOk ? "✓ Зөв" : "Шалгах"}
            </button>
          </div>
          {errors.captcha && !captchaOk && (
            <p className="text-red-500 text-xs mt-1">{errors.captcha}</p>
          )}
        </div>

        {/* Ticket code grid */}
        <TicketCodeGrid codes={codes} lotteryId={lottery.id} />
      </div>

      {/* ── Fixed bottom CTA ── */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3 lg:static lg:bg-transparent lg:border-0 lg:backdrop-blur-none lg:max-w-lg lg:mx-auto lg:w-full lg:pb-8">
        <button
          onClick={handleBuy}
          className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-black text-base uppercase tracking-widest py-4 rounded-xl transition-colors shadow-lg"
        >
          QPay-аар төлбөр хийх
        </button>
      </div>

      {/* ── QPay Modal ── */}
      <Dialog open={qpayOpen} onOpenChange={setQpayOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-black uppercase tracking-wide">
              QPay Төлбөр
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center text-gray-400">
                <QrCode className="h-16 w-16 mx-auto mb-2" />
                <p className="text-xs font-medium">QR код</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-gray-900">{formatMNT(lottery.ticketPrice)}</p>
              <p className="text-sm text-gray-500 mt-1">Шилжүүлэх дүн</p>
            </div>
            <p className="text-sm text-center text-gray-700 bg-amber-50 border border-amber-200 p-3 rounded-xl w-full">
              QPay-аар төлбөр хийнэ үү. Төлбөр амжилттай болсны дараа доорх товчийг дарна уу.
            </p>
            <button
              onClick={handlePaid}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black text-lg py-4 rounded-xl transition-colors uppercase tracking-wide"
            >
              Төлбөр хийлээ
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Success Modal ── */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-black text-green-700 uppercase">
              Амжилттай!
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <div className="text-center w-full">
              <p className="text-gray-600 text-sm mb-3">Таны сугалааны дугаар:</p>
              {/* Display new code as digit bubbles */}
              <div className="flex justify-center gap-2 mb-3">
                {newCode.split("").map((digit, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-lg shadow"
                  >
                    {digit}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Энэ дугаарыг хадгалаарай. Сугалааны үр дүн{" "}
                <strong>{new Date(lottery.drawDate).toLocaleDateString("mn-MN")}</strong>
                -д зарлагдана.
              </p>
            </div>
            <button
              onClick={() => setSuccessOpen(false)}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-black py-3 rounded-xl transition-colors uppercase"
            >
              Хаах
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Ticket code grid ── */
function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

interface GridProps {
  codes: string[];
  lotteryId: string;
}

function TicketCodeGrid({ codes, lotteryId }: GridProps) {
  const rows = chunkArray(codes, 2);

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {/* Grid header */}
      <div className="bg-gray-50 border-b border-gray-200 px-3 py-2">
        <p className="text-sm">
          <span className="text-amber-500 font-black">{lotteryId}</span>
          <span className="text-gray-600"> дугаар бүртгэлтэй кодууд:</span>
        </p>
      </div>

      {/* Scrollable digit grid */}
      <div className="bg-white max-h-64 overflow-y-auto px-3 py-3 space-y-2">
        {rows.map((pair, rowIdx) => (
          <div key={rowIdx} className="flex items-center gap-2 justify-center">
            {pair.map((code, ci) => (
              <div key={ci} className="flex gap-[3px]">
                {code.split("").map((digit, di) => (
                  <div
                    key={di}
                    className="w-[26px] h-[26px] rounded-full bg-white border border-gray-300 flex items-center justify-center text-[11px] font-bold text-gray-800 shadow-sm shrink-0"
                  >
                    {digit}
                  </div>
                ))}
              </div>
            ))}
            {/* Pad last row if odd */}
            {pair.length === 1 && (
              <div className="flex gap-[3px] opacity-0 pointer-events-none" aria-hidden>
                {"000000".split("").map((_, di) => (
                  <div key={di} className="w-[26px] h-[26px]" />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer count */}
      <div className="bg-gray-50 border-t border-gray-200 px-3 py-2 text-center">
        <p className="text-xs text-gray-600">
          Нийт авсан сугалаа:{" "}
          <span className="font-black text-gray-900">{codes.length}</span>
        </p>
      </div>
    </div>
  );
}
