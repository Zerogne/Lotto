export type LotteryStatus = "active" | "ended" | "drawing";

export interface Lottery {
  id: string;
  carName: string;
  carImage: string;
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
    id: "mglass-001",
    carName: "Mercedes G-Class",
    carImage: "/images/mercedes-g.jpg",
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
    id: "bmwx7-002",
    carName: "BMW X7",
    carImage: "/images/bmw-x7.jpg",
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
    id: "lexuslx-003",
    carName: "Lexus LX",
    carImage: "/images/lexus-lx.jpg",
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

function genCodes(lotteryId: string, count: number, start = 1): string[] {
  return Array.from({ length: count }, (_, i) =>
    `${lotteryId.toUpperCase().slice(0, 3)}-${String(start + i).padStart(4, "0")}`
  );
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

function makeTickets(lotteryId: string, lotteryName: string, count: number, baseDate: string): Ticket[] {
  const codes = genCodes(lotteryId, count);
  return codes.map((code, i) => ({
    code,
    phone: phones[i % phones.length],
    lotteryId,
    lotteryName,
    purchaseDate: baseDate,
  }));
}

export const TICKETS: Ticket[] = [
  ...makeTickets("mglass-001", "Mercedes G-Class", 12, "2026-04-20"),
  ...makeTickets("bmwx7-002", "BMW X7", 12, "2026-04-22"),
  ...makeTickets("lexuslx-003", "Lexus LX", 10, "2026-02-28"),
];

export const WINNERS: Winner[] = [
  {
    id: "w-001",
    lotteryId: "lexuslx-003",
    carName: "Lexus LX",
    carImage: "/images/lexus-lx.jpg",
    winnerPhone: "9911****",
    ticketCode: "LEX-0042",
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
