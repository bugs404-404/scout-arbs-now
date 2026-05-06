import { useEffect, useMemo, useState } from "react";
import {
  Trophy,
  CircleDot,
  Activity as ActivityIcon,
  Volleyball,
  Snowflake,
  ArrowDown,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type ArbOpportunity, type Sport } from "@/lib/mock-data";
import { useArbs } from "@/hooks/useArbs";
import { useArbStream } from "@/hooks/useArbStream";
import { fmtMoney } from "@/lib/format";
import { ArbCalculatorDialog } from "./arb-calculator-dialog";
import { LiveScoreBadge } from "./live-score-badge";

const sportIcon: Record<Sport, typeof Trophy> = {
  football: Trophy,
  tennis: CircleDot,
  basketball: Volleyball,
  nfl: ActivityIcon,
  hockey: Snowflake,
};

type Filter = "all" | "pre" | "live";

function fmtAge(seconds: number): string {
  if (seconds < 60) return `${Math.max(0, Math.floor(seconds))}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

function ageColor(seconds: number, isLive: boolean): string {
  // Live arbs decay fast (TTL ≈20s); prematch holds longer.
  const stale = isLive ? 20 : 120;
  if (seconds < stale * 0.5) return "text-success";
  if (seconds < stale) return "text-warning";
  return "text-destructive";
}

export function LiveArbsTable() {
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<ArbOpportunity | null>(null);
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const { arbs, isLoading, error } = useArbs({ hours: 24, limit: 100 });
  const { status: wsStatus } = useArbStream();

  // Tick once a second so the "X s ago" column updates without refetching.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const rows = useMemo(() => {
    let r = arbs;
    if (filter === "pre")  r = arbs.filter((a) => a.status === "Pre-match");
    if (filter === "live") r = arbs.filter((a) => a.status === "In-Play");
    // Newest first — useArbs already sorts but be defensive in case of WS push merge.
    return [...r].sort((a, b) => Date.parse(b.detectedAt) - Date.parse(a.detectedAt));
  }, [filter, arbs]);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between md:p-5">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <span>Live Arbs <span className="text-muted-foreground">({rows.length})</span></span>
            <span
              className={
                "inline-block h-1.5 w-1.5 rounded-full " +
                (wsStatus === "open"
                  ? "bg-success"
                  : wsStatus === "connecting"
                    ? "bg-warning animate-pulse"
                    : "bg-destructive")
              }
              aria-label={`WS ${wsStatus}`}
            />
            <Badge variant="outline" className="text-[10px] gap-1 border-border/60 text-muted-foreground">
              <ArrowDown className="h-2.5 w-2.5" />
              newest first
            </Badge>
          </h3>
          <p className="text-xs text-muted-foreground">
            {isLoading
              ? "Loading…"
              : error
                ? `API error: ${(error as Error).message}`
                : "Real-time arbitrage opportunities across connected bookmakers"}
          </p>
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pre">Pre-match</TabsTrigger>
            <TabsTrigger value="live">In-Play</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Event</TableHead>
              <TableHead>Market</TableHead>
              <TableHead>Stake distribution (per book)</TableHead>
              <TableHead className="text-right">Detected</TableHead>
              <TableHead className="text-right">Arb %</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((arb) => {
              const Icon = sportIcon[arb.sport];
              const ageSec = (now - Date.parse(arb.detectedAt)) / 1000;
              return (
                <TableRow
                  key={arb.id}
                  className="transition-colors hover:bg-white/[0.03]"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {arb.event}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <Badge
                            variant="outline"
                            className={
                              arb.status === "In-Play"
                                ? "border-destructive/40 text-destructive"
                                : "border-border text-muted-foreground"
                            }
                          >
                            {arb.status === "In-Play" && (
                              <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" />
                            )}
                            {arb.status}
                          </Badge>
                          {arb.status === "In-Play" && (
                            <LiveScoreBadge eventId={arb.eventId} />
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {arb.market}
                  </TableCell>

                  {/* Per-leg stake breakdown — explicitly shows which book
                      receives which side of the bet, with stake + odds.   */}
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      {arb.legs.map((leg, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <Badge
                            variant="outline"
                            className="h-5 px-1.5 font-mono uppercase border-primary/40 text-primary"
                          >
                            BET&nbsp;@ {leg.bookId}
                          </Badge>
                          <span className="text-foreground font-medium truncate max-w-[140px]" title={leg.outcome}>
                            {leg.outcome}
                          </span>
                          <span className="text-muted-foreground tabular-nums">
                            @ {leg.odds.toFixed(2)}
                          </span>
                          <span className="text-foreground tabular-nums font-medium">
                            {fmtMoney(leg.stake)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </TableCell>

                  {/* Live-ticking age column. Colour reflects freshness. */}
                  <TableCell className={`text-right tabular-nums text-xs ${ageColor(ageSec, arb.status === "In-Play")}`}>
                    {fmtAge(ageSec)}
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="font-mono text-base font-semibold text-primary">
                      {arb.arbPercent.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelected(arb);
                        setOpen(true);
                      }}
                    >
                      Calculate
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No opportunities match this filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ArbCalculatorDialog
        arb={selected}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
}
