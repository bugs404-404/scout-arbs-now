import { Search, ArrowUpRight, ChevronDown } from "lucide-react";

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
import { bankroll, todaysMetrics } from "@/lib/mock-data";
import { ThemeToggle } from "@/components/theme-toggle";

function formatUsd(n: number) {
  return `TSh ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

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
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-3 backdrop-blur md:px-5">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-5">
        <QuickStat
          label="Total Bankroll"
          value={formatUsd(bankroll.total)}
          delta={todaysMetrics.bankroll24hDelta}
        />
        <Separator orientation="vertical" className="hidden h-8 sm:block" />
        <QuickStat
          label="24h Profit"
          value={`+${formatUsd(todaysMetrics.bankroll24h)}`}
          delta={todaysMetrics.arbProfitDelta}
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
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
