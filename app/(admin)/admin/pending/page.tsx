import PendingClient from "./PendingClient";

export default function PendingPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Төлбөр баталгаажуулах</h1>
      <PendingClient />
    </div>
  );
}
