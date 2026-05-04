import { useMemo, useRef, useState } from "react";
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
import { toast } from "sonner";
import { useStats } from "@/hooks/useStats";
import { useArbs } from "@/hooks/useArbs";
import { useHistory } from "@/hooks/useHistory";
import { useBookmakers } from "@/hooks/useBookmakers";
import { fmtMoney } from "@/lib/format";
import { DailyRecapDialog } from "./daily-recap-dialog";

export function DailyPerformanceCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const { data: stats } = useStats(24);
  const { arbs } = useArbs({ hours: 24, limit: 200 });
  const { data: history } = useHistory(7);
  const { data: books } = useBookmakers(24);

  // 24h headline
  const netProfit = stats?.summary.total_potential_profit ?? 0;
  const turnover = (stats?.summary.total_arbs ?? 0) * (stats?.summary.capital ?? 0);
  const betsPlaced = stats?.summary.total_arbs ?? 0;
  const avgMarginPct = stats?.summary.avg_margin_pct ?? 0;
  const isPositive = netProfit >= 0;

  // Intraday: bucket arb count + sum profit by hour-of-day from /api/arbs
  const intraday = useMemo(() => {
    const byHour = new Map<number, number>();
    for (const a of arbs) {
      const h = new Date(a.detectedAt).getHours();
      byHour.set(h, (byHour.get(h) ?? 0) + a.profitAbs);
    }
    return Array.from({ length: 24 }, (_, h) => ({
      hour: `${h.toString().padStart(2, "0")}h`,
      profit: Math.round(byHour.get(h) ?? 0),
    }));
  }, [arbs]);

  // Last 7 days from /api/history
  const last7 = useMemo(() => {
    return (history ?? []).slice(-7).map((d) => ({
      day: d.date.slice(5),
      delta: d.potential_profit,
    }));
  }, [history]);

  // Best arb today
  const bestArb = useMemo(() => {
    if (!arbs.length) return null;
    return [...arbs].sort((a, b) => b.arbPercent - a.arbPercent)[0];
  }, [arbs]);

  // Top bookmaker by participation
  const topBook = useMemo(() => {
    if (!books?.length) return null;
    return [...books].sort((a, b) => b.arb_count - a.arb_count)[0];
  }, [books]);
  const totalArbCount = (books ?? []).reduce((s, b) => s + b.arb_count, 0);

  const dateLabel = new Date().toISOString().slice(0, 10);

  const handleShare = async () => {
    const text = `📈 ArbScout Daily Recap — ${dateLabel}
Net P&L: ${fmtMoney(netProfit)} (avg ${avgMarginPct.toFixed(2)}% margin)
Turnover: ${fmtMoney(turnover)}
Arbs detected: ${betsPlaced}${
      bestArb ? `\nBest arb: ${bestArb.event} (${bestArb.arbPercent.toFixed(2)}%)` : ""
    }`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "ArbScout Daily Recap", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Recap copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch { /* user cancelled */ }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Shareable link copied");
  };

  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden rounded-xl border border-border bg-card p-5 sm:p-6"
    >
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
            <Badge variant="secondary" className="rounded-full px-2 py-0 text-[10px] font-medium">
              {dateLabel}
            </Badge>
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Today's Recap</h2>
          <p className="text-sm text-muted-foreground">
            Trader-grade snapshot of your arbitrage day.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="hidden sm:inline">Copy link</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <DailyRecapDialog />
        </div>
      </div>

      {/* Headline P&L */}
      <div className="relative mt-5 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col justify-between rounded-lg border border-border/60 bg-background/40 p-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Potential P&L (24h)
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span
                className="text-4xl font-semibold tabular-nums"
                style={{ color: isPositive ? "var(--chart-2)" : "var(--destructive)" }}
              >
                {isPositive ? "+" : ""}
                {fmtMoney(netProfit)}
              </span>
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  isPositive ? "text-[color:var(--chart-2)]" : "text-destructive"
                }`}
              >
                {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {avgMarginPct.toFixed(2)}% avg margin
              </span>
            </div>
          </div>

          <div className="mt-4 h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={intraday} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
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
                  formatter={(value: number) => [fmtMoney(value), "Profit"]}
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

        <div className="rounded-lg border border-border/60 bg-background/40 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Last 7 days P&L
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Daily potential profit
              </div>
            </div>
            <Trophy className="h-4 w-4 text-[color:var(--warning)]" />
          </div>
          <div className="mt-3 h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
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
                  formatter={(value: number) => [fmtMoney(value), "Δ P&L"]}
                />
                <Bar dataKey="delta" radius={[4, 4, 0, 0]}>
                  {last7.map((d, i) => (
                    <Cell key={i} fill={d.delta >= 0 ? "var(--chart-2)" : "var(--destructive)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPI label="Turnover (capital × arbs)" value={fmtMoney(turnover)} />
        <KPI label="Arbs detected" value={betsPlaced.toString()} />
        <KPI label="Avg margin" value={`${avgMarginPct.toFixed(2)}%`} />
        <KPI label="Active books" value={(books?.length ?? 0).toString()} />
      </div>

      {/* Highlights */}
      <div className="relative mt-5 grid gap-3 md:grid-cols-2">
        <Highlight
          icon={<Target className="h-4 w-4 text-[color:var(--chart-2)]" />}
          title="Best arb"
          subtitle={bestArb ? bestArb.event : "—"}
          metric={bestArb ? `+${bestArb.arbPercent.toFixed(2)}%` : "—"}
          metricSub={bestArb ? `${fmtMoney(bestArb.profitAbs)} profit` : "no arbs yet"}
          tone="positive"
        />
        <Highlight
          icon={<Trophy className="h-4 w-4 text-primary" />}
          title="Top bookmaker"
          subtitle={topBook?.book_id ?? "—"}
          metric={
            topBook && totalArbCount > 0
              ? `${Math.round((topBook.arb_count / totalArbCount) * 100)}%`
              : "—"
          }
          metricSub={topBook ? `${topBook.arb_count} arbs participated` : "no data"}
          tone="neutral"
        />
      </div>

      {/* Footer */}
      <div className="relative mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        <span>Generated by ArbScout • Live from API</span>
        <DailyRecapDialog
          trigger={
            <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" />
              Export ticket
            </Button>
          }
        />
      </div>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
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
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{title}</div>
          <div className="text-sm font-medium">{subtitle}</div>
        </div>
      </div>
      <div className="text-right">
        <div
          className="text-base font-semibold tabular-nums"
          style={{ color: tone === "positive" ? "var(--chart-2)" : "var(--foreground)" }}
        >
          {metric}
        </div>
        <div className="text-[11px] text-muted-foreground">{metricSub}</div>
      </div>
    </div>
  );
}
