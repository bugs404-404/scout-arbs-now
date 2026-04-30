import { Pie, PieChart, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { bankroll } from "@/lib/mock-data";

const data = [
  { key: "locked", label: "Locked in bets", value: bankroll.locked },
  { key: "available", label: "Available", value: bankroll.available },
];

const config = {
  locked: { label: "Locked in bets", color: "var(--chart-3)" },
  available: { label: "Available", color: "var(--chart-1)" },
} satisfies ChartConfig;

function fmt(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

export function BankrollDonut() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5">
      <div>
        <h3 className="text-sm font-semibold">Bankroll Distribution</h3>
        <p className="text-xs text-muted-foreground">
          Funds locked vs available liquidity
        </p>
      </div>

      <div className="relative mt-2 flex items-center justify-center">
        <ChartContainer config={config} className="h-[180px] w-full">
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent hideLabel nameKey="label" />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={55}
              outerRadius={80}
              strokeWidth={2}
              stroke="var(--card)"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={
                    entry.key === "locked"
                      ? "var(--color-locked)"
                      : "var(--color-available)"
                  }
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Total
          </span>
          <span className="text-lg font-semibold tabular-nums">
            {fmt(bankroll.total)}
          </span>
        </div>
      </div>

      <ul className="mt-3 space-y-1.5">
        {data.map((d) => (
          <li
            key={d.key}
            className="flex items-center justify-between text-xs"
          >
            <span className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background:
                    d.key === "locked"
                      ? "var(--chart-3)"
                      : "var(--chart-1)",
                }}
              />
              <span className="text-muted-foreground">{d.label}</span>
            </span>
            <span className="font-medium tabular-nums">{fmt(d.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
