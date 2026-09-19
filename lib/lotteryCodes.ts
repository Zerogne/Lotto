export const CODES_PER_TICKET = 10;
export const DEFAULT_CODE_DIGITS = 5;

export type LotteryCodeDigits = 4 | 5;

export function isLotteryCodeDigits(value: unknown): value is LotteryCodeDigits {
  return value === 4 || value === 5;
}

export function codePoolSize(digits: LotteryCodeDigits): number {
  // Code zero is excluded, matching the existing 00001-99999 range.
  return 10 ** digits - 1;
}

export function maxTicketsForCodeDigits(digits: LotteryCodeDigits): number {
  return Math.floor(codePoolSize(digits) / CODES_PER_TICKET);
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
