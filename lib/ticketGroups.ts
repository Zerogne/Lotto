import type { Lottery, Ticket } from "./mock-data";

export interface TicketGroup {
  phone: string;
  lotteryId: string;
  lotteryName: string;
  codes: string[];
  unitsCount: number;
  totalPrice: number;
  lastPurchasedAt: string;
}

export function buildTicketGroups(lotteries: Lottery[], tickets: Ticket[]): TicketGroup[] {
  const priceByLotteryId = new Map(lotteries.map((l) => [l.id, l.ticketPrice]));

  const groupMap = new Map<string, TicketGroup & { unitIds: Set<string> }>();
  for (const t of tickets) {
    const key = `${t.phone}-${t.lotteryId}`;
    const existing = groupMap.get(key);
    if (existing) {
      existing.codes.push(t.code);
      existing.unitIds.add(t.purchaseGroupId);
      if (t.createdAt > existing.lastPurchasedAt) existing.lastPurchasedAt = t.createdAt;
    } else {
      groupMap.set(key, {
        phone: t.phone,
        lotteryId: t.lotteryId,
        lotteryName: t.lotteryName,
        codes: [t.code],
        unitsCount: 0,
        totalPrice: 0,
        lastPurchasedAt: t.createdAt,
        unitIds: new Set([t.purchaseGroupId]),
      });
    }
  }

  return Array.from(groupMap.values())
    .map((g) => {
      const unitsCount = g.unitIds.size;
      const price = priceByLotteryId.get(g.lotteryId) ?? 0;
      return {
        phone: g.phone,
        lotteryId: g.lotteryId,
        lotteryName: g.lotteryName,
        codes: g.codes,
        unitsCount,
        totalPrice: price * unitsCount,
        lastPurchasedAt: g.lastPurchasedAt,
      };
    })
    .sort((a, b) => b.lastPurchasedAt.localeCompare(a.lastPurchasedAt));
}
