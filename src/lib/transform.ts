/**
 * Map raw backend payloads (snake_case) onto the UI's ArbOpportunity shape
 * (defined in mock-data.ts). The mock UI was 2-leg only; real arbs can have
 * 3+ legs (Engine C combos), so we surface ALL legs on the new `legs` field
 * while keeping book1/book2 (= first/second leg) for the existing list view.
 */
import type { ArbOpportunity, Sport } from "./mock-data";
import type { RawArb } from "./api";

const SPORT_MAP: Record<string, Sport> = {
  football: "football",
  basketball: "basketball",
  tennis: "tennis",
  hockey: "hockey",
  ice_hockey: "hockey",
  nfl: "nfl",
};

function toSport(raw: string): Sport {
  return SPORT_MAP[raw?.toLowerCase()] ?? "football";
}

export interface UiLeg {
  bookId: string;
  outcome: string;
  market: string;
  odds: number;
  stake: number;
  potentialReturn: number;
}

export interface UiArb extends ArbOpportunity {
  legs: UiLeg[];
  league: string;
  country: string;
  detectedAt: string;
  expiresAt: string;
  startTime: string;
  profitAbs: number;
  capital: number;
  marketHint: string;
}

export function transformArb(raw: RawArb): UiArb {
  const startMs = Date.parse(raw.start_time);
  const isLive = !Number.isNaN(startMs) && startMs <= Date.now();

  const uiLegs: UiLeg[] = (raw.legs ?? []).map((l) => ({
    bookId: l.book_id,
    outcome: l.outcome_raw,
    market: l.market_raw,
    odds: l.odds,
    stake: l.stake,
    potentialReturn: l.potential_return,
  }));

  // book1/book2 keep the original 2-column display working. If only one leg
  // exists (rare/degenerate), mirror it; if 3+ legs, the dialog shows all.
  const leg0 = uiLegs[0];
  const leg1 = uiLegs[1] ?? uiLegs[0];

  return {
    id: String(raw.id),
    sport: toSport(raw.sport),
    event: `${raw.home} vs ${raw.away}`,
    market: raw.market,
    status: isLive ? "In-Play" : "Pre-match",
    book1: { name: leg0?.bookId ?? "—", odds: leg0?.odds ?? 0 },
    book2: { name: leg1?.bookId ?? "—", odds: leg1?.odds ?? 0 },
    arbPercent: raw.profit_pct,
    suggestedStake: raw.capital,
    legs: uiLegs,
    league: raw.league,
    country: raw.country,
    detectedAt: raw.detected_at,
    expiresAt: raw.expires_at,
    startTime: raw.start_time,
    profitAbs: raw.profit_abs,
    capital: raw.capital,
    marketHint: raw.market,
  };
}
