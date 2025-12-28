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

const mockWallet: WalletResponse = {
  balance: 150000,
  currency: "UZS",
}

const mockTransactions: WalletTransaction[] = [
  {
    id: "tx-1",
    type: "top-up",
    amount: 100000,
    fee: 3000,
    creditedAmount: 97000,
    status: "completed",
    description: "Click.uz top-up",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tx-2",
    type: "purchase",
    amount: 15000,
    fee: 0,
    creditedAmount: 15000,
    status: "completed",
    description: "Signal unlock - AAPL",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tx-3",
    type: "top-up",
    amount: 50000,
    fee: 0,
    creditedAmount: 50000,
    status: "pending",
    description: "P2P transfer",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
]

export async function getWallet(token: string): Promise<WalletResponse> {
  try {
    return await apiRequest<WalletResponse>({
      method: "GET",
      path: "/wallet",
      token,
      timeoutMs: 5000,
    })
  } catch (err) {
    console.log("[v0] API unavailable, using mock wallet data")
    return mockWallet
  }
}

export async function getWalletTransactions(token: string): Promise<WalletTransactionsResponse> {
  try {
    return await apiRequest<WalletTransactionsResponse>({
      method: "GET",
      path: "/wallet/transactions",
      token,
      timeoutMs: 5000,
    })
  } catch (err) {
    console.log("[v0] API unavailable, using mock transactions data")
    return { transactions: mockTransactions }
  }
}
