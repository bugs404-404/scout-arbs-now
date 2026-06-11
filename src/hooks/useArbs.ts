/**
 * Live arbs feed: TanStack Query for the REST snapshot + WebSocket push for
 * fresh detections. New arbs from the WS stream are merged into the cache so
 * the UI updates within ~150ms of detector emit (no polling lag).
 */
import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { transformArb, type UiArb } from "@/lib/transform";
import { useArbStream, onArbClosed } from "./useArbStream";

const KEY = (params: { hours?: number; limit?: number; status?: string }) =>
  ["arbs", params] as const;

export function useArbs(opts: { hours?: number; limit?: number; status?: string } = {}) {
  // default "live" = only arbs whose edge still holds (backend filters status
  // 'detected' AND not expired). A refresh no longer resurrects dead cards.
  const params = { hours: opts.hours ?? 24, limit: opts.limit ?? 50, status: opts.status ?? "live" };
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: KEY(params),
    queryFn: async () => {
      const raw = await api.arbs(params);
      return raw.map(transformArb);
    },
    refetchInterval: 30_000, // safety net if WS misses a push
    staleTime: 5_000,
  });

  // WS push: UPSERT by stable key. A re-confirmation of an existing arb
  // updates it in place (fresh odds/margin/detected_at) — no duplicate cards;
  // a brand-new arb is prepended.
  const { lastArb } = useArbStream();
  useEffect(() => {
    if (!lastArb) return;
    qc.setQueryData<UiArb[]>(KEY(params), (cur) => {
      const cur_ = cur ?? [];
      const i = cur_.findIndex((a) => a.id === lastArb.id);
      if (i >= 0) {
        const next = [...cur_];
        next[i] = lastArb;
        return next;
      }
      return [lastArb, ...cur_].slice(0, params.limit);
    });
  }, [lastArb, qc, params.hours, params.limit, params.status]);

  // arb_closed: the worker's price-truth sweeper says this edge is gone →
  // drop the card immediately (don't wait for the 30s refetch / TTL).
  useEffect(() => {
    return onArbClosed((key) => {
      qc.setQueryData<UiArb[]>(KEY(params), (cur) =>
        (cur ?? []).filter((a) => a.id !== key),
      );
    });
  }, [qc, params.hours, params.limit, params.status]);

  // Convenience derived
  const live = useMemo(() => (query.data ?? []).filter((a) => a.status === "In-Play"), [query.data]);
  const pre  = useMemo(() => (query.data ?? []).filter((a) => a.status === "Pre-match"), [query.data]);

  return { ...query, arbs: query.data ?? [], live, pre };
}
