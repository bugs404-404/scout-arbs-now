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
 *   GET  /api/exec/status
 *   GET  /api/exec/candidates?limit=100&capital=100
 *   POST /api/exec/ticket
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
  key?: string;
  event_id?: number;
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
  is_live?: boolean;
  league: string;
  country: string;
  sport: string;
  flags?: string[];
  legs: RawLeg[];
}

export interface RawScraperHealth {
  book_id: string;
  snaps_1h: number;
  last_seen: string;
  age_sec: number;
  status: "ok" | "stale" | "down";
  live_age_sec: number | null;
  prematch_age_sec: number | null;
  live_snaps_1h: number;
  prematch_snaps_1h: number;
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

export interface RawScore {
  event_id: number;
  book_id?: string;
  score: string | null;
  match_time: number | string | null;
  match_time_extended?: string | null;
  fetched_at?: string | null;
  raw: Record<string, unknown> | null;
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

/* ---------- execution (placing a bet) ---------- */

/** One leg as the executor addresses it: the book's OWN ids, not text.
 *  A leg with a null outcome_id cannot be placed — the extension would have
 *  to match on a translated label, which is how the wrong selection gets
 *  backed. The backend refuses those at mint; the UI shows why. */
export interface RawExecLeg {
  book_id: string;
  odds: number;
  outcome_id: string | null;
  market_id: string | null;
  specifier: string | null;
  book_event_id: string | null;
  market_raw: string;
  outcome_raw: string;
  is_live: boolean;
}

/** An open arb plus the executor's verdict on it. `blocks` is deliberately
 *  populated for arbs that CANNOT be placed rather than hiding them: an arb
 *  that quietly disappears teaches nothing, a blocked one names the rail. */
export interface RawCandidate {
  id: number;
  arb_key: string;
  raw_pct: number;
  detector_pct: number;
  net_pct: number;
  age_sec: number;
  is_live: boolean;
  flags: string[];
  sport: string;
  league: string;
  match: string;
  market: string;
  legs: RawExecLeg[];
  /** per-leg stake preview, decimal strings, aligned with `legs` */
  stakes: string[];
  total_stake: string;
  placeable: boolean;
  blocks: string[];
}

export interface RawCandidates {
  candidates: RawCandidate[];
  routable: string[];
  dry_run: boolean;
  killed: boolean;
  capital: string;
}

export interface RawExecStatus {
  dry_run: boolean;
  killed: boolean;
  token_configured: boolean;
  nodes_online: number;
  open_tickets: number;
  reserved_total: number;
  expired_swept: number;
}

export interface RawPlacement {
  leg_index: number;
  ok: boolean;
  err?: string | null;
  bet_id?: string | null;
  odds?: number | null;
  stake?: string | null;
}

/** Result of one Place click. `state` is the ticket's terminal state:
 *  filled | aborted | half_filled | void. `half_filled` is the expensive one
 *  — one side landed and the hedge did not — so it carries `unhedged`. */
export interface RawTicketResult {
  ok: boolean;
  state?: string;
  reason?: string;
  ticket_id?: number;
  dry_run?: boolean;
  placements?: RawPlacement[];
  unhedged?: unknown;
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
  score: (eventId: number) => fetchJSON<RawScore>(`/api/score/${eventId}`),
  autoBet: {
    get: () => fetchJSON<{ enabled: boolean }>(`/api/auto_bet`),
    set: (enabled: boolean) =>
      fetchJSON<{ enabled: boolean }>(`/api/auto_bet`, {
        method: "POST",
        body: JSON.stringify({ enabled }),
      }),
  },
  exec: {
    status: () => fetchJSON<RawExecStatus>(`/api/exec/status`),
    /** capital is the BASE the stake preview is computed from. It must be the
     *  same number `ticket()` posts, or the operator confirms stakes that are
     *  not the ones placed (mint scales the base up to book minimums). */
    candidates: (limit = 100, capital = 100) =>
      fetchJSON<RawCandidates>(
        `/api/exec/candidates?limit=${limit}&capital=${capital}`),
    ticket: (body: {
      arb_key: string;
      opportunity_id: number | null;
      legs: RawExecLeg[];
      capital: number;
      flags: string[];
    }) =>
      fetchJSON<RawTicketResult>(`/api/exec/ticket`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
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
