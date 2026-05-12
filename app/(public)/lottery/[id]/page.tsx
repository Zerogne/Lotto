import { notFound, redirect } from "next/navigation";
import { getLotteryById } from "@/lib/db";

export default async function LotteryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lottery = await getLotteryById(id);
  if (!lottery) notFound();
  redirect(`/lottery/${id}/purchase`);
}
