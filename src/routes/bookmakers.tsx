import { createFileRoute } from "@tanstack/react-router";
import { Activity, AlertTriangle, CheckCircle2, Briefcase, XCircle } from "lucide-react";
import { useBookmakers } from "@/hooks/useBookmakers";
import { fmtMoney } from "@/lib/format";

export const Route = createFileRoute("/bookmakers")({
  head: () => ({
    meta: [
      { title: "Bookmakers — ArbScout" },
      {
        name: "description",
        content:
          "Connected bookmakers, scrape rates, arb participation, and stake totals.",
      },
    ],
  }),
  component: BookmakersPage,
});

const STATUS_STYLE: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  ok:    { icon: CheckCircle2,  color: "var(--success, #16a34a)", label: "Healthy" },
  stale: { icon: AlertTriangle, color: "var(--warning, #f59e0b)", label: "Stale" },
  down:  { icon: XCircle,       color: "var(--destructive, #dc2626)", label: "Down" },
};

function BookmakersPage() {
  const { data, isLoading, error } = useBookmakers(24);
  const books = data ?? [];

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bookmakers</h1>
          <p className="text-sm text-muted-foreground">
            Live scrape health and arb participation across connected books.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5" />
          {isLoading ? "Loading…" : `${books.length} connected`}
          {error && <span className="text-destructive">• {(error as Error).message}</span>}
        </div>
      </div>

      {books.length === 0 && !isLoading ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Briefcase className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-medium">No bookmakers reporting yet</p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Start the supervisor — health rows appear within seconds of the
            first scrape cycle.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {books.map((b) => {
            const Style = STATUS_STYLE[b.status] ?? STATUS_STYLE.down;
            const Icon = Style.icon;
            return (
              <div
                key={b.book_id}
                className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-white/[0.02]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      Book
                    </div>
                    <div className="mt-1 text-lg font-semibold">{b.book_id}</div>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{ background: `${Style.color}1f`, color: Style.color }}
                  >
                    <Icon className="h-3 w-3" />
                    {Style.label}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <Stat label="Snaps / hr" value={b.snaps_1h.toLocaleString()} />
                  <Stat label="Last seen" value={`${b.age_sec.toFixed(1)}s ago`} />
                  <Stat label="Active events (24h)" value={b.event_count.toLocaleString()} />
                  <Stat label="Arbs participated (24h)" value={b.arb_count.toLocaleString()} />
                  <Stat label="Total staked (24h)" value={fmtMoney(b.total_staked)} full />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={`rounded-md border border-border/60 bg-background/40 p-2 ${full ? "col-span-2" : ""}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}
