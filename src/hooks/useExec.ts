/**
 * Execution surface: what the server will let the operator actually place.
 *
 * Deliberately NOT polled in the background. The board itself is the hot path
 * (WS push + a 30s REST safety net) and `/api/exec/candidates` re-prices every
 * open arb and re-checks every rail on each call — cheap once, wasteful on a
 * timer from every open tab. So the gate is fetched only while the Place
 * dialog is open, which is also the only moment its answer matters: a
 * placeability verdict computed thirty seconds ago is a verdict about a price
 * that no longer exists.
 */
import { useMutation, useQuery } from "@tanstack/react-query";

import { api, type RawCandidate, type RawTicketResult } from "@/lib/api";

/** How often the gate re-checks while the dialog sits open. Live deep markets
 *  move inside this window, which is the point: the operator watches the net %
 *  and the blocks change under the cursor instead of confirming a snapshot. */
const GATE_REFRESH_MS = 3_000;

export interface ExecGate {
  /** the executor's view of THIS arb, or null when it is no longer in the
   *  open set (closed, superseded, or pushed out of the fetch window) */
  candidate: RawCandidate | null;
  dryRun: boolean;
  killed: boolean;
  routable: string[];
  isLoading: boolean;
  error: Error | null;
  /** reasons this cannot be placed; empty = clear to arm */
  blocks: string[];
}

export function useExecGate(
  arbKey: string | null,
  capital: number,
  open: boolean,
): ExecGate {
  const q = useQuery({
    // capital is in the key on purpose: the stake preview is derived from it,
    // so a capital change must refetch rather than show stale numbers.
    queryKey: ["exec", "candidates", capital],
    queryFn: () => api.exec.candidates(100, capital),
    enabled: open,
    refetchInterval: open ? GATE_REFRESH_MS : false,
    staleTime: 0,
    gcTime: 0,
  });

  const data = q.data;
  const candidate =
    (arbKey && data?.candidates.find((c) => c.arb_key === arbKey)) || null;

  const blocks: string[] = [];
  if (data) {
    if (data.killed) blocks.push("execution is disarmed (kill switch)");
    if (!candidate) {
      blocks.push(
        "this arb is no longer in the executor's open set — it has closed, " +
          "been superseded, or its edge stopped re-confirming",
      );
    } else {
      blocks.push(...candidate.blocks);
    }
  }

  return {
    candidate,
    // Unknown reads as REAL MONEY, never as a dry run. The banner built on
    // this is a warning, and a warning that fails silent is worse than no
    // warning: the operator sees the reassuring message precisely when the
    // server did not say anything.
    dryRun: data?.dry_run ?? false,
    killed: data?.killed ?? false,
    routable: data?.routable ?? [],
    isLoading: q.isLoading,
    error: (q.error as Error) ?? null,
    blocks,
  };
}

/** POST /api/exec/ticket — mint + two-phase commit, in one round trip.
 *
 *  No retry, ever. The idem_key makes a retried PLACEMENT safe at the node,
 *  but a retried TICKET is a second ticket: new idem keys, new money. */
export function usePlaceTicket() {
  return useMutation<
    RawTicketResult,
    Error,
    {
      arb_key: string;
      opportunity_id: number | null;
      legs: RawCandidate["legs"];
      capital: number;
      flags: string[];
    }
  >({
    mutationFn: (body) => api.exec.ticket(body),
    retry: false,
  });
}
