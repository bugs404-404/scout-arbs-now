import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "lucide-react";

export const Route = createFileRoute("/calculators")({
  head: () => ({
    meta: [
      { title: "Calculators — ArbScout" },
      {
        name: "description",
        content:
          "Stake calculators for arbitrage, dutching, hedging and value bets.",
      },
    ],
  }),
  component: CalculatorsPage,
});

function CalculatorsPage() {
  return <PlaceholderPage title="Calculators" icon={Calculator} description="Stake, hedge and dutching calculators are coming soon." />;
}

function PlaceholderPage({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: typeof Calculator;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <p className="mt-3 text-sm font-medium">Coming soon</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          We're building this section. Check back shortly.
        </p>
      </div>
    </div>
  );
}
