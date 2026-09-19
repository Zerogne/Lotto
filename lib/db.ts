import { createAdminClient } from "./supabase";
import type { Lottery, Ticket, Winner } from "./mock-data";
import { DEFAULT_CODE_DIGITS, isLotteryCodeDigits, lotteryCodesPerTicket } from "./lotteryCodes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLottery(r: any): Lottery {
  return {
    id: r.id,
    carName: r.car_name,
    carBrand: r.car_brand ?? "",
    carModel: r.car_model ?? "",
    carImage: r.car_image ?? "/images/car-placeholder.svg",
    carImages: r.car_images?.length ? r.car_images : r.car_image ? [r.car_image] : [],
    carVideo: r.car_video ?? undefined,
    ticketPrice: r.ticket_price,
    codeDigits: isLotteryCodeDigits(r.code_digits) ? r.code_digits : DEFAULT_CODE_DIGITS,
    codesPerTicket: lotteryCodesPerTicket(r.codes_per_ticket),
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
    purchaseGroupId: r.purchase_group_id ?? r.code,
    createdAt: r.created_at ?? "",
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

const SUPABASE_PAGE_SIZE = 1000; // PostgREST caps unbounded selects at 1000 rows

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAllRows(db: ReturnType<typeof createAdminClient>, build: (query: any) => any): Promise<any[]> {
  const rows: unknown[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await build(db.from("tickets").select("*")).range(from, from + SUPABASE_PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < SUPABASE_PAGE_SIZE) break;
    from += SUPABASE_PAGE_SIZE;
  }
  return rows;
}

export async function getTickets(): Promise<Ticket[]> {
  const db = createAdminClient();
  const rows = await fetchAllRows(db, (q) => q
    .order("created_at", { ascending: false })
    .order("lottery_id", { ascending: true })
    .order("code", { ascending: true }));
  return rows.map(mapTicket);
}

export async function getTicketsByLottery(lotteryId: string): Promise<Ticket[]> {
  const db = createAdminClient();
  const rows = await fetchAllRows(db, (q) => q.eq("lottery_id", lotteryId).order("code", { ascending: true }));
  return rows.map(mapTicket);
}

export interface TicketGroupRow {
  purchaseGroupId: string;
  phone: string;
  lotteryId: string;
  lotteryName: string;
  codes: string[];
  codesCount: number;
  lastCreatedAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTicketGroupRow(r: any): TicketGroupRow {
  return {
    purchaseGroupId: r.purchase_group_id,
    phone: r.phone,
    lotteryId: r.lottery_id,
    lotteryName: r.lottery_name ?? "",
    codes: r.codes ?? [],
    codesCount: r.codes_count ?? (r.codes?.length ?? 0),
    lastCreatedAt: r.last_created_at ?? "",
  };
}

// Reads from the ticket_purchase_groups view (see supabase-schema.sql) so
// grouping/search/pagination happen in Postgres instead of fetching every
// ticket code row into the app.
export async function getTicketGroupsPage(opts: {
  search?: string;
  page: number;
  pageSize: number;
}): Promise<{ rows: TicketGroupRow[]; total: number }> {
  const db = createAdminClient();
  const { search, page, pageSize } = opts;
  let query = db.from("ticket_purchase_groups").select("*", { count: "exact" });
  if (search) query = query.ilike("phone", `%${search}%`);
  query = query.order("last_created_at", { ascending: false });
  const from = (page - 1) * pageSize;
  const { data, error, count } = await query.range(from, from + pageSize - 1);
  if (error) throw new Error(error.message);
  return { rows: (data ?? []).map(mapTicketGroupRow), total: count ?? 0 };
}

export async function getTicketCodeCount(): Promise<number> {
  const db = createAdminClient();
  const { count, error } = await db.from("tickets").select("*", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
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

export interface SmsLog {
  id: string;
  phone: string;
  message: string;
  ok: boolean;
  detail?: string;
  lotteryId?: string;
  createdAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSmsLog(r: any): SmsLog {
  return {
    id: r.id,
    phone: r.phone,
    message: r.message,
    ok: r.ok,
    detail: r.detail ?? undefined,
    lotteryId: r.lottery_id ?? undefined,
    createdAt: r.created_at ?? "",
  };
}

// Returns only messages whose most recent send attempt failed — if a phone+message
// pair was later resent successfully, it's excluded.
export async function getFailedSmsLogs(): Promise<SmsLog[]> {
  const db = createAdminClient();
  const { data } = await db
    .from("sms_logs")
    .select("*")
    .order("created_at", { ascending: true });

  const latestByKey = new Map<string, SmsLog>();
  for (const row of data ?? []) {
    const log = mapSmsLog(row);
    latestByKey.set(`${log.phone}::${log.message}`, log);
  }

  return Array.from(latestByKey.values())
    .filter((log) => !log.ok)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
