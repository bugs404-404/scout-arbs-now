import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useHistory } from "@/hooks/useHistory";
import { fmtMoney } from "@/lib/format";

const config = {
  cumulative: { label: "Cumulative profit", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function ProfitChart() {
  const { data, isLoading } = useHistory(30);
  const series = (data ?? []).map((d) => ({
    day: d.date.slice(5),       // MM-DD
    cumulative: d.cumulative,
    arbs: d.arb_count,
  }));
  const total = series.length > 0 ? series[series.length - 1].cumulative : 0;

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold">30-Day Profitability</h3>
          <p className="text-xs text-muted-foreground">
            {isLoading ? "Loading…" : "Cumulative arbitrage profit"}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xl font-semibold tabular-nums text-primary">
            {fmtMoney(total)}
          </div>
          <div className="text-[11px] text-muted-foreground">last 30 days</div>
        </div>
      </div>

      <div className="mt-2 flex-1">
        <ChartContainer config={config} className="h-[180px] w-full">
          <AreaChart
            data={series}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-cumulative)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--color-cumulative)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              interval={Math.max(0, Math.floor(series.length / 6))}
            />
            <YAxis hide />
            <ChartTooltip
              cursor={{ stroke: "var(--primary)", strokeOpacity: 0.3 }}
              content={<ChartTooltipContent indicator="line" />}
            />
            <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="2 2" />
            <Area
              type="linear"
              dataKey="cumulative"
              stroke="var(--color-cumulative)"
              strokeWidth={2}
              fill="url(#profitFill)"
              dot={{ r: 2.5, fill: "var(--color-cumulative)", strokeWidth: 0 }}
              activeDot={{ r: 4, fill: "var(--color-cumulative)" }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
        {!isLoading && series.length === 0 && (
          <div className="mt-4 text-center text-xs text-muted-foreground">
            No arbs detected in the last 30 days yet.
          </div>
        )}
      </div>
    </div>
  );
}
