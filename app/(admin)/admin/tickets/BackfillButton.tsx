"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

// Temporary one-time repair button for tickets inserted before purchase_group_id
// was shared per admin add action instead of per unit. Safe to click more than
// once (a no-op the second time). Remove this component + its API route once run.
export default function BackfillButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function run() {
    if (!confirm("Хуучин тасалбаруудыг нэг удаа цэгцлэх үү? Энэ үйлдлийг дахин ажиллуулж болно.")) return;
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/tickets/backfill-purchase-groups", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error ?? "Алдаа гарлаа");
      return;
    }
    setMsg(`✓ ${data.actionsMerged} бүлэг нэгдлээ (${data.rowsUpdated} мөр)`);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="gap-1 text-xs" disabled={loading} onClick={run}>
        <Wrench className="h-3 w-3" />
        {loading ? "..." : "Хуучин өгөгдлийг цэгцлэх"}
      </Button>
      {msg && <span className="text-xs text-gray-500">{msg}</span>}
    </div>
  );
}
