import { ArrowUpRight, DollarSign, TrendingUp } from "lucide-react";
import { todaysMetrics } from "@/lib/mock-data";

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
  delta: number;
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
      <span className="inline-flex items-center gap-0.5 rounded-md bg-success/15 px-1.5 py-0.5 text-[11px] font-medium text-success">
        <ArrowUpRight className="h-3 w-3" />
        {delta.toFixed(2)}%
      </span>
    </div>
  );
}

export function TodaysMetrics() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5">
      <div>
        <h3 className="text-sm font-semibold">Today's Metrics</h3>
        <p className="text-xs text-muted-foreground">
          Activity in the last 24 hours
        </p>
      </div>

      <div className="mt-5 flex flex-1 flex-col justify-around gap-5">
        <Stat
          label="Total Turnover"
          value={fmt(todaysMetrics.turnover)}
          delta={todaysMetrics.turnoverDelta}
          icon={DollarSign}
        />
        <div className="h-px bg-border" />
        <Stat
          label="Arbitrage Profit"
          value={fmt(todaysMetrics.arbProfit)}
          delta={todaysMetrics.arbProfitDelta}
          icon={TrendingUp}
        />
      </div>
    </div>
  );
}
