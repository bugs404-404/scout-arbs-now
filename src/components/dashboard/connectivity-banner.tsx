import { Plug, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStats } from "@/hooks/useStats";
import { useArbStream } from "@/hooks/useArbStream";

export function ConnectivityBanner() {
  const { data } = useStats(24);
  const { status: ws } = useArbStream();
  const health = data?.scraper_health ?? [];

  const allOk = health.length > 0 && health.every((h) => h.status === "ok");
  const anyStale = health.some((h) => h.status === "stale");

  const overallOk = allOk && ws === "open";
  const tone = overallOk ? "primary" : anyStale ? "warning" : "destructive";

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 md:p-5">
      <div
        className={`absolute inset-y-0 left-0 w-1 bg-${tone}`}
        aria-hidden="true"
      />
      <div className="flex flex-col gap-3 pl-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-${tone}/15 text-${tone}`}>
            <Plug className="h-4 w-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">
                {overallOk ? "Pipeline Live" : anyStale ? "Some Books Stale" : "Pipeline Down"}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full bg-${overallOk ? "success" : anyStale ? "warning" : "destructive"}/15 px-2 py-0.5 text-[11px] font-medium text-${overallOk ? "success" : anyStale ? "warning" : "destructive"}`}>
                {overallOk ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                {overallOk ? "Connected" : anyStale ? "Stale data" : "Disconnected"}
              </span>
              <span className="text-[11px] text-muted-foreground">WS: {ws}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground md:text-sm">
              {health.length === 0 ? (
                "Waiting for scraper health data…"
              ) : (
                health.map((h, i) => (
                  <span key={h.book_id} className="mr-3 inline-flex items-center gap-1">
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${h.status === "ok" ? "bg-success" : "bg-warning"}`}
                    />
                    <span className="font-mono text-[11px]">{h.book_id}</span>
                    <span className="text-[11px] tabular-nums text-muted-foreground">
                      {h.snaps_1h.toLocaleString()} snaps/hr · {h.age_sec.toFixed(1)}s ago
                    </span>
                    {i < health.length - 1 ? null : null}
                  </span>
                ))
              )}
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
