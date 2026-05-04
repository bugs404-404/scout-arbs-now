/**
 * Typed REST client for the FastAPI arb backend.
 *
 * Backend is at VITE_API_URL (default http://192.168.100.144:8000).
 * Endpoints:
 *   GET  /api/arbs?limit=50&hours=24&status=all
 *   GET  /api/stats?hours=24
 *   GET  /api/live
 *   GET  /api/capital
 *   POST /api/capital  { capital: number }
 *   WS   /ws/arbs   (handled in hooks/useArbStream)
 */

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://192.168.100.144:8000";

/* ---------- raw backend payloads (snake_case) ---------- */

export interface RawLeg {
  book_id: string;
  outcome_raw: string;
  market_raw: string;
  odds: number;
  stake: number;
  potential_return: number;
}

export interface RawArb {
  id: number;
  detected_at: string;
  expires_at: string;
  status: string;
  profit_pct: number;
  profit_abs: number;
  capital: number;
  market: string;
  home: string;
  away: string;
  start_time: string;
  league: string;
  country: string;
  sport: string;
  legs: RawLeg[];
}

export interface RawScraperHealth {
  book_id: string;
  snaps_1h: number;
  last_seen: string;
  age_sec: number;
  status: "ok" | "stale";
}

export interface RawStats {
  summary: {
    total_arbs: number;
    active_arbs: number;
    last_hour: number;
    unique_events: number;
    avg_margin_pct: number;
    max_margin_pct: number;
    total_potential_profit: number;
    capital: number;
    odds_tracked_24h: number;
  };
  by_book: { book_id: string; arb_count: number; total_staked: number }[];
  by_market: { market: string; count: number; avg_margin_pct: number }[];
  scraper_health: RawScraperHealth[];
}

export interface RawLiveEvent {
  event_id: number;
  home: string;
  away: string;
  league: string;
  sport: string;
  book_id: string;
  age_sec: number;
}

/* ---------- helpers ---------- */

async function fetchJSON<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API ${res.status} ${path}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

/* ---------- public api ---------- */

export const api = {
  arbs: (params: { limit?: number; hours?: number; status?: string } = {}) => {
    const q = new URLSearchParams({
      limit: String(params.limit ?? 50),
      hours: String(params.hours ?? 24),
      status: params.status ?? "all",
    });
    return fetchJSON<RawArb[]>(`/api/arbs?${q}`);
  },
  stats: (hours = 24) => fetchJSON<RawStats>(`/api/stats?hours=${hours}`),
  live: () => fetchJSON<RawLiveEvent[]>(`/api/live`),
  capital: {
    get: () => fetchJSON<{ capital: number }>(`/api/capital`),
    set: (capital: number) =>
      fetchJSON<{ capital: number }>(`/api/capital`, {
        method: "POST",
        body: JSON.stringify({ capital }),
      }),
  },
};

export const WS_URL =
  (import.meta.env.VITE_WS_URL as string | undefined) ??
  "ws://192.168.100.144:8000/ws/arbs";
