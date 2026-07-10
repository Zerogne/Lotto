"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Upload, Loader2, X } from "lucide-react";

interface FormState {
  carName: string;
  ticketPrice: string;
  maxTickets: string;
  endDate: string;
  prizeValue: string;
  description: string;
}

const emptyForm: FormState = {
  carName: "",
  ticketPrice: "",
  maxTickets: "",
  endDate: "",
  prizeValue: "",
  description: "",
};

async function uploadToCloudinary(file: File, type: "image" | "video"): Promise<string> {
  const signRes = await fetch("/api/upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  });
  if (!signRes.ok) throw new Error("Sign failed");
  const { signature, timestamp, folder, apiKey, cloudName, resourceType } = await signRes.json();

  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", apiKey);
  fd.append("timestamp", String(timestamp));
  fd.append("signature", signature);
  fd.append("folder", folder);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
    method: "POST",
    body: fd,
  });
  if (!uploadRes.ok) throw new Error("Upload failed");
  const data = await uploadRes.json();
  return data.secure_url as string;
}

export default function CreateLotteryForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  interface ImageItem {
    id: string;
    preview: string;
    url: string;
    uploading: boolean;
  }
  const [images, setImages] = useState<ImageItem[]>([]);
  const imageUploading = images.some((img) => img.uploading);
  const imageUrls = images.map((img) => img.url).filter(Boolean);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoName, setVideoName] = useState("");
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  async function handleImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = "";
    const newItems: ImageItem[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      preview: URL.createObjectURL(file),
      url: "",
      uploading: true,
    }));
    setImages((prev) => [...prev, ...newItems]);
    await Promise.all(
      files.map(async (file, i) => {
        const id = newItems[i].id;
        try {
          const url = await uploadToCloudinary(file, "image");
          setImages((prev) => prev.map((img) => (img.id === id ? { ...img, url, uploading: false } : img)));
        } catch {
          setApiError("Зураг оруулахад алдаа гарлаа");
          setImages((prev) => prev.filter((img) => img.id !== id));
        }
      })
    );
  }

  function removeImage(id: string) {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  async function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setVideoName(file.name);
    setVideoUploading(true);
    try {
      const url = await uploadToCloudinary(file, "video");
      setVideoUrl(url);
    } catch {
      setApiError("Видео оруулахад алдаа гарлаа");
    } finally {
      setVideoUploading(false);
    }
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
    if (imageUploading || videoUploading) {
      setApiError("Файл байршуулж дуустал хүлээнэ үү");
      return;
    }
    setLoading(true);
    setApiError("");
    const res = await fetch("/api/lotteries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        carName: form.carName,
        carImages: imageUrls,
        carVideo: videoUrl || undefined,
        ticketPrice: form.ticketPrice,
        maxTickets: form.maxTickets,
        endDate: form.endDate,
        drawDate: form.endDate,
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
            <Button variant="outline" className="flex-1" onClick={() => { setForm(emptyForm); setSuccess(false); setImages([]); setVideoUrl(""); setVideoName(""); }}>
              Дахин үүсгэх
            </Button>
            <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white" onClick={() => { router.push("/admin/lotteries"); router.refresh(); }}>
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
            <Input id="carName" value={form.carName} onChange={set("carName")} placeholder="жн. Mercedes G-Class 2024" className={errors.carName ? "border-red-400" : ""} />
            {errors.carName && <p className="text-red-500 text-xs">{errors.carName}</p>}
          </div>

          {/* Image upload */}
          <div className="space-y-1.5">
            <Label>Машины зураг <span className="text-gray-400 font-normal">(олон зураг оруулж болно)</span></Label>
            <div className="grid grid-cols-3 gap-2">
              {images.map((img) => (
                <div key={img.id} className="relative h-24 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.preview} alt="preview" className="h-full w-full object-cover" />
                  {img.uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors text-gray-400">
                <Upload className="h-6 w-6" />
                <span className="text-xs mt-1">Зураг нэмэх</span>
                <input type="file" className="hidden" accept="image/*" multiple onChange={handleImagesChange} />
              </label>
            </div>
            {imageUrls.length > 0 && <p className="text-xs text-green-600">✓ {imageUrls.length} зураг байршлаа</p>}
          </div>

          {/* Video upload */}
          <div className="space-y-1.5">
            <Label>Машины видео <span className="text-gray-400 font-normal">(заавал биш)</span></Label>
            <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors">
              <div className="flex flex-col items-center gap-1.5 text-gray-400">
                {videoUploading ? <Loader2 className="h-6 w-6 animate-spin text-amber-500" /> : <Upload className="h-6 w-6" />}
                <span className="text-sm">{videoUploading ? "Байршуулж байна..." : videoName || "Видео оруулах (MP4, MOV)"}</span>
              </div>
              <input type="file" className="hidden" accept="video/*" onChange={handleVideoChange} />
            </label>
            {videoUrl && <p className="text-xs text-green-600">✓ Видео байршлаа</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ticketPrice">Тасалбарын үнэ (₮)</Label>
              <Input id="ticketPrice" type="number" inputMode="numeric" value={form.ticketPrice} onChange={set("ticketPrice")} placeholder="50000" className={errors.ticketPrice ? "border-red-400" : ""} />
              {errors.ticketPrice && <p className="text-red-500 text-xs">{errors.ticketPrice}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maxTickets">Нийт тасалбар</Label>
              <Input id="maxTickets" type="number" inputMode="numeric" value={form.maxTickets} onChange={set("maxTickets")} placeholder="500" className={errors.maxTickets ? "border-red-400" : ""} />
              {errors.maxTickets && <p className="text-red-500 text-xs">{errors.maxTickets}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prizeValue">Шагналын үнэ цэнэ (₮)</Label>
            <Input id="prizeValue" type="number" inputMode="numeric" value={form.prizeValue} onChange={set("prizeValue")} placeholder="180000000" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="endDate">Дуусах огноо</Label>
            <Input id="endDate" type="date" value={form.endDate} onChange={set("endDate")} min={new Date().toISOString().split("T")[0]} className={errors.endDate ? "border-red-400" : ""} />
            {errors.endDate && <p className="text-red-500 text-xs">{errors.endDate}</p>}
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

          {apiError && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{apiError}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => router.push("/admin/lotteries")}>
              Цуцлах
            </Button>
            <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white" disabled={loading || imageUploading || videoUploading}>
              {loading ? "Үүсгэж байна..." : "Үүсгэх"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
