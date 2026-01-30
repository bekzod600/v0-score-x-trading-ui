import { apiRequest } from "@/lib/api-client"

export interface WalletResponse {
  balance: number
  currency: string
}

export interface WalletTransaction {
  id: string
  type: "top-up" | "purchase" | "refund" | "withdrawal"
  amount: number
  fee: number
  creditedAmount: number
  status: "completed" | "pending" | "rejected"
  description: string
  createdAt: string
}

export interface WalletTransactionsResponse {
  transactions: WalletTransaction[]
}

/**
 * Get wallet balance for authenticated user
 * GET /wallet
 * No mock data fallback - throws on API error
 * Requires authentication
 */
export async function getWallet(token: string): Promise<WalletResponse> {
  return await apiRequest<WalletResponse>({
    method: "GET",
    path: "/wallet",
    token,
    timeoutMs: 5000,
  })
}

/**
 * Get wallet transaction history
 * GET /wallet/transactions
 * No mock data fallback - throws on API error
 * Requires authentication
 */
export async function getWalletTransactions(token: string): Promise<WalletTransactionsResponse> {
  return await apiRequest<WalletTransactionsResponse>({
    method: "GET",
    path: "/wallet/transactions",
    token,
    timeoutMs: 5000,
  })
}
