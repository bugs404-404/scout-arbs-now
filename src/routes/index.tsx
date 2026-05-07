import { createFileRoute } from "@tanstack/react-router";

import { ConnectivityBanner } from "@/components/dashboard/connectivity-banner";
import { BankrollAllocation } from "@/components/dashboard/bankroll-allocation";
import { TodaysMetrics } from "@/components/dashboard/todays-metrics";
import { ProfitChart } from "@/components/dashboard/profit-chart";
import { LiveArbsTable } from "@/components/dashboard/live-arbs-table";
import { DailyPerformanceCard } from "@/components/dashboard/daily-performance-card";
import { AutoBetToggle } from "@/components/dashboard/auto-bet-toggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — ArbScout" },
      {
        name: "description",
        content:
          "Overview of your arbitrage performance: bankroll distribution, daily metrics, 30-day profit trend and live opportunities.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          A snapshot of your arbitrage activity across all connected
          bookmakers.
        </p>
      </div>

      <ConnectivityBanner />

      <AutoBetToggle />

      <div className="grid gap-5 lg:grid-cols-3">
        <BankrollAllocation />
        <TodaysMetrics />
        <ProfitChart />
      </div>

      <DailyPerformanceCard />

      <LiveArbsTable />
    </div>
  );
}
