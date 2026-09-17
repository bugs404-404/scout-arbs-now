/**
 * The Place button's confirmation step.
 *
 * Everything money-related is decided by the server: the stakes, the rails,
 * the two-phase commit. This dialog exists to make the operator's consent
 * INFORMED, so it shows the three things a click cannot take back — whether
 * real money is involved, which book gets which side at what stake, and what
 * the executor refuses and why.
 *
 * Two-step arm, and the arm BREAKS when the price moves. The gate re-fetches
 * every few seconds; if a leg's odds change between arming and firing, the
 * number the operator agreed to is gone, so the arm is dropped and the button
 * goes back to "Arm". That is the whole reason the dialog re-polls at all.
 */
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, ShieldCheck, Zap } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fmtMoney } from "@/lib/format";
import { useCapital } from "@/hooks/useCapital";
import { useExecGate, usePlaceTicket } from "@/hooks/useExec";
import type { UiArb } from "@/lib/transform";
import type { RawTicketResult } from "@/lib/api";

interface Props {
  arb: UiArb | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Fingerprint of the prices the operator is agreeing to. Any change in it
 *  invalidates an existing arm — see the file header. */
function priceFingerprint(legs: { book_id: string; odds: number }[]): string {
  return legs.map((l) => `${l.book_id}@${l.odds}`).join("|");
}

function StateBadge({ state }: { state?: string }) {
  const tone =
    state === "filled"
      ? "border-success/40 text-success"
      : state === "half_filled"
        ? "border-destructive/60 text-destructive"
        : "border-warning/40 text-warning";
  return (
    <Badge variant="outline" className={`font-mono uppercase ${tone}`}>
      {state ?? "unknown"}
    </Badge>
  );
}

function Result({ result }: { result: RawTicketResult }) {
  const half = result.state === "half_filled";
  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-center gap-2">
        <StateBadge state={result.state} />
        {result.ticket_id != null && (
          <span className="font-mono text-xs text-muted-foreground">
            ticket #{result.ticket_id}
          </span>
        )}
        {result.dry_run && (
          <Badge variant="outline" className="border-border text-muted-foreground">
            dry run
          </Badge>
        )}
      </div>

      {result.reason && (
        <p className="text-sm text-muted-foreground">{result.reason}</p>
      )}

      {/* A half fill is the one outcome that costs money on its own: one side
          is live and the hedge is not. It gets the loudest treatment here. */}
      {half && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
          <div className="flex items-center gap-2 font-medium text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Unhedged exposure — one leg landed without its pair
          </div>
          <p className="mt-1 text-xs text-destructive/90">
            This is directional risk, not an arb. Hedge it by hand on the book
            that refused, or accept the position deliberately.
          </p>
          {result.unhedged != null && (
            <pre className="mt-2 max-h-40 overflow-auto rounded bg-background/60 p-2 text-[10px] leading-relaxed">
              {JSON.stringify(result.unhedged, null, 1)}
            </pre>
          )}
        </div>
      )}

      {result.placements && result.placements.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {result.placements.map((p) => (
            <div
              key={p.leg_index}
              className="flex items-center justify-between gap-2 rounded border border-border px-2 py-1.5 text-xs"
            >
              <span className="font-mono text-muted-foreground">
                leg {p.leg_index}
              </span>
              <span className={p.ok ? "text-success" : "text-destructive"}>
                {p.ok ? "placed" : (p.err ?? "refused")}
              </span>
              <span className="tabular-nums text-muted-foreground">
                {p.odds != null ? `@ ${Number(p.odds).toFixed(2)}` : ""}
                {p.stake ? ` · ${fmtMoney(Number(p.stake))}` : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PlaceBetDialog({ arb, open, onOpenChange }: Props) {
  const { capital } = useCapital();
  const gate = useExecGate(arb?.id ?? null, capital, open);
  const place = usePlaceTicket();
  const [armed, setArmed] = useState(false);
  const [result, setResult] = useState<RawTicketResult | null>(null);

  const candidate = gate.candidate;
  const fp = useMemo(
    () => (candidate ? priceFingerprint(candidate.legs) : ""),
    [candidate],
  );

  // Fresh dialog every time: nothing from the previous arb survives an open.
  useEffect(() => {
    if (open) {
      setArmed(false);
      setResult(null);
      place.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, arb?.id]);

  // The price moved under an armed ticket — drop the arm (see header).
  useEffect(() => {
    setArmed(false);
  }, [fp]);

  const blocked = gate.blocks.length > 0;
  const stakes = candidate?.stakes ?? [];
  const total = Number(candidate?.total_stake ?? 0);
  const real = !gate.dryRun;

  async function fire() {
    if (!arb || !candidate) return;
    const r = await place
      .mutateAsync({
        arb_key: candidate.arb_key,
        opportunity_id: candidate.id,
        legs: candidate.legs,
        capital,
        flags: candidate.flags,
      })
      .catch((e: Error) => ({ ok: false, reason: e.message }) as RawTicketResult);
    setResult(r);
    setArmed(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Place bet
            {arb?.status === "In-Play" && (
              <Badge variant="outline" className="border-destructive/40 text-destructive">
                <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" />
                In-Play
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {arb?.event} · {arb?.market}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <Result result={result} />
        ) : gate.isLoading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking the executor…
          </div>
        ) : gate.error ? (
          <p className="py-4 text-sm text-destructive">
            Executor unreachable: {gate.error.message}
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Real money vs dry run. This is the single most important line
                in the dialog, so it is the first thing under the title. */}
            <div
              className={
                "flex items-start gap-2 rounded-md border p-3 text-sm " +
                (real
                  ? "border-destructive/50 bg-destructive/10 text-destructive"
                  : "border-border bg-secondary/40 text-muted-foreground")
              }
            >
              {real ? (
                <Zap className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <span>
                {real ? (
                  <>
                    <strong>Real money.</strong> BET_DRY_RUN is off — confirming
                    sends these stakes to the books.
                  </>
                ) : (
                  <>
                    <strong>Dry run.</strong> The ticket walks the full state
                    machine and records what it would have sent; the extension
                    stops short of placing.
                  </>
                )}
              </span>
            </div>

            {candidate && (
              <>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md border border-border p-2">
                    <div className="font-mono text-base font-semibold text-primary">
                      {candidate.net_pct.toFixed(2)}%
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      net (post-tax)
                    </div>
                  </div>
                  <div className="rounded-md border border-border p-2">
                    <div className="font-mono text-base font-semibold">
                      {candidate.raw_pct.toFixed(2)}%
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      raw
                    </div>
                  </div>
                  <div className="rounded-md border border-border p-2">
                    <div className="font-mono text-base font-semibold tabular-nums">
                      {candidate.age_sec.toFixed(1)}s
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      age
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  {candidate.legs.map((l, i) => (
                    <div
                      key={i}
                      className="flex flex-wrap items-center gap-2 rounded border border-border px-2 py-2 text-xs"
                    >
                      <Badge
                        variant="outline"
                        className="h-5 px-1.5 font-mono uppercase border-primary/40 text-primary"
                      >
                        {l.book_id}
                      </Badge>
                      <span
                        className="min-w-0 flex-1 truncate font-medium text-foreground"
                        title={`${l.market_raw} — ${l.outcome_raw}`}
                      >
                        {l.outcome_raw}
                      </span>
                      <span className="tabular-nums text-muted-foreground">
                        @ {Number(l.odds).toFixed(2)}
                      </span>
                      <span className="tabular-nums font-medium">
                        {stakes[i] ? fmtMoney(Number(stakes[i]), { dp: 2 }) : "—"}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground">
                  Total {fmtMoney(total, { dp: 2 })} from a {fmtMoney(capital)}{" "}
                  base. The executor scales the whole ticket up until the
                  thinnest leg clears its book&apos;s minimum — the ratio, and
                  therefore the arb, is preserved.
                </p>
              </>
            )}

            {blocked && (
              <div className="rounded-md border border-warning/50 bg-warning/10 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-warning">
                  <AlertTriangle className="h-4 w-4" />
                  Not placeable
                </div>
                <ul className="mt-1.5 list-inside list-disc text-xs text-warning/90">
                  {gate.blocks.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {result ? "Close" : "Cancel"}
          </Button>
          {!result && (
            <Button
              variant={armed && real ? "destructive" : "default"}
              disabled={blocked || !candidate || place.isPending}
              onClick={() => (armed ? fire() : setArmed(true))}
            >
              {place.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {place.isPending
                ? "Placing…"
                : armed
                  ? real
                    ? `Confirm — place ${fmtMoney(total)} for real`
                    : `Confirm dry run — ${fmtMoney(total)}`
                  : "Arm"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
