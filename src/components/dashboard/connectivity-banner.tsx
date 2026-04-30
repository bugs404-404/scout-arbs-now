import { Plug, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConnectivityBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 md:p-5">
      <div
        className="absolute inset-y-0 left-0 w-1 bg-primary"
        aria-hidden="true"
      />
      <div className="flex flex-col gap-3 pl-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Plug className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Main Account Active</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success">
                <CheckCircle2 className="h-3 w-3" />
                Connected
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground md:text-sm">
              Connect more bookmakers to surface more arbitrage opportunities.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            Manage
          </Button>
          <Button size="sm">Connect bookmaker</Button>
        </div>
      </div>
    </div>
  );
}
