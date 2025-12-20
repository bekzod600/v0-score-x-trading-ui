export type SignalStatus = "WAITING_ENTRY" | "ACTIVE" | "TP1_HIT" | "TP2_HIT" | "SL_HIT" | "HOLD" | "CANCEL"

export type IslamiclyStatus = "compliant" | "non-compliant" | "unknown"
export type MusaffaStatus = "halal" | "not-halal" | "unknown"

export interface Trader {
  id: string
  username: string
  avatar: string
  scoreXPoints: number
  rank: number
  avgStars: number
  totalPLPercent: number
  totalSignals: number
  subscribers: number
  avgDaysToResult: number
}

export interface Signal {
  id: string
  trader: Trader
  ticker: string
  currentPrice: number
  entry: number
  tp1: number
  tp2: number
  sl: number
  price: number
  discountPercent: number
  isFree: boolean
  isPurchased: boolean
  status: SignalStatus
  islamiclyStatus: IslamiclyStatus
  musaffaStatus: MusaffaStatus
  likes: number
  dislikes: number
  isFavorite: boolean
  createdAt: string
  closedAt?: string
}

export interface NewsItem {
  id: string
  title: string
  content: string
  createdAt: string
}

export interface SavedFilter {
  id: string
  name: string
  filters: FilterState
}

export interface FilterState {
  priceType: "all" | "free" | "paid" | "discounted"
  islamiclyStatus: "any" | "compliant" | "non-compliant" | "unknown"
  musaffaStatus: "any" | "halal" | "not-halal" | "unknown"
  minScoreXPoints: number
  minStars: number
  minProfitPercent: number
  maxLossPercent: number
  maxRiskRatio: number
  statuses: SignalStatus[]
}

export const defaultFilters: FilterState = {
  priceType: "all",
  islamiclyStatus: "any",
  musaffaStatus: "any",
  minScoreXPoints: 0,
  minStars: 0,
  minProfitPercent: 0,
  maxLossPercent: 100,
  maxRiskRatio: 10,
  statuses: [],
}

export const mockTraders: Trader[] = [
  {
    id: "1",
    username: "AlphaTrader",
    avatar: "/trader-avatar-1.jpg",
    scoreXPoints: 2450,
    rank: 1,
    avgStars: 4.8,
    totalPLPercent: 156.4,
    totalSignals: 89,
    subscribers: 1250,
    avgDaysToResult: 2.5,
  },
  {
    id: "2",
    username: "StockMaster",
    avatar: "/trader-avatar-2.jpg",
    scoreXPoints: 2180,
    rank: 2,
    avgStars: 4.6,
    totalPLPercent: 132.8,
    totalSignals: 76,
    subscribers: 980,
    avgDaysToResult: 3.2,
  },
  {
    id: "3",
    username: "TradePro",
    avatar: "/trader-avatar-3.jpg",
    scoreXPoints: 1950,
    rank: 3,
    avgStars: 4.5,
    totalPLPercent: 98.2,
    totalSignals: 64,
    subscribers: 750,
    avgDaysToResult: 4.0,
  },
  {
    id: "4",
    username: "SignalKing",
    avatar: "/trader-avatar-4.jpg",
    scoreXPoints: 1820,
    rank: 4,
    avgStars: 4.4,
    totalPLPercent: 87.5,
    totalSignals: 52,
    subscribers: 620,
    avgDaysToResult: 5.5,
  },
  {
    id: "5",
    username: "MarketGuru",
    avatar: "/trader-avatar-5.jpg",
    scoreXPoints: 1680,
    rank: 5,
    avgStars: 4.3,
    totalPLPercent: 76.3,
    totalSignals: 48,
    subscribers: 540,
    avgDaysToResult: 6.2,
  },
]

export const mockSignals: Signal[] = [
  {
    id: "1",
    trader: mockTraders[0],
    ticker: "AAPL",
    currentPrice: 179.25,
    entry: 178.5,
    tp1: 185.0,
    tp2: 192.0,
    sl: 172.0,
    price: 0,
    discountPercent: 0,
    isFree: true,
    isPurchased: true,
    status: "ACTIVE",
    islamiclyStatus: "compliant",
    musaffaStatus: "halal",
    likes: 45,
    dislikes: 3,
    isFavorite: false,
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    trader: mockTraders[1],
    ticker: "MSFT",
    currentPrice: 402.5,
    entry: 405.0,
    tp1: 420.0,
    tp2: 435.0,
    sl: 390.0,
    price: 15,
    discountPercent: 20,
    isFree: false,
    isPurchased: false,
    status: "WAITING_ENTRY",
    islamiclyStatus: "compliant",
    musaffaStatus: "halal",
    likes: 32,
    dislikes: 2,
    isFavorite: true,
    createdAt: "2024-01-15T09:00:00Z",
  },
  {
    id: "3",
    trader: mockTraders[2],
    ticker: "GOOGL",
    currentPrice: 151.2,
    entry: 142.0,
    tp1: 150.0,
    tp2: 158.0,
    sl: 135.0,
    price: 10,
    discountPercent: 0,
    isFree: false,
    isPurchased: true,
    status: "TP1_HIT",
    islamiclyStatus: "compliant",
    musaffaStatus: "halal",
    likes: 67,
    dislikes: 5,
    isFavorite: false,
    createdAt: "2024-01-14T14:00:00Z",
    closedAt: "2024-01-15T16:30:00Z",
  },
  {
    id: "4",
    trader: mockTraders[0],
    ticker: "AMZN",
    currentPrice: 156.8,
    entry: 155.0,
    tp1: 165.0,
    tp2: 175.0,
    sl: 145.0,
    price: 20,
    discountPercent: 0,
    isFree: false,
    isPurchased: false,
    status: "ACTIVE",
    islamiclyStatus: "compliant",
    musaffaStatus: "halal",
    likes: 28,
    dislikes: 1,
    isFavorite: false,
    createdAt: "2024-01-15T08:00:00Z",
  },
  {
    id: "5",
    trader: mockTraders[3],
    ticker: "NVDA",
    currentPrice: 625.4,
    entry: 545.0,
    tp1: 580.0,
    tp2: 620.0,
    sl: 510.0,
    price: 0,
    discountPercent: 0,
    isFree: true,
    isPurchased: true,
    status: "TP2_HIT",
    islamiclyStatus: "compliant",
    musaffaStatus: "halal",
    likes: 89,
    dislikes: 4,
    isFavorite: true,
    createdAt: "2024-01-13T11:00:00Z",
    closedAt: "2024-01-15T09:15:00Z",
  },
  {
    id: "6",
    trader: mockTraders[4],
    ticker: "META",
    currentPrice: 358.2,
    entry: 380.0,
    tp1: 400.0,
    tp2: 420.0,
    sl: 360.0,
    price: 12,
    discountPercent: 15,
    isFree: false,
    isPurchased: false,
    status: "SL_HIT",
    islamiclyStatus: "unknown",
    musaffaStatus: "unknown",
    likes: 15,
    dislikes: 12,
    isFavorite: false,
    createdAt: "2024-01-12T16:00:00Z",
    closedAt: "2024-01-14T11:45:00Z",
  },
  {
    id: "7",
    trader: mockTraders[1],
    ticker: "TSLA",
    currentPrice: 245.0,
    entry: 240.0,
    tp1: 260.0,
    tp2: 280.0,
    sl: 225.0,
    price: 25,
    discountPercent: 0,
    isFree: false,
    isPurchased: false,
    status: "WAITING_ENTRY",
    islamiclyStatus: "non-compliant",
    musaffaStatus: "not-halal",
    likes: 18,
    dislikes: 8,
    isFavorite: false,
    createdAt: "2024-01-15T11:00:00Z",
  },
  {
    id: "8",
    trader: mockTraders[2],
    ticker: "JPM",
    currentPrice: 172.5,
    entry: 170.0,
    tp1: 180.0,
    tp2: 190.0,
    sl: 162.0,
    price: 8,
    discountPercent: 0,
    isFree: false,
    isPurchased: true,
    status: "HOLD",
    islamiclyStatus: "non-compliant",
    musaffaStatus: "not-halal",
    likes: 12,
    dislikes: 6,
    isFavorite: false,
    createdAt: "2024-01-10T09:00:00Z",
    closedAt: "2024-01-14T16:00:00Z",
  },
  {
    id: "9",
    trader: mockTraders[3],
    ticker: "DIS",
    currentPrice: 112.3,
    entry: 115.0,
    tp1: 125.0,
    tp2: 135.0,
    sl: 108.0,
    price: 0,
    discountPercent: 0,
    isFree: true,
    isPurchased: true,
    status: "CANCEL",
    islamiclyStatus: "compliant",
    musaffaStatus: "halal",
    likes: 8,
    dislikes: 2,
    isFavorite: false,
    createdAt: "2024-01-11T14:00:00Z",
    closedAt: "2024-01-12T10:00:00Z",
  },
]

export const mockSavedFilters: SavedFilter[] = [
  {
    id: "1",
    name: "Free Halal Only",
    filters: {
      ...defaultFilters,
      priceType: "free",
      islamiclyStatus: "compliant",
      musaffaStatus: "halal",
    },
  },
  {
    id: "2",
    name: "High Quality Traders",
    filters: {
      ...defaultFilters,
      minScoreXPoints: 2000,
      minStars: 4.5,
    },
  },
]

export const mockNews: NewsItem[] = [
  {
    id: "1",
    title: "ScoreX Platform Update v2.0",
    content:
      "We are excited to announce major improvements to the platform including faster signal delivery, improved leaderboard analytics, and enhanced mobile experience.",
    createdAt: "2024-01-15T12:00:00Z",
  },
  {
    id: "2",
    title: "New Payment Methods Available",
    content:
      "P2P payments are now available with 0% fees. Support for Visa, MasterCard, Uzcard, and Humo cards has been added.",
    createdAt: "2024-01-14T10:00:00Z",
  },
  {
    id: "3",
    title: "Monthly Trading Competition",
    content:
      "Join our monthly trading competition starting February 1st. Top 10 traders will receive bonus ScoreX points and exclusive badges.",
    createdAt: "2024-01-13T09:00:00Z",
  },
]

// Helper functions
export function calculatePotentialProfit(signal: Signal): number {
  return Number((((signal.tp1 - signal.entry) / signal.entry) * 100).toFixed(2))
}

export function calculatePotentialLoss(signal: Signal): number {
  return Number((((signal.entry - signal.sl) / signal.entry) * 100).toFixed(2))
}

export function calculateRiskRatio(signal: Signal): number {
  const profit = signal.tp1 - signal.entry
  const loss = signal.entry - signal.sl
  return loss > 0 ? Number((profit / loss).toFixed(2)) : 0
}

export function getFinalPrice(signal: Signal): number {
  if (signal.isFree) return 0
  if (signal.discountPercent > 0) {
    return Math.round(signal.price * (1 - signal.discountPercent / 100))
  }
  return signal.price
}

export function getResultOutcome(signal: Signal): { type: "profit" | "loss" | "neutral"; value: number } {
  if (signal.status === "TP1_HIT") {
    return { type: "profit", value: calculatePotentialProfit(signal) }
  }
  if (signal.status === "TP2_HIT") {
    const profit = ((signal.tp2 - signal.entry) / signal.entry) * 100
    return { type: "profit", value: Number(profit.toFixed(2)) }
  }
  if (signal.status === "SL_HIT") {
    return { type: "loss", value: calculatePotentialLoss(signal) }
  }
  return { type: "neutral", value: 0 }
}
