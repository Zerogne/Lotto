import { notFound } from "next/navigation";
import { getLotteryById, getActiveLotteries } from "@/lib/db";
import TicketPurchaseClient from "../TicketPurchaseClient";

export const dynamic = "force-dynamic";

export default async function LotteryPurchasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lottery, activeLotteries] = await Promise.all([
    getLotteryById(id),
    getActiveLotteries(),
  ]);
  if (!lottery) notFound();
  return <TicketPurchaseClient lotteries={activeLotteries} initialLotteryId={lottery.id} />;
}
