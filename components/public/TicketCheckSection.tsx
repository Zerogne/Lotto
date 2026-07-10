"use client";

import { type FormEvent, useMemo, useState } from "react";
import type { Lottery, Ticket } from "@/lib/mock-data";
import { formatMNT } from "@/lib/mock-data";
import DarkHeroShell from "@/components/public/DarkHeroShell";
import { CheckCircle2, XCircle } from "lucide-react";

function seededCaptcha(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 9973;
  }
  const a = (hash % 9) + 1;
  const b = (Math.floor(hash / 9) % 9) + 1;
  return { a, b, answer: a + b };
}

interface Props {
  lotteries: Lottery[];
  defaultLotteryId: string;
  lockLotterySelect?: boolean;
  showHero?: boolean;
}

export default function TicketCheckSection({
  lotteries,
  defaultLotteryId,
  lockLotterySelect = false,
  showHero = true,
}: Props) {
  const [phone, setPhone] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captcha] = useState(() => seededCaptcha(defaultLotteryId));
  const [submitted, setSubmitted] = useState<false | "found" | "notfound">(false);
  const [matches, setMatches] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; captcha?: string }>({});

  const lotteryMeta = useMemo(
    () => lotteries.find((l) => l.id === defaultLotteryId) ?? lotteries[0],
    [lotteries, defaultLotteryId]
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!/^\d{8}$/.test(phone)) errs.phone = "8 оронтой утасны дугаар оруулна уу";
    if (parseInt(captchaInput, 10) !== captcha.answer)
      errs.captcha = "Хамгаалалтын хариулт буруу байна";
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setSubmitted(false);
      setMatches([]);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams({ phone });
    if (lockLotterySelect) params.set("lotteryId", defaultLotteryId);
    const res = await fetch(`/api/tickets/check?${params}`);
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      setMatches(data.tickets ?? []);
      setSubmitted(data.tickets?.length > 0 ? "found" : "notfound");
    } else {
      setSubmitted("notfound");
      setMatches([]);
    }
  }

  if (lotteries.length === 0) return null;

  return (
    <section className="flex flex-col bg-white">
      {showHero && lotteryMeta && (
        <DarkHeroShell className="shrink-0">
          <div className="relative z-10 px-4 py-8 text-center">
            <span className="mb-4 inline-block rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-200">
              Сугалаа шалгах
            </span>
            <p className="font-black text-2xl uppercase tracking-widest leading-none text-amber-400 drop-shadow-lg sm:text-3xl">
              {lotteryMeta.carBrand}
            </p>
            <h2 className="mt-2 font-black text-3xl uppercase tracking-widest leading-none drop-shadow-lg text-white sm:text-4xl">
              {lotteryMeta.carModel} СУГАЛАА
            </h2>
            <div className="mt-8 inline-block rounded-2xl border border-white/20 bg-white/10 px-6 py-3 backdrop-blur">
              <p className="text-amber-400 font-black text-2xl sm:text-3xl">
                {formatMNT(lotteryMeta.prizeValue)}
              </p>
              <p className="mt-0.5 text-xs uppercase tracking-wider text-white/60">Нийт шагналын дүн</p>
            </div>
          </div>
        </DarkHeroShell>
      )}

      <div className="flex flex-1 flex-col lg:mx-auto lg:w-full lg:max-w-lg">
        <div className="mx-auto w-full max-w-lg flex-1 px-4 pt-4 pb-6 lg:pb-8">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-4">
              <h1>Сугалаа шалгах</h1>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Утасны дугаар
              </label>
              <input
                type="tel"
                name="phone"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={8}
                value={phone}
                placeholder="••••••••"
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 8));
                  setSubmitted(false);
                  setMatches([]);
                }}
                className={`h-12 w-full rounded-lg border-2 px-4 text-xl font-mono tracking-widest transition-colors focus:outline-none ${
                  errors.phone
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-amber-400"
                }`}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>

            <div className="mb-6">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Шалгах тоо
              </label>
              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap font-semibold text-base text-gray-700 tabular-nums">
                  {captcha.a} + {captcha.b} =
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={captchaInput}
                  onChange={(e) => {
                    setCaptchaInput(e.target.value);
                    setSubmitted(false);
                    setMatches([]);
                  }}
                  className={`h-11 w-16 rounded-lg border-2 text-center text-base font-bold focus:outline-none ${
                    errors.captcha ? "border-red-400" : "border-gray-200 focus:border-amber-400"
                  }`}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 flex-1 rounded-lg px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 active:bg-amber-700 bg-amber-500 disabled:opacity-60"
                >
                  {loading ? "Шалгаж байна…" : "Шалгах"}
                </button>
              </div>
              {errors.captcha && <p className="mt-1 text-xs text-red-500">{errors.captcha}</p>}
            </div>

            {((submitted === "found" && matches.length > 0) || submitted === "notfound") && (
              <output className="block border-t border-gray-100 pt-8" aria-live="polite">
                {submitted === "found" && (
                  <div className="overflow-hidden rounded-xl border-2 border-amber-200 bg-gradient-to-br from-white to-amber-50/60 shadow-sm">
                    <div className="border-b border-amber-200 bg-amber-50/95 px-3 py-2">
                      <p className="text-center text-[11px] font-black uppercase tracking-[0.12em] text-amber-800">
                        Олсон сугалаа ({matches.length})
                      </p>
                    </div>
                    <div className="divide-y divide-amber-100 px-3 py-2">
                      {matches.map((t, idx) => (
                        <div
                          key={`${t.lotteryId}-${t.code}-${idx}`}
                          className="flex flex-col gap-2 py-3 first:pt-2"
                        >
                          <div className="text-center">
                            <span className="text-xs font-bold uppercase tracking-wide text-gray-700">
                              {t.lotteryName}
                            </span>
                          </div>
                          <TicketCodeCircles code={t.code} />
                          <p className="text-center text-[11px] text-gray-500">
                            Огноо: <span className="tabular-nums font-semibold text-gray-700">{t.purchaseDate}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-b-xl border-t border-amber-100 bg-amber-50/80 px-3 py-3 text-center">
                      <CheckCircle2 className="mx-auto mb-1 size-5 text-green-600" aria-hidden />
                      <p className="text-xs text-gray-700">Сугалаа олдлоо. Хожигч зарлагдах хүртэл хүлээнэ үү.</p>
                    </div>
                  </div>
                )}

                {submitted === "notfound" && (
                  <div className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-4 text-sm text-red-950 shadow-sm">
                    <div className="mb-2 flex items-center justify-center gap-2">
                      <XCircle className="size-6 shrink-0 text-red-500" aria-hidden />
                      <span className="font-black uppercase tracking-wide text-red-800">
                        Сугалаа олдсонгүй
                      </span>
                    </div>
                    <p className="text-center text-red-900/95">
                      Энэ утасны дугаарт бүртгэгдсэн сугалаа олдсонгүй. Дугаараа шалгаад
                      дахин оролдоно уу.
                    </p>
                  </div>
                )}
              </output>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

function TicketCodeCircles({ code }: { code: string }) {
  return (
    <div className="flex justify-center gap-1.5 sm:gap-2">
      {code.split("").map((digit, i) => (
        <div
          key={i}
          className="flex size-9 items-center justify-center rounded-full border-2 border-amber-400 bg-amber-500 text-sm font-black text-white shadow-md sm:size-10 sm:text-base"
        >
          {digit}
        </div>
      ))}
    </div>
  );
}
