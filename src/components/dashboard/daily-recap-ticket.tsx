import { forwardRef } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ArrowUpRight, Sparkles, Trophy, Target, TrendingUp } from "lucide-react";
import { dailyPerformance, intradaySeries } from "@/lib/mock-data";

function formatUSD(n: number) {
  return `TSh ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

interface Props {
  /** when true, renders at fixed export dimensions (1080x1350) for crisp PNG */
  exportMode?: boolean;
}

export const DailyRecapTicket = forwardRef<HTMLDivElement, Props>(
  ({ exportMode = false }, ref) => {
    const isPositive = dailyPerformance.netProfit >= 0;
    const peak = Math.max(...intradaySeries.map((p) => p.profit));
    const trough = Math.min(...intradaySeries.map((p) => p.profit));

    return (
      <div
        ref={ref}
        className="relative overflow-hidden rounded-3xl"
        style={{
          width: exportMode ? 1080 : "100%",
          maxWidth: exportMode ? "none" : 480,
          aspectRatio: exportMode ? "auto" : "4 / 5",
          height: exportMode ? 1350 : "auto",
          background:
            "linear-gradient(160deg, oklch(0.18 0.04 240) 0%, oklch(0.12 0.03 250) 60%, oklch(0.10 0.05 260) 100%)",
          color: "white",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          padding: exportMode ? 64 : 28,
        }}
      >
        {/* glow accents */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "oklch(0.78 0.18 200)",
            opacity: 0.25,
            filter: "blur(80px)",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: -120,
            left: -80,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: isPositive ? "oklch(0.72 0.20 160)" : "oklch(0.65 0.22 25)",
            opacity: 0.2,
            filter: "blur(80px)",
          }}
        />

        {/* perforated edge dots */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "52%",
            left: -10,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "oklch(0.08 0.02 250)",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "52%",
            right: -10,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "oklch(0.08 0.02 250)",
          }}
        />

        <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: exportMode ? 44 : 32,
                  height: exportMode ? 44 : 32,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, oklch(0.85 0.18 200), oklch(0.65 0.20 220))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sparkles
                  style={{ color: "oklch(0.15 0.04 250)" }}
                  size={exportMode ? 22 : 16}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: exportMode ? 18 : 12,
                    fontWeight: 600,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    color: "oklch(0.85 0.05 220)",
                  }}
                >
                  ArbScout
                </div>
                <div
                  style={{
                    fontSize: exportMode ? 14 : 10,
                    color: "rgba(255,255,255,0.55)",
                    letterSpacing: 0.5,
                  }}
                >
                  Daily Recap Ticket
                </div>
              </div>
            </div>

            <div
              style={{
                padding: exportMode ? "10px 16px" : "6px 12px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                fontSize: exportMode ? 14 : 11,
                fontWeight: 500,
                color: "rgba(255,255,255,0.85)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {dailyPerformance.date}
            </div>
          </div>

          {/* Hero P&L */}
          <div style={{ marginTop: exportMode ? 56 : 28 }}>
            <div
              style={{
                fontSize: exportMode ? 16 : 11,
                textTransform: "uppercase",
                letterSpacing: 2,
                color: "rgba(255,255,255,0.55)",
                fontWeight: 500,
              }}
            >
              Net Profit & Loss
            </div>
            <div
              style={{
                marginTop: exportMode ? 12 : 6,
                display: "flex",
                alignItems: "baseline",
                gap: exportMode ? 16 : 10,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: exportMode ? 96 : 52,
                  fontWeight: 700,
                  letterSpacing: -2,
                  fontVariantNumeric: "tabular-nums",
                  background: isPositive
                    ? "linear-gradient(135deg, oklch(0.92 0.18 160), oklch(0.78 0.20 180))"
                    : "linear-gradient(135deg, oklch(0.80 0.20 25), oklch(0.65 0.22 15))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  lineHeight: 1,
                }}
              >
                {isPositive ? "+" : ""}
                {formatUSD(dailyPerformance.netProfit)}
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: exportMode ? "8px 14px" : "4px 10px",
                  borderRadius: 999,
                  background: isPositive
                    ? "oklch(0.30 0.10 160 / 0.4)"
                    : "oklch(0.30 0.10 25 / 0.4)",
                  border: `1px solid ${
                    isPositive ? "oklch(0.70 0.18 160 / 0.5)" : "oklch(0.70 0.18 25 / 0.5)"
                  }`,
                  color: isPositive ? "oklch(0.92 0.18 160)" : "oklch(0.80 0.20 25)",
                  fontSize: exportMode ? 18 : 13,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <ArrowUpRight size={exportMode ? 18 : 14} />
                {dailyPerformance.roi}% ROI
              </span>
            </div>
          </div>

          {/* Intraday chart */}
          <div
            style={{
              marginTop: exportMode ? 32 : 18,
              height: exportMode ? 200 : 110,
              width: "100%",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={intradaySeries}
                margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="ticketArea" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={isPositive ? "oklch(0.85 0.18 180)" : "oklch(0.75 0.20 25)"}
                      stopOpacity={0.7}
                    />
                    <stop
                      offset="100%"
                      stopColor={isPositive ? "oklch(0.85 0.18 180)" : "oklch(0.75 0.20 25)"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="linear"
                  dataKey="profit"
                  stroke={isPositive ? "oklch(0.90 0.18 180)" : "oklch(0.80 0.20 25)"}
                  strokeWidth={exportMode ? 4 : 2.5}
                  fill="url(#ticketArea)"
                  isAnimationActive={false}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Divider with dashed line (ticket stub) */}
          <div
            aria-hidden
            style={{
              marginTop: exportMode ? 32 : 18,
              borderTop: "2px dashed rgba(255,255,255,0.15)",
            }}
          />

          {/* Stats grid */}
          <div
            style={{
              marginTop: exportMode ? 32 : 18,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: exportMode ? 16 : 10,
            }}
          >
            <Stat
              label="Turnover"
              value={formatUSD(dailyPerformance.turnover)}
              exportMode={exportMode}
            />
            <Stat
              label="Bets"
              value={dailyPerformance.betsPlaced.toString()}
              exportMode={exportMode}
            />
            <Stat
              label="Win-rate"
              value={`${dailyPerformance.winRate}%`}
              exportMode={exportMode}
            />
            <Stat
              label="Active hours"
              value={`${dailyPerformance.hoursActive}h`}
              exportMode={exportMode}
            />
          </div>

          {/* Highlights */}
          <div
            style={{
              marginTop: exportMode ? 24 : 14,
              padding: exportMode ? 24 : 14,
              borderRadius: exportMode ? 20 : 14,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: exportMode ? 16 : 10 }}>
              <div
                style={{
                  width: exportMode ? 56 : 36,
                  height: exportMode ? 56 : 36,
                  borderRadius: exportMode ? 14 : 10,
                  background: "oklch(0.30 0.12 160 / 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Target
                  size={exportMode ? 26 : 18}
                  style={{ color: "oklch(0.90 0.18 160)" }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: exportMode ? 13 : 10,
                    textTransform: "uppercase",
                    letterSpacing: 1.5,
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  Best Arb
                </div>
                <div
                  style={{
                    fontSize: exportMode ? 22 : 14,
                    fontWeight: 600,
                    marginTop: 2,
                  }}
                >
                  {dailyPerformance.bestArb.event}
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: exportMode ? 28 : 18,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  color: "oklch(0.92 0.18 160)",
                }}
              >
                +{dailyPerformance.bestArb.percent}%
              </div>
              <div
                style={{
                  fontSize: exportMode ? 13 : 10,
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                {formatUSD(dailyPerformance.bestArb.profit)} profit
              </div>
            </div>
          </div>

          {/* Range chips */}
          <div
            style={{
              marginTop: exportMode ? 20 : 12,
              display: "flex",
              gap: exportMode ? 12 : 8,
              flexWrap: "wrap",
            }}
          >
            <Chip
              icon={<TrendingUp size={exportMode ? 14 : 11} />}
              label={`Peak ${formatUSD(peak)}`}
              tone="positive"
              exportMode={exportMode}
            />
            <Chip
              icon={<Trophy size={exportMode ? 14 : 11} />}
              label={`Top book: ${dailyPerformance.topBookmaker}`}
              tone="neutral"
              exportMode={exportMode}
            />
            <Chip
              label={`Drawdown ${formatUSD(trough)}`}
              tone="muted"
              exportMode={exportMode}
            />
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: "auto",
              paddingTop: exportMode ? 32 : 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: exportMode ? 13 : 10,
              color: "rgba(255,255,255,0.45)",
              letterSpacing: 0.5,
            }}
          >
            <span>arbscout.app</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
              #AS-{dailyPerformance.date.replace(/-/g, "")}
            </span>
          </div>
        </div>
      </div>
    );
  },
);

DailyRecapTicket.displayName = "DailyRecapTicket";

function Stat({
  label,
  value,
  exportMode,
}: {
  label: string;
  value: string;
  exportMode: boolean;
}) {
  return (
    <div
      style={{
        padding: exportMode ? 20 : 12,
        borderRadius: exportMode ? 16 : 12,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          fontSize: exportMode ? 13 : 10,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          color: "rgba(255,255,255,0.55)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: exportMode ? 6 : 3,
          fontSize: exportMode ? 28 : 18,
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Chip({
  icon,
  label,
  tone,
  exportMode,
}: {
  icon?: React.ReactNode;
  label: string;
  tone: "positive" | "neutral" | "muted";
  exportMode: boolean;
}) {
  const colors = {
    positive: {
      bg: "oklch(0.30 0.10 160 / 0.3)",
      border: "oklch(0.70 0.15 160 / 0.4)",
      fg: "oklch(0.90 0.15 160)",
    },
    neutral: {
      bg: "oklch(0.30 0.10 220 / 0.3)",
      border: "oklch(0.70 0.15 220 / 0.4)",
      fg: "oklch(0.88 0.10 220)",
    },
    muted: {
      bg: "rgba(255,255,255,0.05)",
      border: "rgba(255,255,255,0.1)",
      fg: "rgba(255,255,255,0.7)",
    },
  }[tone];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: exportMode ? "8px 14px" : "5px 10px",
        borderRadius: 999,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.fg,
        fontSize: exportMode ? 14 : 11,
        fontWeight: 500,
      }}
    >
      {icon}
      {label}
    </div>
  );
}
