import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, ExternalLink, Layers, MapPin, Trophy } from "lucide-react";
import type { ArbOpportunity } from "@/lib/mock-data";
import type { UiArb, UiLeg } from "@/lib/transform";
import { fmtMoney } from "@/lib/format";

interface Props {
  arb: ArbOpportunity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function isUiArb(a: ArbOpportunity | null): a is UiArb {
  return !!a && Array.isArray((a as UiArb).legs);
}

export function ArbCalculatorDialog({ arb, open, onOpenChange }: Props) {
  // Default to the arb's own suggestedStake (= flex capital from backend)
  const [total, setTotal] = useState<number>(arb?.suggestedStake ?? 100);

  useEffect(() => {
    if (arb) setTotal(arb.suggestedStake);
  }, [arb]);

  /**
   * Recompute per-leg stakes when the operator changes total stake.
   * For an N-leg arb with implied probability vector (1/odds_i),
   *   stake_i = total / (odds_i * sum_implied)
   * yields the same payout regardless of which leg wins.
   */
  const computedLegs = useMemo(() => {
    if (!isUiArb(arb) || arb.legs.length === 0) return null;
    const legs = arb.legs;
    const sumImplied = legs.reduce((s, l) => s + 1 / Math.max(l.odds, 1e-9), 0);
    return legs.map((l) => {
      const stake = total / (l.odds * sumImplied);
      const payout = stake * l.odds;
      return { ...l, stake, payout };
    });
  }, [arb, total]);

  const summary = useMemo(() => {
    if (!computedLegs || computedLegs.length === 0) return null;
    // Worst-case payout per state == min across legs (since each leg covers
    // disjoint states in a partition arb, payout per state IS leg.payout).
    const payouts = computedLegs.map((l) => l.payout);
    const minPayout = Math.min(...payouts);
    const profit = minPayout - total;
    const roi = total > 0 ? (profit / total) * 100 : 0;
    return { minPayout, profit, roi };
  }, [computedLegs, total]);

  if (!arb) return null;

  const ui = arb as UiArb;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{arb.event}</span>
            <Badge
              variant="outline"
              className={
                arb.status === "In-Play"
                  ? "border-destructive/40 text-destructive"
                  : "border-border text-muted-foreground"
              }
            >
              {arb.status === "In-Play" && (
                <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" />
              )}
              {arb.status}
            </Badge>
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <span className="inline-flex items-center gap-1">
              <Layers className="h-3 w-3" /> {arb.market}
            </span>
            {isUiArb(arb) && ui.league && (
              <span className="inline-flex items-center gap-1">
                <Trophy className="h-3 w-3" /> {ui.league}
              </span>
            )}
            {isUiArb(arb) && ui.country && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {ui.country}
              </span>
            )}
            {isUiArb(arb) && ui.startTime && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(ui.startTime).toLocaleString()}
              </span>
            )}
            <span className="inline-flex items-center gap-1 font-mono font-semibold text-primary">
              <Activity className="h-3 w-3" /> {arb.arbPercent.toFixed(3)}%
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="total-stake" className="text-xs uppercase tracking-wider text-muted-foreground">
              Total stake (per-arb capital)
            </Label>
            <Input
              id="total-stake"
              type="number"
              min={0}
              step={50}
              value={total}
              onChange={(e) => setTotal(Number(e.target.value) || 0)}
              className="mt-1.5"
            />
          </div>

          {/* Full leg breakdown — one row per book + outcome + line.
              For Engine B/C arbs there can be 3-5 legs, each with its own
              outcome label. Now displays "Over 2.5" / "Handicap -1.5 (Home)"
              because the backend appends line to outcome_raw in arb_detector. */}
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {computedLegs?.length ?? 0}-leg breakdown
            </div>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Book</th>
                    <th className="px-3 py-2 text-left">Market</th>
                    <th className="px-3 py-2 text-left">Outcome</th>
                    <th className="px-3 py-2 text-right">Odds</th>
                    <th className="px-3 py-2 text-right">Stake</th>
                    <th className="px-3 py-2 text-right">Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {computedLegs?.map((l, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="px-3 py-2">
                        <span className="rounded-md border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-xs uppercase text-primary">
                          {l.bookId}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground" title={l.market}>
                        {l.market}
                      </td>
                      <td className="px-3 py-2 font-medium" title={l.outcome}>
                        {l.outcome}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums">
                        {l.odds.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {fmtMoney(l.stake, { dp: 2 })}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-success">
                        {fmtMoney(l.payout, { dp: 2 })}
                      </td>
                    </tr>
                  ))}
                  {(!computedLegs || computedLegs.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-xs text-muted-foreground">
                        No leg detail available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Guaranteed payout
                </div>
                <div className="mt-1 font-semibold tabular-nums">
                  {summary ? fmtMoney(summary.minPayout) : "—"}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Profit
                </div>
                <div className="mt-1 font-semibold tabular-nums text-primary">
                  {summary ? fmtMoney(summary.profit) : "—"}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  ROI
                </div>
                <div className="mt-1 font-semibold tabular-nums text-primary">
                  {summary ? `${summary.roi.toFixed(2)}%` : "—"}
                </div>
              </div>
            </div>
          </div>

          {isUiArb(arb) && (
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span>Detected: {new Date(ui.detectedAt).toLocaleTimeString()}</span>
              <span>·</span>
              <span>Expires: {new Date(ui.expiresAt).toLocaleTimeString()}</span>
              {ui.eventId && (
                <>
                  <span>·</span>
                  <span className="font-mono">
                    <ExternalLink className="inline h-3 w-3" /> event #{ui.eventId}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
