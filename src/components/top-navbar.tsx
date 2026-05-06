import { useState } from "react";
import { Search, ArrowUpRight, ChevronDown, Zap, ZapOff } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCapital } from "@/hooks/useCapital";
import { useStats } from "@/hooks/useStats";
import { useAutoBet } from "@/hooks/useAutoBet";
import { fmtMoney } from "@/lib/format";

function QuickStat({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: number;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold tabular-nums">{value}</span>
        {delta !== undefined && (
          <span className="inline-flex items-center gap-0.5 rounded-md bg-success/15 px-1.5 py-0.5 text-[11px] font-medium text-success">
            <ArrowUpRight className="h-3 w-3" />
            {delta.toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  );
}

export function TopNavbar() {
  const { capital } = useCapital();
  const { data: stats } = useStats(24);
  const profit24h = stats?.summary.total_potential_profit ?? 0;
  const autoBet = useAutoBet();
  const [confirmOn, setConfirmOn] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-3 backdrop-blur md:px-5">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-5">
        <QuickStat label="Per-Arb Capital" value={fmtMoney(capital)} />
        <Separator orientation="vertical" className="hidden h-8 sm:block" />
        <QuickStat
          label="24h Potential Profit"
          value={`+${fmtMoney(profit24h)}`}
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Auto-bet toggle. ON = bet executor places real money on every
            fresh arb alert. Confirmation gate before turning ON. */}
        <div
          className={
            "flex items-center gap-2 rounded-md border px-2.5 py-1 transition " +
            (autoBet.enabled
              ? "border-success/40 bg-success/10 text-success"
              : "border-border bg-card text-muted-foreground")
          }
          title={autoBet.enabled
            ? "Auto-bet ON: real money wagers on each fresh arb"
            : "Auto-bet OFF: dashboard shows arbs but no bets are placed"}
        >
          {autoBet.enabled ? <Zap className="h-3.5 w-3.5" /> : <ZapOff className="h-3.5 w-3.5" />}
          <span className="text-[11px] font-medium uppercase tracking-wider">
            Auto-bet
          </span>
          <Switch
            checked={autoBet.enabled}
            disabled={autoBet.pending}
            onCheckedChange={(v) => {
              if (v) setConfirmOn(true);
              else autoBet.set(false);
            }}
          />
        </div>

        <AlertDialog open={confirmOn} onOpenChange={setConfirmOn}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Enable auto-bet?</AlertDialogTitle>
              <AlertDialogDescription>
                When enabled, every fresh arb alert is sent to the betting
                executor and real-money tickets are placed at the linked
                bookmakers. Make sure the executor is running with real
                credentials and AUTO_BET_DRY_RUN=0 for actual stakes —
                otherwise it will only log dry-run intents.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  autoBet.set(true);
                  setConfirmOn(false);
                }}
              >
                Yes, enable
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search events, books, markets…"
            className="h-9 w-64 pl-9"
          />
        </div>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border bg-card px-1.5 py-1 pr-2 text-sm transition hover:bg-accent">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                CH
              </AvatarFallback>
            </Avatar>
            <span className="hidden font-medium sm:inline">Charlz</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
