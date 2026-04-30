# ArbScout Dashboard — Build Plan

A dark-themed arbitrage betting dashboard with sidebar navigation, summary charts, and a live arbs table. Fully responsive, built on the existing TanStack Start + Tailwind v4 + shadcn stack.

## Design system

Apply the brand tokens to `src/styles.css` as oklch CSS variables, replacing the current generic palette:

- `--background`: #12121A (main canvas)
- `--card` / `--popover`: #1A1B26 (panels)
- `--foreground`: #FFFFFF
- `--muted-foreground`: #A0AEC0
- `--primary`: #00E5FF (neon cyan, accent)
- `--destructive` / negative: #FF6B6B
- `--accent` (warning/tertiary): #F6AD55
- `--border`: rgba(255,255,255,0.05)
- `--radius`: 12px
- Force `.dark` class on `<html>` (root shell) so dark theme is the only theme
- Load Inter via `<link>` in `__root.tsx` head and set `font-family` on body

## Routes

Each sidebar item gets its own route file (proper SSR + future-proof), with the Dashboard as the home page:

- `src/routes/index.tsx` — Dashboard (full build this turn)
- `src/routes/live-arbs.tsx` — placeholder page reusing the arbs table
- `src/routes/calculators.tsx` — placeholder
- `src/routes/bet-tracker.tsx` — placeholder
- `src/routes/bookmakers.tsx` — placeholder
- `src/routes/__root.tsx` — wraps everything in `SidebarProvider` + top navbar

Placeholder pages render a titled empty state so the sidebar nav works end-to-end.

## Layout

```
┌─────────────────────────────────────────────────────────┐
│ Sidebar  │  TopNavbar (bankroll · 24h profit · search · avatar) │
│ ArbScout │─────────────────────────────────────────────│
│ • Dash   │  Connectivity Banner                         │
│ • Arbs   │  ┌─────────┬──────────┬──────────────────┐   │
│ • Calc   │  │ Donut   │ Stat     │ 30-day line      │   │
│ • Bets   │  │ Chart   │ Cards    │ chart            │   │
│ • Books  │  └─────────┴──────────┴──────────────────┘   │
│          │  Live Arbs table (filters · rows · action)    │
│ Help box │                                              │
└─────────────────────────────────────────────────────────┘
```

- Sidebar: shadcn `Sidebar` with `collapsible="icon"`, Lucide icons (`LayoutDashboard`, `Activity`, `Calculator`, `List`, `Briefcase`), active route via `useRouterState`. Bottom section = a help/support callout card with a CTA button.
- Top navbar: 56px height, left shows two compact stats (Total Bankroll, 24h Profit with green delta), right shows a search input and an avatar dropdown (Profile / Settings / Sign out — non-functional menu items).
- `SidebarTrigger` lives in the navbar so it's always visible.

## Dashboard components

**1. Bookmaker Connectivity Banner**
Panel with cyan left accent border. Left: "Main Account Active" with green dot + "Connect more bookmakers to find more arbs" subtitle. Right: "Manage" (ghost) and "Connect Bookmaker" (primary cyan) buttons.

**2. Summary Row** — 3-column grid (stacks to 1 column under `md`):

- **Bankroll Distribution (Donut)** — Recharts `PieChart` with two segments: "Locked in bets" and "Available liquidity"; center label shows total bankroll; legend with colored dots and dollar amounts.
- **Today's Metrics** — two stacked stat cards inside one panel: "Total Turnover" and "Arbitrage Profit", each with large value, small label, and green up-arrow delta chip.
- **30-Day Profitability (Line)** — Recharts `AreaChart` with a smooth (`monotone`) cyan stroke over a faint cyan gradient fill, no axes chrome (just minimal ticks), tooltip on hover.

**3. Live Arbitrage Opportunities table**

Panel header: "Live Arbs (7)" title on the left; segmented filter `All / Pre-match / In-Play` on the right (shadcn `Tabs` styled as pills). Underneath, a shadcn `Table` with columns:

| Event | Market | Bookmaker 1 | Bookmaker 2 | Arb % | Action |

- Event cell: sport Lucide icon + match name + small "Pre-match" / "Live" badge.
- Bookmaker cells: name on top, odds + required stake on a second muted line.
- Arb %: large cyan number, monospace.
- Action: "Calculate" button (primary) — opens a stake calculator modal.
- Row hover: background lightens to `rgba(255,255,255,0.03)`.
- Mock data: 7 realistic rows (football, tennis, basketball, NFL).

**4. Stake Calculator Modal**

shadcn `Dialog` triggered from the action button. Inputs:
- Total stake (number input, prefilled with suggested amount)
- Read-only odds for each bookmaker (from the row)
- Computed: Stake on Book 1, Stake on Book 2, Guaranteed profit, ROI %
- Recalculates live on stake change. Footer: Cancel / Place Bet (visual only).

## Interaction details

- All charts use Recharts with shadcn `ChartContainer` for tooltips and theming.
- Table row hover handled in Tailwind (`hover:bg-white/[0.03]`).
- Sidebar respects active route highlighting (cyan left accent + cyan icon on active item).
- Layout is responsive: sidebar collapses to icon rail under `md`; summary grid stacks; table becomes horizontally scrollable on small screens.

## Files to create / modify

- Modify: `src/styles.css` (palette + Inter), `src/routes/__root.tsx` (sidebar shell, force dark class, Inter link), `src/routes/index.tsx` (dashboard composition).
- Create: `src/components/app-sidebar.tsx`, `src/components/top-navbar.tsx`, `src/components/dashboard/connectivity-banner.tsx`, `bankroll-donut.tsx`, `todays-metrics.tsx`, `profit-chart.tsx`, `live-arbs-table.tsx`, `arb-calculator-dialog.tsx`.
- Create: `src/lib/mock-data.ts` (bankroll, profit series, arbs rows).
- Create: placeholder route files for the 4 non-dashboard nav entries.

## Out of scope

- No backend, no auth, no real bookmaker integrations — all data is mocked in `src/lib/mock-data.ts` so it's trivial to swap for an API later.
- No persistence of calculator inputs.