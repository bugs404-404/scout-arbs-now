/**
 * Single shared WebSocket to /ws/arbs.
 *
 * Backend pushes:
 *   { type: "arb",   data: {...alert payload, includes legs} }
 *   { type: "stats", data: {...full stats payload} }
 *
 * We expose the latest of each via subscriptions; React components consume
 * via useArbStream() and useStatsStream(). One socket per tab — extra hooks
 * just attach listeners.
 */
import { useEffect, useRef, useState } from "react";

import { WS_URL } from "@/lib/api";
import { transformArb, type UiArb } from "@/lib/transform";
import type { RawArb, RawStats } from "@/lib/api";

type Listener<T> = (msg: T) => void;

interface Bus {
  arb: Set<Listener<UiArb>>;
  stats: Set<Listener<RawStats>>;
  status: Set<Listener<"connecting" | "open" | "closed">>;
}

let socket: WebSocket | null = null;
let reconnectTimer: number | null = null;
let backoffMs = 500;
const bus: Bus = { arb: new Set(), stats: new Set(), status: new Set() };
let lastArb: UiArb | null = null;
let lastStats: RawStats | null = null;
let lastStatus: "connecting" | "open" | "closed" = "closed";

function emit<T>(set: Set<Listener<T>>, msg: T) {
  for (const fn of set) {
    try { fn(msg); } catch { /* ignore */ }
  }
}

function setStatus(s: "connecting" | "open" | "closed") {
  lastStatus = s;
  emit(bus.status, s);
}

function connect() {
  if (typeof window === "undefined") return;
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }
  setStatus("connecting");
  try {
    socket = new WebSocket(WS_URL);
  } catch {
    scheduleReconnect();
    return;
  }
  socket.onopen = () => {
    backoffMs = 500;
    setStatus("open");
  };
  socket.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      if (msg.type === "arb" && msg.data) {
        // The WS alert shape is close to RawArb but NOT identical:
        //   * leg keys are { book, outcome, market, odds, stake } — different
        //     from REST's { book_id, outcome_raw, market_raw, odds, stake, potential_return }
        //   * no `id` (we synthesize a transient one)
        //   * detected_at is unix-seconds float, not ISO
        type WsLeg = {
          book?: string;
          outcome?: string;
          market?: string;
          odds?: number;
          stake?: number;
          potential_return?: number;
        };
        const raw = msg.data as {
          match_id?: string;
          market?: string;
          detected_at?: number | string;
          profit_pct?: number;
          profit_abs?: number;
          capital?: number;
          is_live?: boolean;
          home?: string;
          away?: string;
          league?: string;
          country?: string;
          sport?: string;
          legs?: WsLeg[];
        };
        const synthLegs = (raw.legs ?? []).map((l) => ({
          book_id: l.book ?? "",
          outcome_raw: l.outcome ?? "",
          market_raw: l.market ?? "",
          odds: Number(l.odds ?? 0),
          stake: Number(l.stake ?? 0),
          potential_return: Number(l.potential_return ?? 0),
        }));
        const detectedIso =
          typeof raw.detected_at === "number"
            ? new Date(raw.detected_at * 1000).toISOString()
            : (raw.detected_at as string | undefined) ?? new Date().toISOString();
        const synthRaw: RawArb = {
          id: Math.floor(Math.random() * 1e9), // ws alerts may lack an id; transient
          detected_at: detectedIso,
          expires_at: detectedIso,
          status: "detected",
          profit_pct: Number(raw.profit_pct ?? 0),
          profit_abs: Number(raw.profit_abs ?? 0),
          capital: Number(raw.capital ?? 100),
          market: String(raw.market ?? raw.match_id ?? ""),
          home: raw.home ?? "",
          away: raw.away ?? "",
          start_time: detectedIso,
          league: raw.league ?? "",
          country: raw.country ?? "",
          sport: raw.sport ?? "football",
          legs: synthLegs,
        };
        const ui = transformArb(synthRaw);
        // Force is_live status from alert payload if present
        if (typeof raw.is_live === "boolean") {
          ui.status = raw.is_live ? "In-Play" : "Pre-match";
        }
        lastArb = ui;
        emit(bus.arb, ui);
      } else if (msg.type === "stats" && msg.data) {
        lastStats = msg.data as RawStats;
        emit(bus.stats, lastStats);
      }
    } catch { /* malformed frame */ }
  };
  socket.onclose = () => {
    setStatus("closed");
    scheduleReconnect();
  };
  socket.onerror = () => {
    socket?.close();
  };
}

function scheduleReconnect() {
  if (reconnectTimer != null) return;
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    backoffMs = Math.min(backoffMs * 2, 15_000);
    connect();
  }, backoffMs);
}

function ensureConnected() {
  if (typeof window === "undefined") return;
  connect();
}

export function useArbStream() {
  const [arb, setArb] = useState<UiArb | null>(lastArb);
  const [status, setSt] = useState(lastStatus);
  const seen = useRef<UiArb | null>(lastArb);

  useEffect(() => {
    ensureConnected();
    const onArb: Listener<UiArb> = (m) => {
      if (seen.current === m) return;
      seen.current = m;
      setArb(m);
    };
    const onStatus: Listener<typeof lastStatus> = (s) => setSt(s);
    bus.arb.add(onArb);
    bus.status.add(onStatus);
    return () => {
      bus.arb.delete(onArb);
      bus.status.delete(onStatus);
    };
  }, []);

  return { lastArb: arb, status };
}

export function useStatsStream() {
  const [stats, setStats] = useState<RawStats | null>(lastStats);
  useEffect(() => {
    ensureConnected();
    const onStats: Listener<RawStats> = (m) => setStats(m);
    bus.stats.add(onStats);
    return () => { bus.stats.delete(onStats); };
  }, []);
  return stats;
}
