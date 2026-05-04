import { useEffect, useState } from "react";
import { Lock, Wallet, Sparkles, Pencil, Check } from "lucide-react";
import { useCapital } from "@/hooks/useCapital";
import { useStats } from "@/hooks/useStats";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function fmt(n: number) {
  return `TSh ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function BankrollAllocation() {
  const { capital, set } = useCapital();
  const { data: stats } = useStats(24);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string>(String(capital));

  useEffect(() => {
    setDraft(String(capital));
  }, [capital]);

  // "Locked" = sum of stake_amount across all currently-active arbs (one
  // capital allocation can be deployed across many arbs simultaneously).
  // The backend `total_staked` per book sums all leg stakes — for a single
  // arb, total stake equals capital. We approximate locked as
  // active_arbs * capital, capped at total bankroll.
  const activeArbs = stats?.summary.active_arbs ?? 0;
  const locked = Math.min(activeArbs * capital, capital * 10); // sanity cap
  const total = Math.max(capital, locked);
  const lockedPct = total > 0 ? (locked / total) * 100 : 0;
  const availablePct = 100 - lockedPct;

  const commit = () => {
    const n = parseFloat(draft);
    if (!Number.isNaN(n) && n > 0) {
      set(n);
    }
    setEditing(false);
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--chart-1) 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--chart-5) 0%, transparent 70%)" }}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold">Bankroll (Flex Capital)</h3>
          <p className="text-xs text-muted-foreground">
            Stakes across all arbs are rescaled to this number
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur">
          <Sparkles className="h-3 w-3 text-primary" />
          LIVE
        </span>
      </div>

      <div className="relative mt-4 flex items-baseline gap-2">
        {editing ? (
          <div className="flex items-center gap-2">
            <Input
              autoFocus
              type="number"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") setEditing(false);
              }}
              className="w-32 text-2xl"
            />
            <Button size="icon" variant="ghost" onClick={commit}>
              <Check className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <span className="bg-gradient-to-r from-primary to-[var(--chart-5)] bg-clip-text text-4xl font-bold tracking-tight tabular-nums text-transparent">
              {fmt(capital)}
            </span>
            <Button size="icon" variant="ghost" onClick={() => setEditing(true)}>
              <Pencil className="h-3 w-3" />
            </Button>
          </>
        )}
      </div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
        Per-arb capital
      </p>

      <div className="relative mt-5">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="relative h-full transition-all"
            style={{
              width: `${lockedPct}%`,
              background: "linear-gradient(90deg, var(--chart-3), var(--chart-4))",
            }}
          >
            <div className="absolute inset-0 animate-pulse bg-white/10" />
          </div>
          <div
            className="h-full transition-all"
            style={{
              width: `${availablePct}%`,
              background: "linear-gradient(90deg, var(--chart-1), var(--chart-5))",
            }}
          />
        </div>
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-background/40 p-3 backdrop-blur">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
            <Lock className="h-3 w-3" style={{ color: "var(--chart-3)" }} />
            Active Arbs
          </div>
          <div className="mt-1 text-lg font-semibold tabular-nums">{activeArbs}</div>
          <div className="text-[11px] text-muted-foreground tabular-nums">
            {lockedPct.toFixed(1)}% locked
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background/40 p-3 backdrop-blur">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
            <Wallet className="h-3 w-3" style={{ color: "var(--chart-1)" }} />
            Available Capital
          </div>
          <div className="mt-1 text-lg font-semibold tabular-nums">{fmt(capital)}</div>
          <div className="text-[11px] text-muted-foreground tabular-nums">
            {availablePct.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}
