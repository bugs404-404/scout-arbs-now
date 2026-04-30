import { createFileRoute } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";

export const Route = createFileRoute("/bookmakers")({
  head: () => ({
    meta: [
      { title: "Bookmakers — ArbScout" },
      {
        name: "description",
        content:
          "Manage your connected bookmakers, balances and account health.",
      },
    ],
  }),
  component: BookmakersPage,
});

function BookmakersPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bookmakers</h1>
        <p className="text-sm text-muted-foreground">
          Connect, manage and monitor your bookmaker accounts.
        </p>
      </div>
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Briefcase className="h-5 w-5" />
        </div>
        <p className="mt-3 text-sm font-medium">Coming soon</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          Account management and balance sync are on the way.
        </p>
      </div>
    </div>
  );
}
