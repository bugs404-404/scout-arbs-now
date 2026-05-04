/**
 * Live arbs feed: TanStack Query for the REST snapshot + WebSocket push for
 * fresh detections. New arbs from the WS stream are merged into the cache so
 * the UI updates within ~150ms of detector emit (no polling lag).
 */
import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { transformArb, type UiArb } from "@/lib/transform";
import { useArbStream } from "./useArbStream";

const KEY = (params: { hours?: number; limit?: number; status?: string }) =>
  ["arbs", params] as const;

export function useArbs(opts: { hours?: number; limit?: number; status?: string } = {}) {
  const params = { hours: opts.hours ?? 24, limit: opts.limit ?? 50, status: opts.status ?? "all" };
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

  // WS push: prepend any newly-detected arb that matches our window
  const { lastArb } = useArbStream();
  useEffect(() => {
    if (!lastArb) return;
    qc.setQueryData<UiArb[]>(KEY(params), (cur) => {
      const cur_ = cur ?? [];
      // Dedup by id — WS may race with REST refresh
      if (cur_.some((a) => a.id === lastArb.id)) return cur_;
      return [lastArb, ...cur_].slice(0, params.limit);
    });
  }, [lastArb, qc, params.hours, params.limit, params.status]);

  // Convenience derived
  const live = useMemo(() => (query.data ?? []).filter((a) => a.status === "In-Play"), [query.data]);
  const pre  = useMemo(() => (query.data ?? []).filter((a) => a.status === "Pre-match"), [query.data]);

  return { ...query, arbs: query.data ?? [], live, pre };
}
