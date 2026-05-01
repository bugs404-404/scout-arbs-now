import { useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Share2,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { dailyPerformance, intradaySeries, profitSeries } from "@/lib/mock-data";
import { toast } from "sonner";

function formatUSD(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function DailyPerformanceCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const last7 = profitSeries.slice(-7).map((p, i) => ({
    day: `D${24 + i}`,
    delta: p.delta,
  }));

  const handleShare = async () => {
    const text = `📈 ArbScout Daily Recap — ${dailyPerformance.date}
Net P&L: ${formatUSD(dailyPerformance.netProfit)} (+${dailyPerformance.roi}% ROI)
Turnover: ${formatUSD(dailyPerformance.turnover)}
Bets: ${dailyPerformance.betsPlaced} • Win-rate: ${dailyPerformance.winRate}%
Best arb: ${dailyPerformance.bestArb.event} (${dailyPerformance.bestArb.percent}%)`;

    try {
      if (navigator.share) {
        await navigator.share({ title: "ArbScout Daily Recap", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Recap copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // user cancelled
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Shareable link copied");
  };

  const isPositive = dailyPerformance.netProfit >= 0;

  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden rounded-xl border border-border bg-card p-5 sm:p-6"
    >
      {/* Glow accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--primary)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--chart-2)" }}
      />

      {/* Header */}
      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Daily Performance
            </span>
            <Badge
              variant="secondary"
              className="rounded-full px-2 py-0 text-[10px] font-medium"
            >
              {dailyPerformance.date}
            </Badge>
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Today's Recap
          </h2>
          <p className="text-sm text-muted-foreground">
            Trader-grade snapshot of your arbitrage day.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="hidden sm:inline">Copy link</span>
          </Button>
          <Button size="sm" onClick={handleShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Headline P&L */}
      <div className="relative mt-5 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col justify-between rounded-lg border border-border/60 bg-background/40 p-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Net P&L
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span
                className="text-4xl font-semibold tabular-nums"
                style={{ color: isPositive ? "var(--chart-2)" : "var(--destructive)" }}
              >
                {isPositive ? "+" : ""}
                {formatUSD(dailyPerformance.netProfit)}
              </span>
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  isPositive ? "text-[color:var(--chart-2)]" : "text-destructive"
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {dailyPerformance.roi}% ROI
              </span>
            </div>
          </div>

          {/* Intraday zigzag */}
          <div className="mt-4 h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={intradaySeries}
                margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  interval={2}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "var(--popover-foreground)",
                  }}
                  formatter={(value: number) => [formatUSD(value), "Profit"]}
                />
                <Line
                  type="linear"
                  dataKey="profit"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: "var(--primary)", strokeWidth: 0 }}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right column: 7-day delta bars */}
        <div className="rounded-lg border border-border/60 bg-background/40 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Last 7 days P&L
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Daily wins vs losses
              </div>
            </div>
            <Trophy className="h-4 w-4 text-[color:var(--warning)]" />
          </div>
          <div className="mt-3 h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={last7}
                margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "var(--popover-foreground)",
                  }}
                  formatter={(value: number) => [formatUSD(value), "Δ P&L"]}
                />
                <Bar dataKey="delta" radius={[4, 4, 0, 0]}>
                  {last7.map((d, i) => (
                    <Cell
                      key={i}
                      fill={
                        d.delta >= 0 ? "var(--chart-2)" : "var(--destructive)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPI label="Turnover" value={formatUSD(dailyPerformance.turnover)} />
        <KPI label="Bets placed" value={dailyPerformance.betsPlaced.toString()} />
        <KPI label="Win-rate" value={`${dailyPerformance.winRate}%`} />
        <KPI label="Active hours" value={`${dailyPerformance.hoursActive}h`} />
      </div>

      {/* Highlights */}
      <div className="relative mt-5 grid gap-3 md:grid-cols-2">
        <Highlight
          icon={<Target className="h-4 w-4 text-[color:var(--chart-2)]" />}
          title="Best arb"
          subtitle={dailyPerformance.bestArb.event}
          metric={`+${dailyPerformance.bestArb.percent}%`}
          metricSub={`${formatUSD(dailyPerformance.bestArb.profit)} profit`}
          tone="positive"
        />
        <Highlight
          icon={<Trophy className="h-4 w-4 text-primary" />}
          title="Top bookmaker"
          subtitle={dailyPerformance.topBookmaker}
          metric="42%"
          metricSub="of today's volume"
          tone="neutral"
        />
      </div>

      {/* Footer */}
      <div className="relative mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        <span>Generated by ArbScout • Shareable daily recap</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="h-7 gap-1.5 text-xs"
        >
          <Download className="h-3.5 w-3.5" />
          Export recap
        </Button>
      </div>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Highlight({
  icon,
  title,
  subtitle,
  metric,
  metricSub,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  metric: string;
  metricSub: string;
  tone: "positive" | "neutral";
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/40 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary">
          {icon}
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {title}
          </div>
          <div className="text-sm font-medium">{subtitle}</div>
        </div>
      </div>
      <div className="text-right">
        <div
          className="text-base font-semibold tabular-nums"
          style={{
            color:
              tone === "positive" ? "var(--chart-2)" : "var(--foreground)",
          }}
        >
          {metric}
        </div>
        <div className="text-[11px] text-muted-foreground">{metricSub}</div>
      </div>
    </div>
  );
}
