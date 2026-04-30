import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { profitSeries } from "@/lib/mock-data";

const config = {
  profit: { label: "Profit", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function ProfitChart() {
  const total = profitSeries.reduce((acc, p) => acc + p.profit, 0);

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold">30-Day Profitability</h3>
          <p className="text-xs text-muted-foreground">
            Cumulative arbitrage profit
          </p>
        </div>
        <div className="text-right">
          <div className="text-xl font-semibold tabular-nums text-primary">
            ${total.toLocaleString("en-US")}
          </div>
          <div className="text-[11px] text-muted-foreground">last 30 days</div>
        </div>
      </div>

      <div className="mt-2 flex-1">
        <ChartContainer config={config} className="h-[180px] w-full">
          <AreaChart
            data={profitSeries}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-profit)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-profit)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              interval={4}
            />
            <YAxis hide />
            <ChartTooltip
              cursor={{ stroke: "var(--primary)", strokeOpacity: 0.3 }}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="var(--color-profit)"
              strokeWidth={2}
              fill="url(#profitFill)"
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}
