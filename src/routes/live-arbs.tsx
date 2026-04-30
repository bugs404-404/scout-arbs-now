import { createFileRoute } from "@tanstack/react-router";
import { LiveArbsTable } from "@/components/dashboard/live-arbs-table";

export const Route = createFileRoute("/live-arbs")({
  head: () => ({
    meta: [
      { title: "Live Arbs — ArbScout" },
      {
        name: "description",
        content:
          "All live arbitrage opportunities across your connected bookmakers.",
      },
    ],
  }),
  component: LiveArbsPage,
});

function LiveArbsPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Live Arbs</h1>
        <p className="text-sm text-muted-foreground">
          Every arbitrage opportunity we're currently tracking.
        </p>
      </div>
      <LiveArbsTable />
    </div>
  );
}
