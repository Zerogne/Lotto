import type { Lottery, Ticket } from "./mock-data";
import type { TicketGroupRow } from "./db";
import { CODES_PER_TICKET } from "./lotteryCodes";

export interface TicketGroup {
  purchaseGroupId: string;
  phone: string;
  lotteryId: string;
  lotteryName: string;
  codes: string[];
  unitsCount: number;
  totalPrice: number;
  lastPurchasedAt: string;
}

// Groups by purchase_group_id (one per admin "Гараар нэмэх" action) so two
// separate purchases by the same phone/lottery stay as separate rows, while
// units bought together in one action still merge into a single row.
export function buildTicketGroups(lotteries: Lottery[], tickets: Ticket[]): TicketGroup[] {
  const priceByLotteryId = new Map(lotteries.map((l) => [l.id, l.ticketPrice]));

  const groupMap = new Map<string, TicketGroup>();
  for (const t of tickets) {
    const key = t.purchaseGroupId;
    const existing = groupMap.get(key);
    if (existing) {
      existing.codes.push(t.code);
      if (t.createdAt > existing.lastPurchasedAt) existing.lastPurchasedAt = t.createdAt;
    } else {
      groupMap.set(key, {
        purchaseGroupId: t.purchaseGroupId,
        phone: t.phone,
        lotteryId: t.lotteryId,
        lotteryName: t.lotteryName,
        codes: [t.code],
        unitsCount: 0,
        totalPrice: 0,
        lastPurchasedAt: t.createdAt,
      });
    }
  }

  return Array.from(groupMap.values())
    .map((g) => {
      const unitsCount = Math.max(1, Math.round(g.codes.length / CODES_PER_TICKET));
      const price = priceByLotteryId.get(g.lotteryId) ?? 0;
      return { ...g, unitsCount, totalPrice: price * unitsCount };
    })
    .sort((a, b) => b.lastPurchasedAt.localeCompare(a.lastPurchasedAt));
}

// Same shape as buildTicketGroups' output, but from an already-aggregated
// row (see getTicketGroupsPage in lib/db.ts) instead of raw ticket rows.
export function toTicketGroup(row: TicketGroupRow, priceByLotteryId: Map<string, number>): TicketGroup {
  const unitsCount = Math.max(1, Math.round(row.codesCount / CODES_PER_TICKET));
  const price = priceByLotteryId.get(row.lotteryId) ?? 0;
  return {
    purchaseGroupId: row.purchaseGroupId,
    phone: row.phone,
    lotteryId: row.lotteryId,
    lotteryName: row.lotteryName,
    codes: row.codes,
    unitsCount,
    totalPrice: price * unitsCount,
    lastPurchasedAt: row.lastCreatedAt,
  };
}
