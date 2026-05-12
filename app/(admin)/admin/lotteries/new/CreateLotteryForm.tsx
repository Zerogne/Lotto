"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Upload } from "lucide-react";

interface FormState {
  carName: string;
  carBrand: string;
  carModel: string;
  ticketPrice: string;
  maxTickets: string;
  endDate: string;
  drawDate: string;
  prizeValue: string;
  description: string;
}

const emptyForm: FormState = {
  carName: "",
  carBrand: "",
  carModel: "",
  ticketPrice: "",
  maxTickets: "",
  endDate: "",
  drawDate: "",
  prizeValue: "",
  description: "",
};

export default function CreateLotteryForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageName, setImageName] = useState<string | null>(null);

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  function validate(): boolean {
    const errs: Partial<FormState> = {};
    if (!form.carName.trim()) errs.carName = "Машины нэр оруулна уу";
    if (!form.ticketPrice || isNaN(Number(form.ticketPrice)) || Number(form.ticketPrice) <= 0)
      errs.ticketPrice = "Зөв үнэ оруулна уу";
    if (!form.maxTickets || isNaN(Number(form.maxTickets)) || Number(form.maxTickets) <= 0)
      errs.maxTickets = "Зөв тоо оруулна уу";
    if (!form.endDate) errs.endDate = "Огноо сонгоно уу";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    const res = await fetch("/api/lotteries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        carName: form.carName,
        carBrand: form.carBrand,
        carModel: form.carModel,
        ticketPrice: form.ticketPrice,
        maxTickets: form.maxTickets,
        endDate: form.endDate,
        drawDate: form.drawDate || form.endDate,
        prizeValue: form.prizeValue || "0",
        description: form.description,
      }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
    } else {
      const data = await res.json();
      setApiError(data.error ?? "Алдаа гарлаа");
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="p-8 flex flex-col items-center text-center gap-4">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Амжилттай үүсгэлээ!</h2>
            <p className="text-gray-500 text-sm">
              <strong>{form.carName}</strong> сугалаа амжилттай үүсгэгдлээ.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setForm(emptyForm);
                setSuccess(false);
              }}
            >
              Дахин үүсгэх
            </Button>
            <Button
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => { router.push("/admin/lotteries"); router.refresh(); }}
            >
              Жагсаалт руу буцах
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="carName">Машины нэр</Label>
            <Input
              id="carName"
              value={form.carName}
              onChange={set("carName")}
              placeholder="жн. Mercedes G-Class 2024"
              className={errors.carName ? "border-red-400" : ""}
            />
            {errors.carName && <p className="text-red-500 text-xs">{errors.carName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="carBrand">Брэнд</Label>
              <Input
                id="carBrand"
                value={form.carBrand}
                onChange={set("carBrand")}
                placeholder="MERCEDES BENZ"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="carModel">Модель</Label>
              <Input
                id="carModel"
                value={form.carModel}
                onChange={set("carModel")}
                placeholder="G-CLASS"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Машины зураг</Label>
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors">
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <Upload className="h-7 w-7" />
                <span className="text-sm">{imageName ? imageName : "Зураг оруулах (JPG, PNG)"}</span>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => setImageName(e.target.files?.[0]?.name ?? null)}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ticketPrice">Тасалбарын үнэ (₮)</Label>
              <Input
                id="ticketPrice"
                type="number"
                inputMode="numeric"
                value={form.ticketPrice}
                onChange={set("ticketPrice")}
                placeholder="50000"
                className={errors.ticketPrice ? "border-red-400" : ""}
              />
              {errors.ticketPrice && <p className="text-red-500 text-xs">{errors.ticketPrice}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maxTickets">Нийт тасалбар</Label>
              <Input
                id="maxTickets"
                type="number"
                inputMode="numeric"
                value={form.maxTickets}
                onChange={set("maxTickets")}
                placeholder="500"
                className={errors.maxTickets ? "border-red-400" : ""}
              />
              {errors.maxTickets && <p className="text-red-500 text-xs">{errors.maxTickets}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prizeValue">Шагналын үнэ цэнэ (₮)</Label>
            <Input
              id="prizeValue"
              type="number"
              inputMode="numeric"
              value={form.prizeValue}
              onChange={set("prizeValue")}
              placeholder="180000000"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="endDate">Дуусах огноо</Label>
              <Input
                id="endDate"
                type="date"
                value={form.endDate}
                onChange={set("endDate")}
                min={new Date().toISOString().split("T")[0]}
                className={errors.endDate ? "border-red-400" : ""}
              />
              {errors.endDate && <p className="text-red-500 text-xs">{errors.endDate}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="drawDate">Сугалааны огноо</Label>
              <Input
                id="drawDate"
                type="date"
                value={form.drawDate}
                onChange={set("drawDate")}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Тайлбар</Label>
            <textarea
              id="description"
              value={form.description}
              onChange={set("description")}
              rows={3}
              placeholder="Машины тайлбар оруулна уу..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          {apiError && (
            <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{apiError}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/admin/lotteries")}
            >
              Цуцлах
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
              disabled={loading}
            >
              {loading ? "Үүсгэж байна..." : "Үүсгэх"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
