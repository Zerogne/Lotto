import { createAdminClient } from "./supabase";
import type { Lottery, Ticket, Winner } from "./mock-data";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLottery(r: any): Lottery {
  return {
    id: r.id,
    carName: r.car_name,
    carBrand: r.car_brand ?? "",
    carModel: r.car_model ?? "",
    carImage: r.car_image ?? "/images/car-placeholder.svg",
    carVideo: r.car_video ?? undefined,
    ticketPrice: r.ticket_price,
    maxTickets: r.max_tickets,
    ticketsSold: r.tickets_sold ?? 0,
    endDate: r.end_date,
    drawDate: r.draw_date ?? r.end_date,
    status: r.status,
    description: r.description ?? "",
    prizeValue: r.prize_value ?? 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTicket(r: any): Ticket {
  return {
    code: r.code,
    phone: r.phone,
    lotteryId: r.lottery_id,
    lotteryName: r.lottery_name ?? "",
    purchaseDate: r.purchase_date ?? "",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapWinner(r: any): Winner {
  return {
    id: r.id,
    lotteryId: r.lottery_id,
    carName: r.car_name ?? "",
    carImage: r.car_image ?? "/images/car-placeholder.svg",
    winnerPhone: r.winner_phone ?? "",
    ticketCode: r.ticket_code ?? "",
    drawDate: r.draw_date ?? "",
    prizeValue: r.prize_value ?? 0,
  };
}

export async function getLotteries(): Promise<Lottery[]> {
  const db = createAdminClient();
  const { data } = await db
    .from("lotteries")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []).map(mapLottery);
}

export async function getLotteryById(id: string): Promise<Lottery | undefined> {
  const db = createAdminClient();
  const { data } = await db.from("lotteries").select("*").eq("id", id).maybeSingle();
  return data ? mapLottery(data) : undefined;
}

export async function getActiveLotteries(): Promise<Lottery[]> {
  const db = createAdminClient();
  const { data } = await db
    .from("lotteries")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });
  return (data ?? []).map(mapLottery);
}

export async function getTickets(): Promise<Ticket[]> {
  const db = createAdminClient();
  const { data } = await db
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []).map(mapTicket);
}

export async function getTicketsByLottery(lotteryId: string): Promise<Ticket[]> {
  const db = createAdminClient();
  const { data } = await db.from("tickets").select("*").eq("lottery_id", lotteryId);
  return (data ?? []).map(mapTicket);
}

export async function findTicketsByPhone(
  phone: string,
  lotteryId?: string
): Promise<Ticket[]> {
  const db = createAdminClient();
  let q = db.from("tickets").select("*").eq("phone", phone);
  if (lotteryId) q = q.eq("lottery_id", lotteryId);
  const { data } = await q;
  return (data ?? []).map(mapTicket);
}

export async function getWinners(): Promise<Winner[]> {
  const db = createAdminClient();
  const { data } = await db
    .from("winners")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []).map(mapWinner);
}

export async function getTotalRevenue(): Promise<number> {
  const db = createAdminClient();
  const { data } = await db.from("tickets").select("lottery_id");
  if (!data?.length) return 0;
  const lotteryIds = [...new Set(data.map((t) => t.lottery_id))];
  const { data: lotteries } = await db
    .from("lotteries")
    .select("id, ticket_price")
    .in("id", lotteryIds);
  const priceMap = new Map((lotteries ?? []).map((l) => [l.id, l.ticket_price]));
  return data.reduce((sum, t) => sum + (priceMap.get(t.lottery_id) ?? 0), 0);
}
