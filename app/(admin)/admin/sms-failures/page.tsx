import { getFailedSmsLogs } from "@/lib/db";
import FailedSmsTable from "./FailedSmsTable";

export const dynamic = "force-dynamic";

export default async function SmsFailuresPage() {
  const logs = await getFailedSmsLogs();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Илгээгүй мессежүүд</h1>
        <p className="text-sm text-gray-500">Нийт {logs.length} амжилтгүй мессеж</p>
      </div>
      <FailedSmsTable logs={logs} />
    </div>
  );
}
