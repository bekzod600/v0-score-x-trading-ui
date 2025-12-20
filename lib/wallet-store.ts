// Wallet state management using simple React context
export type TransactionType = "top-up" | "purchase" | "subscription"
export type TransactionMethod = "click" | "p2p" | "wallet"
export type TransactionStatus = "pending" | "completed" | "rejected"

export interface Transaction {
  id: string
  type: TransactionType
  method: TransactionMethod
  amount: number
  fee: number
  creditedAmount: number
  status: TransactionStatus
  description: string
  createdAt: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: "success" | "info" | "warning" | "error"
  read: boolean
  createdAt: string
  link?: string
}

export interface WalletState {
  balance: number
  transactions: Transaction[]
  notifications: Notification[]
  purchasedSignals: string[]
  subscription: {
    plan: "free" | "premium"
    autoRenew: boolean
    expiresAt: string | null
  }
}

// Initial mock data
export const initialWalletState: WalletState = {
  balance: 250.0,
  transactions: [
    {
      id: "tx-1",
      type: "top-up",
      method: "click",
      amount: 100,
      fee: 3,
      creditedAmount: 97,
      status: "completed",
      description: "Top up via Click.uz",
      createdAt: "2024-01-15T10:30:00Z",
    },
    {
      id: "tx-2",
      type: "purchase",
      method: "wallet",
      amount: 15,
      fee: 0,
      creditedAmount: 15,
      status: "completed",
      description: "Signal unlock - AAPL",
      createdAt: "2024-01-14T14:00:00Z",
    },
    {
      id: "tx-3",
      type: "top-up",
      method: "p2p",
      amount: 200,
      fee: 0,
      creditedAmount: 200,
      status: "completed",
      description: "P2P transfer via Uzcard",
      createdAt: "2024-01-10T09:00:00Z",
    },
  ],
  notifications: [
    {
      id: "n-1",
      title: "Welcome to ScoreX",
      message: "Your account is ready. Start exploring signals!",
      type: "success",
      read: true,
      createdAt: "2024-01-10T08:00:00Z",
    },
  ],
  purchasedSignals: ["1", "3", "5", "8", "9"],
  subscription: {
    plan: "free",
    autoRenew: false,
    expiresAt: null,
  },
}

// Helper to generate IDs
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}
