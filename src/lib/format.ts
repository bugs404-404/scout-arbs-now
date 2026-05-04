/**
 * Shared currency / number formatting. Single source of truth so swapping the
 * display currency (USD ↔ TSh) only happens here.
 */

export const CURRENCY = "TSh";

export function fmtMoney(n: number, opts: { compact?: boolean; dp?: number } = {}): string {
  const dp = opts.dp ?? 0;
  if (opts.compact && Math.abs(n) >= 1000) {
    if (Math.abs(n) >= 1_000_000) return `${CURRENCY} ${(n / 1_000_000).toFixed(2)}M`;
    return `${CURRENCY} ${(n / 1000).toFixed(1)}k`;
  }
  return `${CURRENCY} ${n.toLocaleString("en-US", { maximumFractionDigits: dp })}`;
}

export function fmtPct(n: number, dp = 2): string {
  return `${n.toFixed(dp)}%`;
}
