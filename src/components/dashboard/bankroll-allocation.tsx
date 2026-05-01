import { Lock, Wallet, TrendingUp, Sparkles } from "lucide-react";
import { bankroll, todaysMetrics } from "@/lib/mock-data";

function fmt(n: number) {
  return `TSh ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function BankrollAllocation() {
  const lockedPct = (bankroll.locked / bankroll.total) * 100;
  const availablePct = 100 - lockedPct;

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-5">
      {/* Glow background */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--chart-1) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--chart-5) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold">Bankroll</h3>
          <p className="text-xs text-muted-foreground">
            Live allocation across books
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur">
          <Sparkles className="h-3 w-3 text-primary" />
          LIVE
        </span>
      </div>

      <div className="relative mt-4">
        <div className="flex items-baseline gap-2">
          <span
            className="bg-gradient-to-r from-primary to-[var(--chart-5)] bg-clip-text text-4xl font-bold tracking-tight tabular-nums text-transparent"
          >
            {fmt(bankroll.total)}
          </span>
          <span className="inline-flex items-center gap-0.5 text-xs font-medium text-success">
            <TrendingUp className="h-3 w-3" />
            +{todaysMetrics.bankroll24hDelta.toFixed(2)}%
          </span>
        </div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Total bankroll
        </p>
      </div>

      {/* Stacked bar */}
      <div className="relative mt-5">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="relative h-full transition-all"
            style={{
              width: `${lockedPct}%`,
              background:
                "linear-gradient(90deg, var(--chart-3), var(--chart-4))",
            }}
          >
            <div className="absolute inset-0 animate-pulse bg-white/10" />
          </div>
          <div
            className="h-full transition-all"
            style={{
              width: `${availablePct}%`,
              background:
                "linear-gradient(90deg, var(--chart-1), var(--chart-5))",
            }}
          />
        </div>
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-background/40 p-3 backdrop-blur">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
            <Lock className="h-3 w-3" style={{ color: "var(--chart-3)" }} />
            Locked
          </div>
          <div className="mt-1 text-lg font-semibold tabular-nums">
            {fmt(bankroll.locked)}
          </div>
          <div className="text-[11px] text-muted-foreground tabular-nums">
            {lockedPct.toFixed(1)}%
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background/40 p-3 backdrop-blur">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
            <Wallet className="h-3 w-3" style={{ color: "var(--chart-1)" }} />
            Available
          </div>
          <div className="mt-1 text-lg font-semibold tabular-nums">
            {fmt(bankroll.available)}
          </div>
          <div className="text-[11px] text-muted-foreground tabular-nums">
            {availablePct.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}
