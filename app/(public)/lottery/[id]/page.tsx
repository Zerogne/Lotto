import { notFound } from "next/navigation";
import { getLotteryById } from "@/lib/mock-data";
import TicketPurchaseClient from "./TicketPurchaseClient";

export default function LotteryPage({ params }: { params: { id: string } }) {
  const lottery = getLotteryById(params.id);
  if (!lottery) notFound();
  return <TicketPurchaseClient lottery={lottery} />;
}
