import { apiRequest } from "@/lib/api-client"

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
  // Backend calculated fields (ALWAYS present, even for locked signals)
  potentialProfit: number  // e.g. 15.5 means +15.5%
  potentialLoss: number    // e.g. 5.2 means -5.2%
  riskRatio: number        // e.g. 2.98 means 2.98:1
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

export interface CreateSignalPayload {
  ticker: string
  ep: number        // entry price
  sl: number        // stop loss
  tp1: number       // take profit 1
  tp2?: number      // take profit 2 (optional)
  accessType: "FREE" | "PAID"
  price?: number    // required if PAID
}

export interface CreateSignalResponse {
  id: string
  ticker: string
  status: string
  createdAt: string
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
  // Backend calculated fields (always present)
  potential_profit?: number
  potentialProfit?: number
  potential_loss?: number
  potentialLoss?: number
  risk_ratio?: number
  riskRatio?: number
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
 * Parse a value to number, handling strings like "190.00"
 */
function toNumber(val: unknown): number {
  if (val === null || val === undefined) return 0
  if (typeof val === "number") return val
  if (typeof val === "string") {
    const parsed = parseFloat(val)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

function toNumberOrNull(val: unknown): number | null {
  if (val === null || val === undefined) return null
  if (typeof val === "number") return val
  if (typeof val === "string") {
    const parsed = parseFloat(val)
    return isNaN(parsed) ? null : parsed
  }
  return null
}

/**
 * Map backend status to frontend status
 * Backend may use different status strings like "WAIT_EP" instead of "WAITING_ENTRY"
 */
function normalizeStatus(status: string | undefined | null): ApiSignal["status"] {
  if (!status) return "WAITING_ENTRY"
  const statusMap: Record<string, ApiSignal["status"]> = {
    "WAIT_EP": "WAITING_ENTRY",
    "WAITING_ENTRY": "WAITING_ENTRY",
    "ACTIVE": "ACTIVE",
    "TP1_HIT": "TP1_HIT",
    "TP2_HIT": "TP2_HIT",
    "SL_HIT": "SL_HIT",
    "HOLD": "HOLD",
    "CANCEL": "CANCEL",
    "CANCELLED": "CANCEL",
  }
  return statusMap[status.toUpperCase()] || "WAITING_ENTRY"
}

// Status mapper function qo'shamiz
function mapIslamiclyStatus(status: string | undefined): ApiSignal["islamiclyStatus"] {
  const normalized = (status || "").toUpperCase()
  switch (normalized) {
    case "COMPLIANT": return "COMPLIANT"
    case "NON_COMPLIANT": return "NON_COMPLIANT"
    case "NOT_COVERED":
    default: return "NOT_COVERED"
  }
}

function mapMusaffaStatus(status: string | undefined): ApiSignal["musaffaStatus"] {
  const normalized = (status || "").toUpperCase()
  switch (normalized) {
    case "COMPLIANT": return "COMPLIANT"
    case "NON_COMPLIANT": return "NON_COMPLIANT"
    case "NOT_COVERED":
    default: return "NOT_COVERED"
  }
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
    entry: toNumberOrNull(raw.entry ?? raw.ep),
    tp1: toNumberOrNull(raw.tp1),
    tp2: toNumberOrNull(raw.tp2),
    sl: toNumberOrNull(raw.sl),
    currentPrice: toNumber(raw.currentPrice ?? raw.current_price),
    status: normalizeStatus(raw.status),
    isFree,
    price: toNumber(raw.price),
    discountPercent: toNumber(raw.discountPercent ?? raw.discount_percent),
    islamiclyStatus: mapIslamiclyStatus(raw.islamiclyStatus ?? raw.islamicly_status),
    musaffaStatus: mapMusaffaStatus(raw.musaffaStatus ?? raw.musaffa_status),
    trader: {
      id: trader.id || "",
      username: trader.username || "Unknown",
      avatar: trader.avatar || "",
      scoreXPoints: toNumber(trader.scoreXPoints ?? trader.score_x_points),
      rank: toNumber(trader.rank),
      avgStars: toNumber(trader.avgStars ?? trader.avg_stars),
      totalPLPercent: toNumber(trader.totalPLPercent ?? trader.total_pl_percent),
      totalSignals: toNumber(trader.totalSignals ?? trader.total_signals),
      subscribers: toNumber(trader.subscribers),
      avgDaysToResult: toNumber(trader.avgDaysToResult ?? trader.avg_days_to_result),
    },
    likes: toNumber(raw.likes),
    dislikes: toNumber(raw.dislikes),
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    closedAt: raw.closedAt ?? raw.closed_at ?? null,
    isLocked,
    isPurchased,
    // Backend calculated fields (always present)
    potentialProfit: toNumber(raw.potentialProfit ?? raw.potential_profit),
    potentialLoss: toNumber(raw.potentialLoss ?? raw.potential_loss),
    riskRatio: toNumber(raw.riskRatio ?? raw.risk_ratio),
  }
}

/**
 * Fetch list of signals from backend
 * GET /signals?tab=live (default) or GET /signals?tab=results
 * No mock data fallback - throws on API error
 */
export async function listSignals(params?: {
  tab?: "live" | "results"
  page?: number
  limit?: number
}): Promise<SignalsListResponse> {
  const searchParams = new URLSearchParams()
  // Always set tab parameter, defaulting to "live"
  searchParams.set("tab", params?.tab || "live")
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.limit) searchParams.set("limit", String(params.limit))

  const query = searchParams.toString()
  const path = `/signals?${query}`

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

/**
 * Fetch traders leaderboard
 * GET /traders or GET /leaderboard
 * No mock data fallback - throws on API error
 */
export async function listTraders(params?: {
  sortBy?: "scorex" | "profit" | "stars"
  page?: number
  limit?: number
}): Promise<{ traders: ApiTrader[]; total: number }> {
  const searchParams = new URLSearchParams()
  if (params?.sortBy) searchParams.set("sortBy", params.sortBy)
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.limit) searchParams.set("limit", String(params.limit))

  const query = searchParams.toString()
  const path = `/traders${query ? `?${query}` : ""}`

  const response = await apiRequest<ApiTrader[] | { traders: ApiTrader[]; total?: number }>({
    method: "GET",
    path,
    timeoutMs: 10000,
  })

  if (Array.isArray(response)) {
    return { traders: response, total: response.length }
  }

  return {
    traders: response.traders || [],
    total: response.total ?? (response.traders?.length || 0),
  }
}

/**
 * Fetch trader profile by username
 * GET /traders/:username or GET /users/:username
 * No mock data fallback - throws on API error
 */
export async function getTraderByUsername(username: string): Promise<ApiTrader> {
  return await apiRequest<ApiTrader>({
    method: "GET",
    path: `/traders/${username}`,
    timeoutMs: 10000,
  })
}

/**
 * Fetch signals by trader
 * GET /traders/:username/signals
 * No mock data fallback - throws on API error
 */
export async function getTraderSignals(username: string, params?: {
  tab?: "live" | "results"
}): Promise<SignalsListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.tab) searchParams.set("tab", params.tab)
  
  const query = searchParams.toString()
  const path = `/traders/${username}/signals${query ? `?${query}` : ""}`

  const response = await apiRequest<RawApiSignal[] | { signals: RawApiSignal[]; total?: number }>({
    method: "GET",
    path,
    timeoutMs: 10000,
  })

  let rawSignals: RawApiSignal[] = []
  let total = 0
  
  if (Array.isArray(response)) {
    rawSignals = response
    total = response.length
  } else if (response && typeof response === "object") {
    rawSignals = Array.isArray(response.signals) ? response.signals : []
    total = response.total ?? rawSignals.length
  }

  const signals = rawSignals
    .filter((s): s is RawApiSignal => s !== null && s !== undefined && typeof s === "object" && "id" in s)
    .map(normalizeSignal)

  return { signals, total, page: 1, limit: 50 }
}

/**
 * Fetch user's own signals (requires auth)
 * GET /me/signals
 * No mock data fallback - throws on API error
 */
export async function getMySignals(token: string, params?: {
  tab?: "live" | "results"
}): Promise<SignalsListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.tab) {
    searchParams.set("tab", params.tab)
  }
  // tab yo'q bo'lsa backend barcha signallarni qaytaradi

  const query = searchParams.toString()
  const path = `/me/signals${query ? `?${query}` : ""}`

  const response = await apiRequest<RawApiSignal[] | { signals: RawApiSignal[]; total?: number }>({
    method: "GET",
    path,
    token,
    timeoutMs: 10000,
  })

  let rawSignals: RawApiSignal[] = []
  let total = 0
  
  if (Array.isArray(response)) {
    rawSignals = response
    total = response.length
  } else if (response && typeof response === "object") {
    rawSignals = Array.isArray(response.signals) ? response.signals : []
    total = response.total ?? rawSignals.length
  }

  const signals = rawSignals
    .filter((s): s is RawApiSignal => s !== null && s !== undefined && typeof s === "object" && "id" in s)
    .map(normalizeSignal)

  return { signals, total, page: 1, limit: 50 }
}

/**
 * Create a new signal
 * POST /signals
 * No mock data fallback - throws on API error
 * Requires authentication
 */
export async function createSignal(
  payload: CreateSignalPayload,
  token: string
): Promise<CreateSignalResponse> {
  return await apiRequest<CreateSignalResponse>({
    method: "POST",
    path: "/signals",
    token,
    body: payload,
    timeoutMs: 10000,
  })
}
