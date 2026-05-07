import { notFound } from "next/navigation";
import { LOTTERIES, getLotteryById } from "@/lib/mock-data";
import TicketPurchaseClient from "../TicketPurchaseClient";

export default async function LotteryPurchasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lottery = getLotteryById(id);
  if (!lottery) notFound();
  return <TicketPurchaseClient lotteries={LOTTERIES} initialLotteryId={lottery.id} />;
}
