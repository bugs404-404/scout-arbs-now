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
  eventId: number | null;
  legs: UiLeg[];
  league: string;
  country: string;
  detectedAt: string;
  expiresAt: string;
  startTime: string;
  profitAbs: number;
  capital: number;
  marketHint: string;
  flags: string[];
  /** PRE-tax margin % (sum of 1/odds over legs). arbPercent is the NET
   *  (post 12% TZ winnings tax) margin from the backend. Shown side-by-side
   *  so the operator sees the tax drag (a 13% raw ≈ 6-7% net). */
  rawPercent: number;
}

export function transformArb(raw: RawArb): UiArb {
  const startMs = Date.parse(raw.start_time);
  // TRUE status: the book's is_live flag (start_time disagrees across book
  // dupes / breaks on late starts) OR'd with kickoff-passed so a prematch arb
  // still flips In-Play once the game starts.
  const isLive = raw.is_live === true ||
    (!Number.isNaN(startMs) && startMs <= Date.now());

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

  // PRE-tax margin from the raw leg odds (no tax). Net = raw.profit_pct.
  const impliedRaw = uiLegs.reduce(
    (s, l) => (l.odds > 1 ? s + 1 / l.odds : s), 0);
  const rawPercent = uiLegs.length ? (1 - impliedRaw) * 100 : raw.profit_pct;

  return {
    // stable identity = arb_key (same across re-detections; the WS close alert
    // keys on it). Fall back to the numeric id only if key absent. Without this
    // REST-fetched cards keyed by numeric id never matched arb_closed → zombie
    // cards stuck showing stale odds (Brazil-Japan).
    id: raw.key ? String(raw.key) : String(raw.id),
    eventId: typeof raw.event_id === "number" ? raw.event_id : null,
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
    flags: raw.flags ?? [],
    rawPercent,
  };
}
