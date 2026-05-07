export type LotteryStatus = "active" | "ended" | "drawing";

export interface CarSpec {
  year: string;
  engine: string;
  power: string;
  torque: string;
  transmission: string;
  drivetrain: string;
  acceleration: string;
  topSpeed: string;
  seats: string;
  color: string;
}

export interface Lottery {
  id: string;
  carName: string;
  carBrand: string;
  carModel: string;
  carImage: string;
  ticketPrice: number;
  maxTickets: number;
  ticketsSold: number;
  endDate: string;
  drawDate: string;
  status: LotteryStatus;
  description: string;
  prizeValue: number;
  specs: CarSpec;
  highlights: string[];
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
    id: "88117585",
    carName: "Mercedes G-Class",
    carBrand: "MERCEDES BENZ",
    carModel: "G-CLASS",
    carImage: "/images/mercedes-g.jpg",
    ticketPrice: 50000,
    maxTickets: 500,
    ticketsSold: 347,
    endDate: "2026-05-15",
    drawDate: "2026-05-16",
    status: "active",
    description:
      "2024 оны Mercedes-Benz G-Class 4x4 SUV. 4.0L Twin-Turbo V8 хөдөлгүүртэй, бүх дугуйн хөтөлгөөнтэй тансаг автомашин. Дэлхийн хамгийн алдартай офроад автомашинуудын нэг. Дотор нь бүрэн тоноглогдсон, арьсан суудал, тоон самбар бүхий тансаг таашаал эдлэх боломжтой.",
    prizeValue: 180000000,
    specs: {
      year: "2024",
      engine: "4.0L Twin-Turbo V8",
      power: "585 ХК (430 кВт)",
      torque: "850 Нм",
      transmission: "9AMG Speedshift TCT",
      drivetrain: "4MATIC бүх дугуй",
      acceleration: "0–100 км/ц: 4.5 сек",
      topSpeed: "250 км/ц",
      seats: "5 суудал",
      color: "Obsidian Black Metallic",
    },
    highlights: [
      "AMG Night Package",
      "Panoramic sunroof",
      "Burmester surround sound",
      "360° камер",
      "Арьсан суудал",
      "Тоон хяналтын самбар",
    ],
  },
  {
    id: "77234891",
    carName: "BMW X7",
    carBrand: "BMW",
    carModel: "X7",
    carImage: "/images/bmw-x7.jpg",
    ticketPrice: 30000,
    maxTickets: 800,
    ticketsSold: 512,
    endDate: "2026-05-20",
    drawDate: "2026-05-21",
    status: "active",
    description:
      "2024 оны BMW X7 xDrive40i. 3.0L Inline-6 турбо хөдөлгүүртэй, 7 суудалтай тансаг SUV. BMW-ийн хамгийн том SUV загвар бөгөөд 7 хүн суух боломжтой тансаг автомашин.",
    prizeValue: 120000000,
    specs: {
      year: "2024",
      engine: "3.0L Inline-6 Turbo",
      power: "374 ХК (275 кВт)",
      torque: "500 Нм",
      transmission: "8-хурдтай Steptronic Sport",
      drivetrain: "xDrive бүх дугуй",
      acceleration: "0–100 км/ц: 5.4 сек",
      topSpeed: "250 км/ц",
      seats: "7 суудал",
      color: "Mineral White Metallic",
    },
    highlights: [
      "Sky Lounge Panoramic roof",
      "Harman Kardon дуугаралт",
      "Gesture control",
      "Live Cockpit Professional",
      "Rear entertainment",
      "Automatic parking",
    ],
  },
  {
    id: "66398124",
    carName: "Lexus LX",
    carBrand: "LEXUS",
    carModel: "LX 600",
    carImage: "/images/lexus-lx.jpg",
    ticketPrice: 20000,
    maxTickets: 1000,
    ticketsSold: 1000,
    endDate: "2026-03-01",
    drawDate: "2026-03-02",
    status: "ended",
    description:
      "2023 оны Lexus LX 600 F SPORT. 3.5L Twin-Turbo V6 хөдөлгүүртэй, бүрэн тоноглогдсон тансаг SUV. Lexus-ийн флагман загвар бөгөөд офроад болон хотын нөхцөлд адилхан гайгүй ажилладаг.",
    prizeValue: 150000000,
    specs: {
      year: "2023",
      engine: "3.5L Twin-Turbo V6",
      power: "409 ХК (301 кВт)",
      torque: "650 Нм",
      transmission: "10-хурдтай автомат",
      drivetrain: "AWD бүх дугуй",
      acceleration: "0–100 км/ц: 6.7 сек",
      topSpeed: "220 км/ц",
      seats: "7 суудал",
      color: "Sonic Titanium",
    },
    highlights: [
      "F SPORT тоноглол",
      "Mark Levinson дуугаралт",
      "Multi-terrain select",
      "Crawl control",
      "Semi-aniline арьсан суудал",
      "Head-up display",
    ],
  },
];

function gen6DigitCode(lotteryIdx: number, ticketIdx: number): string {
  const n =
    ((lotteryIdx + 1) * 314159 + (ticketIdx + 1) * 271828 + ticketIdx * 37) %
      900000 +
    100000;
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

function makeTickets(
  lotteryId: string,
  lotteryName: string,
  lotteryIdx: number,
  count: number,
  baseDate: string
): Ticket[] {
  return Array.from({ length: count }, (_, i) => ({
    code: gen6DigitCode(lotteryIdx, i),
    phone: phones[i % phones.length],
    lotteryId,
    lotteryName,
    purchaseDate: baseDate,
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
    carImage: "/images/lexus-lx.jpg",
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

export function gen6DigitRandom(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function maskPhone(phone: string): string {
  if (phone.length < 4) return phone;
  return phone.slice(0, 4) + "****";
}
