"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import {
  initialWalletState,
  generateId,
  type WalletState,
  type Transaction,
  type Notification,
  type TransactionType,
  type TransactionMethod,
  type TransactionStatus,
} from "./wallet-store"

interface WalletContextType extends WalletState {
  // Top-up actions
  topUpClick: (amount: number) => void
  topUpP2P: (amount: number, cardType: string) => void
  // Purchase actions
  purchaseSignal: (signalId: string, price: number, ticker: string) => boolean
  purchaseSubscription: () => boolean
  // Subscription
  setAutoRenew: (enabled: boolean) => void
  // Notifications
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  clearNotifications: () => void
  // Signal check
  isSignalPurchased: (signalId: string) => boolean
}

const WalletContext = createContext<WalletContextType | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(initialWalletState)

  const addTransaction = useCallback(
    (
      type: TransactionType,
      method: TransactionMethod,
      amount: number,
      fee: number,
      status: TransactionStatus,
      description: string,
    ) => {
      const transaction: Transaction = {
        id: `tx-${generateId()}`,
        type,
        method,
        amount,
        fee,
        creditedAmount: amount - fee,
        status,
        description,
        createdAt: new Date().toISOString(),
      }
      setState((prev) => ({
        ...prev,
        transactions: [transaction, ...prev.transactions],
      }))
      return transaction
    },
    [],
  )

  const addNotification = useCallback((notification: Omit<Notification, "id" | "createdAt" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: `n-${generateId()}`,
      read: false,
      createdAt: new Date().toISOString(),
    }
    setState((prev) => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications],
    }))
  }, [])

  const topUpClick = useCallback(
    (amount: number) => {
      const fee = amount * 0.03
      const credited = amount - fee
      setState((prev) => ({
        ...prev,
        balance: prev.balance + credited,
      }))
      addTransaction("top-up", "click", amount, fee, "completed", "Top up via Click.uz")
      addNotification({
        title: "Top-up Successful",
        message: `$${credited.toFixed(2)} has been added to your wallet.`,
        type: "success",
        link: "/wallet",
      })
    },
    [addTransaction, addNotification],
  )

  const topUpP2P = useCallback(
    (amount: number, cardType: string) => {
      addTransaction("top-up", "p2p", amount, 0, "pending", `P2P transfer via ${cardType}`)
      addNotification({
        title: "P2P Payment Submitted",
        message: "Your payment will be verified shortly. Balance will update after admin approval.",
        type: "info",
        link: "/wallet",
      })
    },
    [addTransaction, addNotification],
  )

  const purchaseSignal = useCallback(
    (signalId: string, price: number, ticker: string): boolean => {
      if (state.balance < price) {
        addNotification({
          title: "Insufficient Balance",
          message: "Please top up your wallet to unlock this signal.",
          type: "warning",
          link: "/wallet",
        })
        return false
      }
      setState((prev) => ({
        ...prev,
        balance: prev.balance - price,
        purchasedSignals: [...prev.purchasedSignals, signalId],
      }))
      addTransaction("purchase", "wallet", price, 0, "completed", `Signal unlock - ${ticker}`)
      addNotification({
        title: "Signal Unlocked",
        message: `You have unlocked the ${ticker} signal.`,
        type: "success",
        link: `/signals/${signalId}`,
      })
      return true
    },
    [state.balance, addTransaction, addNotification],
  )

  const purchaseSubscription = useCallback((): boolean => {
    const premiumPrice = 29.99
    if (state.balance < premiumPrice) {
      addNotification({
        title: "Insufficient Balance",
        message: "Please top up your wallet to purchase Premium.",
        type: "warning",
        link: "/wallet",
      })
      return false
    }
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 1)
    setState((prev) => ({
      ...prev,
      balance: prev.balance - premiumPrice,
      subscription: {
        ...prev.subscription,
        plan: "premium",
        expiresAt: expiresAt.toISOString(),
      },
    }))
    addTransaction("subscription", "wallet", premiumPrice, 0, "completed", "Premium subscription (1 month)")
    addNotification({
      title: "Welcome to Premium!",
      message: "You now have access to all premium features for 1 month.",
      type: "success",
    })
    return true
  }, [state.balance, addTransaction, addNotification])

  const setAutoRenew = useCallback((enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      subscription: {
        ...prev.subscription,
        autoRenew: enabled,
      },
    }))
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }))
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }))
  }, [])

  const clearNotifications = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: [],
    }))
  }, [])

  const isSignalPurchased = useCallback(
    (signalId: string) => {
      return state.purchasedSignals.includes(signalId)
    },
    [state.purchasedSignals],
  )

  return (
    <WalletContext.Provider
      value={{
        ...state,
        topUpClick,
        topUpP2P,
        purchaseSignal,
        purchaseSubscription,
        setAutoRenew,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        isSignalPurchased,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
