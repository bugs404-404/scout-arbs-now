/**
 * Stats: REST snapshot + WS push from /ws/arbs (heartbeat sends fresh stats
 * every 30s, plus immediately on connect).
 */
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { useStatsStream } from "./useArbStream";

const KEY = (hours: number) => ["stats", hours] as const;

export function useStats(hours = 24) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: KEY(hours),
    queryFn: () => api.stats(hours),
    refetchInterval: 30_000,
    staleTime: 5_000,
  });

  const wsStats = useStatsStream();
  useEffect(() => {
    if (!wsStats) return;
    qc.setQueryData(KEY(hours), wsStats);
  }, [wsStats, qc, hours]);

  return query;
}
