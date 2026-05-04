import { ArrowUpRight, DollarSign, TrendingUp, Activity } from "lucide-react";
import { useStats } from "@/hooks/useStats";

function fmt(n: number) {
  return `TSh ${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function Stat({
  label,
  value,
  delta,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta: number | null;
  icon: typeof DollarSign;
}) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </div>
        <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
      </div>
      {delta !== null && (
        <span className="inline-flex items-center gap-0.5 rounded-md bg-success/15 px-1.5 py-0.5 text-[11px] font-medium text-success">
          <ArrowUpRight className="h-3 w-3" />
          {delta.toFixed(2)}%
        </span>
      )}
    </div>
  );
}

export function TodaysMetrics() {
  const { data, isLoading } = useStats(24);
  const summary = data?.summary;

  // Backend doesn't track "delta vs yesterday" yet — surface raw counts
  // (deltas can be added later via a new /api/stats/compare endpoint).
  const arbProfit = summary?.total_potential_profit ?? 0;
  const totalArbs = summary?.total_arbs ?? 0;
  const lastHour = summary?.last_hour ?? 0;
  const avgMarginPct = summary?.avg_margin_pct ?? 0;

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5">
      <div>
        <h3 className="text-sm font-semibold">Today's Metrics</h3>
        <p className="text-xs text-muted-foreground">
          {isLoading ? "Loading…" : "Activity in the last 24 hours"}
        </p>
      </div>

      <div className="mt-5 flex flex-1 flex-col justify-around gap-5">
        <Stat
          label="Potential Arb Profit (24h)"
          value={fmt(arbProfit)}
          delta={null}
          icon={DollarSign}
        />
        <div className="h-px bg-border" />
        <Stat
          label={`Arbs Detected (24h, last hr ${lastHour})`}
          value={String(totalArbs)}
          delta={null}
          icon={TrendingUp}
        />
        <div className="h-px bg-border" />
        <Stat
          label="Avg Margin %"
          value={`${avgMarginPct.toFixed(3)}%`}
          delta={null}
          icon={Activity}
        />
      </div>
    </div>
  );
}
