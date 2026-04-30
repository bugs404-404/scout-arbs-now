export type ArbStatus = "Pre-match" | "In-Play";
export type Sport = "football" | "tennis" | "basketball" | "nfl" | "hockey";

export interface ArbOpportunity {
  id: string;
  sport: Sport;
  event: string;
  market: string;
  status: ArbStatus;
  book1: { name: string; odds: number };
  book2: { name: string; odds: number };
  arbPercent: number;
  suggestedStake: number;
}

export const liveArbs: ArbOpportunity[] = [
  {
    id: "a1",
    sport: "football",
    event: "Man City vs Arsenal",
    market: "Over/Under 2.5 Goals",
    status: "Pre-match",
    book1: { name: "Pinnacle", odds: 2.05 },
    book2: { name: "Bet365", odds: 2.1 },
    arbPercent: 3.21,
    suggestedStake: 1000,
  },
  {
    id: "a2",
    sport: "tennis",
    event: "Alcaraz vs Sinner",
    market: "Match Winner",
    status: "In-Play",
    book1: { name: "Betfair", odds: 1.95 },
    book2: { name: "Unibet", odds: 2.18 },
    arbPercent: 2.74,
    suggestedStake: 750,
  },
  {
    id: "a3",
    sport: "basketball",
    event: "Lakers vs Celtics",
    market: "Spread -3.5",
    status: "Pre-match",
    book1: { name: "DraftKings", odds: 1.91 },
    book2: { name: "FanDuel", odds: 2.12 },
    arbPercent: 1.95,
    suggestedStake: 500,
  },
  {
    id: "a4",
    sport: "nfl",
    event: "Chiefs vs Bills",
    market: "Total Points Over 48.5",
    status: "Pre-match",
    book1: { name: "Caesars", odds: 1.88 },
    book2: { name: "BetMGM", odds: 2.22 },
    arbPercent: 4.08,
    suggestedStake: 1500,
  },
  {
    id: "a5",
    sport: "football",
    event: "Real Madrid vs Barcelona",
    market: "Both Teams to Score",
    status: "In-Play",
    book1: { name: "1xBet", odds: 1.78 },
    book2: { name: "William Hill", odds: 2.4 },
    arbPercent: 2.31,
    suggestedStake: 600,
  },
  {
    id: "a6",
    sport: "hockey",
    event: "Rangers vs Bruins",
    market: "Puck Line +1.5",
    status: "Pre-match",
    book1: { name: "Pinnacle", odds: 1.83 },
    book2: { name: "Bet365", odds: 2.3 },
    arbPercent: 1.42,
    suggestedStake: 400,
  },
  {
    id: "a7",
    sport: "tennis",
    event: "Swiatek vs Sabalenka",
    market: "Set Betting 2-1",
    status: "Pre-match",
    book1: { name: "Unibet", odds: 3.4 },
    book2: { name: "Betfair", odds: 1.5 },
    arbPercent: 3.86,
    suggestedStake: 850,
  },
];

export const bankroll = {
  total: 28450,
  locked: 9320,
  available: 19130,
};

export const todaysMetrics = {
  turnover: 12480,
  turnoverDelta: 8.4,
  arbProfit: 412.55,
  arbProfitDelta: 12.7,
  bankroll24h: 318.9,
  bankroll24hDelta: 1.13,
};

export const profitSeries = Array.from({ length: 30 }, (_, i) => {
  // Smoothly increasing series with small noise
  const base = 200 + i * 22;
  const wobble = Math.sin(i / 2) * 60 + Math.cos(i / 3) * 40;
  return {
    day: `D${i + 1}`,
    profit: Math.round(base + wobble),
  };
});
