"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Database, Loader2, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SCHEMA_SQL } from "@/lib/migrate";

export default function SetupClient({ hasToken }: { hasToken: boolean }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "running" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  async function runSetup() {
    setStatus("running");
    setMessage("");
    const res = await fetch("/api/setup", { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setStatus("ok");
      setMessage("Хүснэгтүүд амжилттай үүслээ!");
      setTimeout(() => router.push("/admin"), 1500);
      router.refresh();
    } else {
      setStatus("error");
      setMessage(data.error ?? "Алдаа гарлаа");
    }
  }

  function copySQL() {
    navigator.clipboard.writeText(SCHEMA_SQL.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-amber-100 rounded-full p-2">
          <Database className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Өгөгдлийн сан тохиргоо</h1>
          <p className="text-sm text-gray-500">Supabase хүснэгтүүдийг нэг удаа үүсгэнэ</p>
        </div>
      </div>

      {/* Option A: Auto via Management Token */}
      <Card className="mb-4">
        <CardContent className="p-5">
          <p className="font-semibold text-gray-900 text-sm mb-1">A — Автомат тохиргоо</p>
          {!hasToken ? (
            <div className="text-xs text-gray-600 space-y-2 mb-4">
              <p>
                <code className="bg-gray-100 px-1 rounded">SUPABASE_MANAGEMENT_TOKEN</code> байхгүй байна.
              </p>
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  <a
                    href="https://app.supabase.com/account/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 underline inline-flex items-center gap-1"
                  >
                    app.supabase.com/account/tokens <ExternalLink className="h-3 w-3" />
                  </a>{" "}
                  → <strong>Generate new token</strong> → copy
                </li>
                <li>
                  <code className="bg-gray-100 px-1 rounded">.env</code> файлд нэмнэ үү:
                  <pre className="bg-gray-50 border rounded p-2 mt-1 text-xs">SUPABASE_MANAGEMENT_TOKEN=sbp_xxxxxxxxxxxx</pre>
                </li>
                <li>Dev серверийг дахин эхлүүлнэ үү (<code className="bg-gray-100 px-1 rounded">Ctrl+C</code> → <code className="bg-gray-100 px-1 rounded">npm run dev</code>)</li>
                <li>Энэ хуудсыг дахин нээнэ үү</li>
              </ol>
            </div>
          ) : (
            <p className="text-xs text-green-700 bg-green-50 rounded px-2 py-1 mb-4">
              ✓ Token олдлоо — товч дарахад л хүснэгтүүд үүснэ
            </p>
          )}

          <Button
            onClick={runSetup}
            disabled={!hasToken || status === "running" || status === "ok"}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-2"
          >
            {status === "running" && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === "ok" && <CheckCircle2 className="h-4 w-4" />}
            {status === "idle" && "Автомат тохиргоо хийх"}
            {status === "running" && "Тохируулж байна..."}
            {status === "ok" && "Амжилттай!"}
            {status === "error" && "Дахин оролдох"}
          </Button>

          {message && (
            <p className={`mt-3 text-sm rounded-lg px-3 py-2 ${
              status === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}>
              {message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Option B: Manual SQL */}
      <Card>
        <CardContent className="p-5">
          <p className="font-semibold text-gray-900 text-sm mb-1">B — Гараар (Supabase SQL Editor)</p>
          <p className="text-xs text-gray-500 mb-3">
            Доорх SQL-ийг Supabase Dashboard → SQL Editor дээр ажиллуулна уу.
          </p>
          <div className="flex gap-2 mb-3">
            <Button size="sm" variant="outline" className="gap-1" onClick={copySQL}>
              {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Хуулагдлаа" : "SQL хуулах"}
            </Button>
            <a
              href="https://supabase.com/dashboard/project/zrenrcfpuucjswubrabw/sql/new"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white gap-1">
                SQL Editor нээх <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          </div>
          <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs overflow-x-auto text-gray-700 leading-relaxed max-h-56 overflow-y-auto">
            {SCHEMA_SQL.trim()}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
