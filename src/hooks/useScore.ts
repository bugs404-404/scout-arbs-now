/**
 * Live score for a single event id. Backend pulls the latest snapshot's
 * source_meta from the linked cluster, so it works even if one book has
 * gone quiet on that fixture.
 */
import { useQuery } from "@tanstack/react-query";

interface ScoreResponse {
  event_id: number;
  home: string | null;
  away: string | null;
  score: string | null;
  match_time: string | null;
  book_id: string | null;
}

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

export function useScore(eventId: number | null | undefined, enabled = true) {
  return useQuery({
    queryKey: ["score", eventId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/score/${eventId}`);
      if (!res.ok) throw new Error(`score ${res.status}`);
      return (await res.json()) as ScoreResponse;
    },
    enabled: !!eventId && enabled,
    refetchInterval: 5_000,   // refresh score every 5s for live games
    staleTime: 2_000,
  });
}
