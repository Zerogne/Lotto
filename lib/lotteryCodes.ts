export const CODES_PER_TICKET = 10;
export const FOUR_DIGIT_CODES_PER_TICKET = 5;
export const FOUR_DIGIT_MAX_TICKETS = 1800;
export const DEFAULT_CODE_DIGITS = 5;

export type LotteryCodeDigits = 4 | 5;

export function isLotteryCodeDigits(value: unknown): value is LotteryCodeDigits {
  return value === 4 || value === 5;
}

export function codePoolSize(digits: LotteryCodeDigits): number {
  // Code zero is excluded, matching the existing 00001-99999 range.
  return 10 ** digits - 1;
}

export function codesPerTicketForNewLottery(digits: LotteryCodeDigits): number {
  return digits === 4 ? FOUR_DIGIT_CODES_PER_TICKET : CODES_PER_TICKET;
}

export function lotteryCodesPerTicket(value: unknown): number {
  // Existing lotteries retain the original 10-code setting after migration.
  return value === FOUR_DIGIT_CODES_PER_TICKET ? FOUR_DIGIT_CODES_PER_TICKET : CODES_PER_TICKET;
}

export function maxTicketsForCodeDigits(
  digits: LotteryCodeDigits,
  codesPerTicket = codesPerTicketForNewLottery(digits)
): number {
  const codeCapacity = Math.floor(codePoolSize(digits) / codesPerTicket);
  return digits === 4 ? Math.min(codeCapacity, FOUR_DIGIT_MAX_TICKETS) : codeCapacity;
}

export function unitsForCodeCount(codeCount: number, codesPerTicket: number): number {
  return codeCount === 0 ? 0 : Math.max(1, Math.round(codeCount / codesPerTicket));
}

export function generateUniqueCodes(
  count: number,
  existing: Set<string>,
  digits: LotteryCodeDigits
): string[] {
  const used = new Set(existing);
  const codes: string[] = [];
  const poolSize = codePoolSize(digits);
  while (codes.length < count) {
    const n = Math.floor(1 + Math.random() * poolSize);
    const code = String(n).padStart(digits, "0");
    if (used.has(code)) continue;
    used.add(code);
    codes.push(code);
  }
  return codes;
}
