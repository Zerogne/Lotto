"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

export default function SmsTestSection() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("BLCK: test message");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; detail?: string } | null>(null);

  async function send() {
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/sms/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, message }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ ok: false, detail: String(err) });
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">SMS тест</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-3 items-end">
          <div>
            <Label htmlFor="test-phone">Утасны дугаар</Label>
            <Input
              id="test-phone"
              placeholder="99112233"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="test-message">Мессеж</Label>
            <Input
              id="test-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <Button
            className="gap-1.5"
            disabled={!phone || sending}
            onClick={send}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Илгээх
          </Button>
        </div>
        {result && (
          <p className={`text-sm mt-3 ${result.ok ? "text-green-600" : "text-red-500"}`}>
            {result.ok ? "Амжилттай илгээлээ." : `Амжилтгүй: ${result.detail ?? "тодорхойгүй алдаа"}`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
