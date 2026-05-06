/**
 * Live score for a linked match. Pulled from the latest snapshot's
 * source_meta via /api/score/{event_id}. Refreshes every 5s.
 */
import { Activity } from "lucide-react";
import { useScore } from "@/hooks/useScore";

interface Props {
  eventId: number | null;
}

export function LiveScoreBadge({ eventId }: Props) {
  const { data, isLoading } = useScore(eventId, !!eventId);
  if (!eventId || isLoading) return null;
  const score = data?.score;
  const matchTime = data?.match_time;
  if (!score && !matchTime) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-1.5 py-0.5 text-[11px] font-mono font-medium text-destructive">
      <Activity className="h-3 w-3 animate-pulse" />
      {score && <span className="tabular-nums">{score}</span>}
      {matchTime && <span className="text-muted-foreground">· {matchTime}</span>}
    </span>
  );
}
