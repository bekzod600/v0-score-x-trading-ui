import { apiRequest } from "@/lib/api-client"
import type { mockSignals } from "@/lib/mock-data"

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

// Raw API response format (snake_case from backend)
interface RawApiSignal {
  id: string
  ticker?: string | null
  ep?: number | null
  entry?: number | null
  tp1?: number | null
  tp2?: number | null
  sl?: number | null
  current_price?: number
  currentPrice?: number
  status: string
  access_type?: string
  isFree?: boolean
  is_free?: boolean
  price?: number
  discount_percent?: number
  discountPercent?: number
  islamicly_status?: string
  islamiclyStatus?: string
  musaffa_status?: string
  musaffaStatus?: string
  trader?: RawApiTrader | null
  likes?: number
  dislikes?: number
  created_at?: string
  createdAt?: string
  closed_at?: string | null
  closedAt?: string | null
  isLocked?: boolean
  is_locked?: boolean
  is_purchased?: boolean
  isPurchased?: boolean
}

interface RawApiTrader {
  id?: string
  username?: string
  avatar?: string
  score_x_points?: number
  scoreXPoints?: number
  rank?: number
  avg_stars?: number
  avgStars?: number
  total_pl_percent?: number
  totalPLPercent?: number
  total_signals?: number
  totalSignals?: number
  subscribers?: number
  avg_days_to_result?: number
  avgDaysToResult?: number
}

/**
 * Transform raw API response (snake_case) to frontend format (camelCase)
 */
function normalizeSignal(raw: RawApiSignal): ApiSignal {
  const trader = raw.trader || {}
  const isFree = raw.isFree ?? raw.is_free ?? raw.access_type === "free" ?? false
  const isPurchased = raw.isPurchased ?? raw.is_purchased ?? false
  const isLocked = raw.isLocked ?? raw.is_locked ?? (!isFree && !isPurchased)
  
  return {
    id: raw.id,
    ticker: raw.ticker || null,
    entry: raw.entry ?? raw.ep ?? null,
    tp1: raw.tp1 ?? null,
    tp2: raw.tp2 ?? null,
    sl: raw.sl ?? null,
    currentPrice: raw.currentPrice ?? raw.current_price ?? 0,
    status: (raw.status || "WAITING_ENTRY") as ApiSignal["status"],
    isFree,
    price: raw.price ?? 0,
    discountPercent: raw.discountPercent ?? raw.discount_percent ?? 0,
    islamiclyStatus: (raw.islamiclyStatus ?? raw.islamicly_status ?? "NOT_COVERED") as ApiSignal["islamiclyStatus"],
    musaffaStatus: (raw.musaffaStatus ?? raw.musaffa_status ?? "NOT_COVERED") as ApiSignal["musaffaStatus"],
    trader: {
      id: trader.id || "",
      username: trader.username || "Unknown",
      avatar: trader.avatar || "",
      scoreXPoints: trader.scoreXPoints ?? trader.score_x_points ?? 0,
      rank: trader.rank ?? 0,
      avgStars: trader.avgStars ?? trader.avg_stars ?? 0,
      totalPLPercent: trader.totalPLPercent ?? trader.total_pl_percent ?? 0,
      totalSignals: trader.totalSignals ?? trader.total_signals ?? 0,
      subscribers: trader.subscribers ?? 0,
      avgDaysToResult: trader.avgDaysToResult ?? trader.avg_days_to_result ?? 0,
    },
    likes: raw.likes ?? 0,
    dislikes: raw.dislikes ?? 0,
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    closedAt: raw.closedAt ?? raw.closed_at ?? null,
    isLocked,
    isPurchased,
  }
}

/**
 * Fetch list of signals from backend
 * GET /signals
 * No mock data fallback - throws on API error
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

  // Backend may return array directly or { signals: [...] } format
  const response = await apiRequest<RawApiSignal[] | { signals: RawApiSignal[]; total?: number; page?: number; limit?: number }>({
    method: "GET",
    path,
    timeoutMs: 10000,
  })

  // Handle both array response and object response formats
  let rawSignals: RawApiSignal[] = []
  let total = 0
  let page = params?.page || 1
  let limit = params?.limit || 20
  
  if (Array.isArray(response)) {
    rawSignals = response
    total = response.length
  } else if (response && typeof response === "object") {
    rawSignals = Array.isArray(response.signals) ? response.signals : []
    total = response.total ?? rawSignals.length
    page = response.page ?? page
    limit = response.limit ?? limit
  }

  // Normalize all signals to frontend format
  const signals = rawSignals
    .filter((s): s is RawApiSignal => s !== null && s !== undefined && typeof s === "object" && "id" in s)
    .map(normalizeSignal)

  return { signals, total, page, limit }
}

/**
 * Fetch single signal detail from backend
 * GET /signals/:id
 * No mock data fallback - throws on API error
 * Token is optional - backend returns locked data for unauthenticated users
 */
export async function getSignal(id: string, token?: string | null): Promise<ApiSignal> {
  return await apiRequest<ApiSignal>({
    method: "GET",
    path: `/signals/${id}`,
    token: token || undefined,
    timeoutMs: 10000,
  })
}

/**
 * Purchase/unlock a signal
 * POST /signals/:id/buy
 * No mock data fallback - throws on API error
 * Requires authentication
 */
export async function buySignal(id: string, token: string): Promise<BuySignalResponse> {
  return await apiRequest<BuySignalResponse>({
    method: "POST",
    path: `/signals/${id}/buy`,
    token,
    timeoutMs: 15000,
  })
}
