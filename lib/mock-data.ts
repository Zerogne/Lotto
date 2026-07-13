export type LotteryStatus = "active" | "ended" | "drawing";

export interface Lottery {
  id: string;
  carName: string;
  carBrand: string;
  carModel: string;
  carImage: string;
  carImages: string[];
  carVideo?: string;
  ticketPrice: number;
  maxTickets: number;
  ticketsSold: number;
  endDate: string;
  drawDate: string;
  status: LotteryStatus;
  description: string;
  prizeValue: number;
}

export interface Ticket {
  code: string;
  phone: string;
  lotteryId: string;
  lotteryName: string;
  purchaseDate: string;
  purchaseGroupId: string;
  createdAt: string;
}

export interface Winner {
  id: string;
  lotteryId: string;
  carName: string;
  carImage: string;
  winnerPhone: string;
  ticketCode: string;
  drawDate: string;
  prizeValue: number;
}

export const LOTTERIES: Lottery[] = [
  {
    id: "88117585",
    carName: "Mercedes G-Class",
    carBrand: "MERCEDES BENZ",
    carModel: "G-CLASS",
    carImage: "/images/car-placeholder.svg",
    carImages: ["/images/car-placeholder.svg"],
    ticketPrice: 50000,
    maxTickets: 500,
    ticketsSold: 347,
    endDate: "2026-05-15",
    drawDate: "2026-05-16",
    status: "active",
    description:
      "2024 оны Mercedes-Benz G-Class 4x4 SUV. 4.0L Twin-Turbo V8 хөдөлгүүртэй, бүх дугуйн хөтөлгөөнтэй тансаг автомашин.",
    prizeValue: 180000000,
  },
  {
    id: "77234891",
    carName: "BMW X7",
    carBrand: "BMW",
    carModel: "X7",
    carImage: "/images/car-placeholder.svg",
    carImages: ["/images/car-placeholder.svg"],
    ticketPrice: 30000,
    maxTickets: 800,
    ticketsSold: 512,
    endDate: "2026-05-20",
    drawDate: "2026-05-21",
    status: "active",
    description:
      "2024 оны BMW X7 xDrive40i. 3.0L Inline-6 турбо хөдөлгүүртэй, 7 суудалтай тансаг SUV.",
    prizeValue: 120000000,
  },
  {
    id: "66398124",
    carName: "Lexus LX",
    carBrand: "LEXUS",
    carModel: "LX 600",
    carImage: "/images/car-placeholder.svg",
    carImages: ["/images/car-placeholder.svg"],
    ticketPrice: 20000,
    maxTickets: 1000,
    ticketsSold: 1000,
    endDate: "2026-03-01",
    drawDate: "2026-03-02",
    status: "ended",
    description:
      "2023 оны Lexus LX 600 F SPORT. 3.5L Twin-Turbo V6 хөдөлгүүртэй, бүрэн тоноглогдсон тансаг SUV.",
    prizeValue: 150000000,
  },
];

function gen6DigitCode(lotteryIdx: number, ticketIdx: number): string {
  const n = ((lotteryIdx + 1) * 314159 + (ticketIdx + 1) * 271828 + ticketIdx * 37) % 900000 + 100000;
  return String(n);
}

const phones = [
  "9911****",
  "8812****",
  "9988****",
  "9900****",
  "8844****",
  "9977****",
  "8833****",
  "9955****",
  "8866****",
  "9944****",
];

function makeTickets(lotteryId: string, lotteryName: string, lotteryIdx: number, count: number, baseDate: string): Ticket[] {
  return Array.from({ length: count }, (_, i) => ({
    code: gen6DigitCode(lotteryIdx, i),
    phone: phones[i % phones.length],
    lotteryId,
    lotteryName,
    purchaseDate: baseDate,
    purchaseGroupId: gen6DigitCode(lotteryIdx, i),
    createdAt: `${baseDate}T00:00:00Z`,
  }));
}

export const TICKETS: Ticket[] = [
  ...makeTickets("88117585", "Mercedes G-Class", 0, 30, "2026-04-20"),
  ...makeTickets("77234891", "BMW X7", 1, 30, "2026-04-22"),
  ...makeTickets("66398124", "Lexus LX", 2, 30, "2026-02-28"),
];

export const WINNERS: Winner[] = [
  {
    id: "w-001",
    lotteryId: "66398124",
    carName: "Lexus LX",
    carImage: "/images/car-placeholder.svg",
    winnerPhone: "9911****",
    ticketCode: "387028",
    drawDate: "2026-03-02",
    prizeValue: 150000000,
  },
];

export function getLotteryById(id: string): Lottery | undefined {
  return LOTTERIES.find((l) => l.id === id);
}

export function getTicketsByLottery(lotteryId: string): Ticket[] {
  return TICKETS.filter((t) => t.lotteryId === lotteryId);
}

export function findTicketByLotteryAndCode(lotteryId: string, codeRaw: string): Ticket | undefined {
  const code = codeRaw.trim();
  if (!/^\d{6}$/.test(code)) return undefined;
  return TICKETS.find((t) => t.lotteryId === lotteryId && t.code === code);
}

/** 8 оронтой дугаарыг дэмо өгөгдлийн `9911****` гэсэн масктай мөрийг эхний 4 оронгоор харьцуулна */
export function findTicketsForPhoneDigits(
  eightDigits: string,
  options?: { lotteryId?: string }
): Ticket[] {
  if (!/^\d{8}$/.test(eightDigits)) return [];
  let list = TICKETS.filter((t) => {
    const m = t.phone.match(/^(\d{4})/);
    return m ? eightDigits.startsWith(m[1]) : false;
  });
  if (options?.lotteryId) list = list.filter((t) => t.lotteryId === options.lotteryId);
  return list;
}

export function getActiveLotteries(): Lottery[] {
  return LOTTERIES.filter((l) => l.status === "active");
}

export function formatMNT(amount: number): string {
  return new Intl.NumberFormat("mn-MN").format(amount) + "₮";
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function gen6DigitRandom(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
