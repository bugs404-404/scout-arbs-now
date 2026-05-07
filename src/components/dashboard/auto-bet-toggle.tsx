/**
 * Auto-bet master switch. Off by default. When ON, the server-side
 * `storage.auto_executor` worker subscribes to fresh arb_alerts and places
 * real bets via per-book betting clients. Toggle persists in Redis (`auto_bet:enabled`)
 * so all dashboard tabs and the executor see the same state instantly.
 */
import { Bot, AlertTriangle, ZapOff, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAutoBet } from "@/hooks/useAutoBet";

export function AutoBetToggle() {
  const { enabled, isLoading, set, pending } = useAutoBet();

  const tone = enabled ? "destructive" : "muted";
  const Icon = enabled ? Zap : ZapOff;

  return (
    <div
      className={
        "rounded-xl border p-4 md:p-5 " +
        (enabled
          ? "border-destructive/40 bg-destructive/5"
          : "border-border bg-card")
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg " +
              (enabled
                ? "bg-destructive/15 text-destructive"
                : "bg-muted text-muted-foreground")
            }
          >
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">
                Autonomous Betting
              </span>
              <span
                className={
                  "rounded-full px-2 py-0.5 text-[11px] font-medium " +
                  (enabled
                    ? "bg-destructive/15 text-destructive"
                    : "bg-muted text-muted-foreground")
                }
              >
                {isLoading ? "…" : enabled ? "ARMED" : "Idle"}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground md:text-sm max-w-2xl">
              {enabled ? (
                <>
                  <AlertTriangle className="inline h-3.5 w-3.5 mr-1 text-destructive" />
                  Auto-executor is firing real bets on every arb that clears
                  the margin and stake gates. Toggle off to halt immediately.
                </>
              ) : (
                "When armed, the executor places bets automatically as soon as a profitable arb is detected. Server-side guardrails: max stake per arb, min margin %, daily loss limit."
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {enabled ? "ON" : "OFF"}
          </span>
          <Switch
            checked={enabled}
            disabled={isLoading || pending}
            onCheckedChange={(v) => set(v)}
            aria-label="Toggle autonomous betting"
          />
        </div>
      </div>
    </div>
  );
}
