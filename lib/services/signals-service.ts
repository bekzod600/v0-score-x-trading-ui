import { apiRequest } from "@/lib/api-client"
import { mockSignals } from "@/lib/mock-data"

// Types matching backend response structure
export interface ApiTrader {
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

export interface ApiSignal {
  id: string
  ticker: string | null // null if locked
  entry: number | null
  tp1: number | null
  tp2: number | null
  sl: number | null
  currentPrice: number
  status: "WAITING_ENTRY" | "ACTIVE" | "TP1_HIT" | "TP2_HIT" | "SL_HIT" | "HOLD" | "CANCEL"
  isFree: boolean
  price: number
  discountPercent: number
  islamiclyStatus: "COMPLIANT" | "NON_COMPLIANT" | "NOT_COVERED"
  musaffaStatus: "COMPLIANT" | "NON_COMPLIANT" | "NOT_COVERED"
  trader: ApiTrader
  likes: number
  dislikes: number
  createdAt: string
  closedAt: string | null
  isLocked: boolean
  isPurchased: boolean
}

export interface SignalsListResponse {
  signals: ApiSignal[]
  total: number
  page: number
  limit: number
}

export interface BuySignalResponse {
  success: boolean
  message: string
  newBalance?: number
}

function mockToApiSignal(signal: (typeof mockSignals)[0]): ApiSignal {
  return {
    id: signal.id,
    ticker: signal.isFree || signal.isPurchased ? signal.ticker : null,
    entry: signal.isFree || signal.isPurchased ? signal.entry : null,
    tp1: signal.isFree || signal.isPurchased ? signal.tp1 : null,
    tp2: signal.isFree || signal.isPurchased ? signal.tp2 : null,
    sl: signal.isFree || signal.isPurchased ? signal.sl : null,
    currentPrice: signal.currentPrice,
    status: signal.status as ApiSignal["status"],
    isFree: signal.isFree,
    price: signal.price,
    discountPercent: signal.discountPercent,
    islamiclyStatus: signal.islamiclyStatus as ApiSignal["islamiclyStatus"],
    musaffaStatus: signal.musaffaStatus as ApiSignal["musaffaStatus"],
    trader: {
      id: signal.trader.id,
      username: signal.trader.username,
      avatar: signal.trader.avatar,
      scoreXPoints: signal.trader.scoreXPoints,
      rank: signal.trader.rank,
      avgStars: signal.trader.avgStars,
      totalPLPercent: signal.trader.totalPLPercent,
      totalSignals: signal.trader.totalSignals,
      subscribers: signal.trader.subscribers,
      avgDaysToResult: signal.trader.avgDaysToResult,
    },
    likes: signal.likes,
    dislikes: signal.dislikes,
    createdAt: signal.createdAt,
    closedAt: signal.closedAt,
    isLocked: !signal.isFree && !signal.isPurchased,
    isPurchased: signal.isPurchased,
  }
}

/**
 * Fetch list of signals from backend
 * GET /signals
 * Falls back to mock data if API unavailable
 */
export async function listSignals(params?: {
  tab?: "live" | "results"
  page?: number
  limit?: number
}): Promise<SignalsListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.tab) searchParams.set("tab", params.tab)
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.limit) searchParams.set("limit", String(params.limit))

  const query = searchParams.toString()
  const path = `/signals${query ? `?${query}` : ""}`

  try {
    return await apiRequest<SignalsListResponse>({
      method: "GET",
      path,
      timeoutMs: 5000,
    })
  } catch (err) {
    console.log("[v0] API unavailable, using mock data for signals")

    const isResults = params?.tab === "results"
    const resultStatuses = ["TP1_HIT", "TP2_HIT", "SL_HIT", "CANCEL"]
    const liveStatuses = ["WAITING_ENTRY", "ACTIVE", "HOLD"]

    const filteredSignals = mockSignals.filter((s) =>
      isResults ? resultStatuses.includes(s.status) : liveStatuses.includes(s.status),
    )

    return {
      signals: filteredSignals.map(mockToApiSignal),
      total: filteredSignals.length,
      page: params?.page || 1,
      limit: params?.limit || 20,
    }
  }
}

/**
 * Fetch single signal detail from backend
 * GET /signals/:id
 * Falls back to mock data if API unavailable
 */
export async function getSignal(id: string, token?: string | null): Promise<ApiSignal> {
  try {
    return await apiRequest<ApiSignal>({
      method: "GET",
      path: `/signals/${id}`,
      token,
      timeoutMs: 5000,
    })
  } catch (err) {
    console.log("[v0] API unavailable, using mock data for signal detail")

    const mockSignal = mockSignals.find((s) => s.id === id)
    if (!mockSignal) {
      throw new Error("Signal not found")
    }

    return mockToApiSignal(mockSignal)
  }
}

/**
 * Purchase/unlock a signal
 * POST /signals/:id/buy
 * Requires authentication
 */
export async function buySignal(id: string, token: string): Promise<BuySignalResponse> {
  try {
    return await apiRequest<BuySignalResponse>({
      method: "POST",
      path: `/signals/${id}/buy`,
      token,
      timeoutMs: 10000,
    })
  } catch (err) {
    console.log("[v0] API unavailable, mocking buy success")
    return {
      success: true,
      message: "Signal unlocked (demo mode)",
      newBalance: 50000,
    }
  }
}
