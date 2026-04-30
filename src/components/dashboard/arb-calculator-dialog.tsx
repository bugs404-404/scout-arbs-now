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
import type { ArbOpportunity } from "@/lib/mock-data";

interface Props {
  arb: ArbOpportunity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function fmt(n: number) {
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function ArbCalculatorDialog({ arb, open, onOpenChange }: Props) {
  const [total, setTotal] = useState<number>(arb?.suggestedStake ?? 1000);

  useEffect(() => {
    if (arb) setTotal(arb.suggestedStake);
  }, [arb]);

  const result = useMemo(() => {
    if (!arb) return null;
    const o1 = arb.book1.odds;
    const o2 = arb.book2.odds;
    // implied probabilities
    const sum = 1 / o1 + 1 / o2;
    const stake1 = (total / o1) / sum;
    const stake2 = (total / o2) / sum;
    const payout = stake1 * o1; // equals stake2 * o2
    const profit = payout - total;
    const roi = (profit / total) * 100;
    return { stake1, stake2, payout, profit, roi };
  }, [arb, total]);

  if (!arb) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Arbitrage Calculator</DialogTitle>
          <DialogDescription>
            {arb.event} — {arb.market}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="total-stake">Total stake</Label>
            <Input
              id="total-stake"
              type="number"
              min={0}
              value={total}
              onChange={(e) => setTotal(Number(e.target.value) || 0)}
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {arb.book1.name}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Odds {arb.book1.odds.toFixed(2)}
              </div>
              <div className="mt-2 text-lg font-semibold tabular-nums">
                {result ? fmt(result.stake1) : "—"}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {arb.book2.name}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Odds {arb.book2.odds.toFixed(2)}
              </div>
              <div className="mt-2 text-lg font-semibold tabular-nums">
                {result ? fmt(result.stake2) : "—"}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Guaranteed profit
              </span>
              <span className="text-lg font-semibold tabular-nums text-primary">
                {result ? fmt(result.profit) : "—"}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">ROI</span>
              <span className="text-sm font-medium tabular-nums text-primary">
                {result ? `${result.roi.toFixed(2)}%` : "—"}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button>Place bet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
