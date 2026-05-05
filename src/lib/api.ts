/**
 * Typed REST client for the FastAPI arb backend.
 *
 * Backend URL = VITE_API_URL or same-origin (empty string).
 * Endpoints:
 *   GET  /api/arbs?limit=50&hours=24&status=all
 *   GET  /api/stats?hours=24
 *   GET  /api/live
 *   GET  /api/capital
 *   POST /api/capital  { capital: number }
 *   WS   /ws/arbs   (handled in hooks/useArbStream)
 */

// Empty string / undefined = same-origin. Nginx in the dashboard
// container reverse-proxies /api/* and /ws/* to the backend, so the
// browser never has to know the backend host. This makes the build
// portable: works on localhost, LAN, AND any public tunnel hostname
// pointing at port 3000 — no rebuild required.
const _RAW_API = import.meta.env.VITE_API_URL as string | undefined;
const API_URL = _RAW_API && _RAW_API.length > 0 ? _RAW_API : "";

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

export interface RawHistoryDay {
  date: string;            // ISO YYYY-MM-DD
  arb_count: number;
  avg_margin_pct: number;
  potential_profit: number;
  cumulative: number;
}

export interface RawBookmaker {
  book_id: string;
  snaps_1h: number;
  last_seen: string | null;
  age_sec: number;
  status: "ok" | "stale" | "down";
  event_count: number;
  arb_count: number;
  total_staked: number;
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
  history: (days = 30) => fetchJSON<RawHistoryDay[]>(`/api/history?days=${days}`),
  bookmakers: (hours = 24) => fetchJSON<RawBookmaker[]>(`/api/bookmakers?hours=${hours}`),
  capital: {
    get: () => fetchJSON<{ capital: number }>(`/api/capital`),
    set: (capital: number) =>
      fetchJSON<{ capital: number }>(`/api/capital`, {
        method: "POST",
        body: JSON.stringify({ capital }),
      }),
  },
};

// WebSocket URL: derive from the current page origin so it follows scheme
// (ws ↔ wss) and host automatically. Override with VITE_WS_URL if needed.
function defaultWsUrl(): string {
  if (typeof window === "undefined") return "";
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/ws/arbs`;
}
const _RAW_WS = import.meta.env.VITE_WS_URL as string | undefined;
export const WS_URL = _RAW_WS && _RAW_WS.length > 0 ? _RAW_WS : defaultWsUrl();
