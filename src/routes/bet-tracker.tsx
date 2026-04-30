import { createFileRoute } from "@tanstack/react-router";
import { List } from "lucide-react";

export const Route = createFileRoute("/bet-tracker")({
  head: () => ({
    meta: [
      { title: "Bet Tracker — ArbScout" },
      {
        name: "description",
        content: "Log and review every bet you've placed across all books.",
      },
    ],
  }),
  component: BetTrackerPage,
});

function BetTrackerPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bet Tracker</h1>
        <p className="text-sm text-muted-foreground">
          A unified ledger of every bet across your bookmakers.
        </p>
      </div>
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <List className="h-5 w-5" />
        </div>
        <p className="mt-3 text-sm font-medium">Coming soon</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          Bet history and P/L analytics will live here.
        </p>
      </div>
    </div>
  );
}
