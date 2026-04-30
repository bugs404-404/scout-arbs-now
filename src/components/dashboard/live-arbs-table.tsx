import { useMemo, useState } from "react";
import {
  Trophy,
  CircleDot,
  Activity as ActivityIcon,
  Volleyball,
  Snowflake,
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
import { liveArbs, type ArbOpportunity, type Sport } from "@/lib/mock-data";
import { ArbCalculatorDialog } from "./arb-calculator-dialog";

const sportIcon: Record<Sport, typeof Trophy> = {
  football: Trophy,
  tennis: CircleDot,
  basketball: Volleyball,
  nfl: ActivityIcon,
  hockey: Snowflake,
};

type Filter = "all" | "pre" | "live";

export function LiveArbsTable() {
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<ArbOpportunity | null>(null);
  const [open, setOpen] = useState(false);

  const rows = useMemo(() => {
    if (filter === "pre")
      return liveArbs.filter((a) => a.status === "Pre-match");
    if (filter === "live")
      return liveArbs.filter((a) => a.status === "In-Play");
    return liveArbs;
  }, [filter]);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between md:p-5">
        <div>
          <h3 className="text-sm font-semibold">
            Live Arbs{" "}
            <span className="ml-1 text-muted-foreground">
              ({liveArbs.length})
            </span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Real-time arbitrage opportunities across connected bookmakers
          </p>
        </div>
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as Filter)}
        >
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
              <TableHead>Bookmaker 1</TableHead>
              <TableHead>Bookmaker 2</TableHead>
              <TableHead className="text-right">Arb %</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((arb) => {
              const Icon = sportIcon[arb.sport];
              const stake1 = (
                (arb.suggestedStake / arb.book1.odds) /
                (1 / arb.book1.odds + 1 / arb.book2.odds)
              ).toFixed(0);
              const stake2 = (
                (arb.suggestedStake / arb.book2.odds) /
                (1 / arb.book1.odds + 1 / arb.book2.odds)
              ).toFixed(0);
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
                        <Badge
                          variant="outline"
                          className={
                            arb.status === "In-Play"
                              ? "mt-1 border-destructive/40 text-destructive"
                              : "mt-1 border-border text-muted-foreground"
                          }
                        >
                          {arb.status === "In-Play" && (
                            <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" />
                          )}
                          {arb.status}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {arb.market}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{arb.book1.name}</div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      @ {arb.book1.odds.toFixed(2)} · ${stake1}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{arb.book2.name}</div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      @ {arb.book2.odds.toFixed(2)} · ${stake2}
                    </div>
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
