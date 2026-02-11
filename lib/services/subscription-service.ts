import { apiRequest } from "@/lib/api-client"

export interface SubscriptionStatus {
  plan: "free" | "premium"
  expiresAt: string | null
  autoRenew: boolean
  isActive: boolean
  daysRemaining: number | null
}

export interface PurchaseResult {
  success: boolean
  message: string
  newBalance: number
  subscription: SubscriptionStatus
}

/**
 * Get subscription status
 */
export async function getSubscriptionStatus(token: string): Promise<SubscriptionStatus> {
  return await apiRequest<SubscriptionStatus>({
    method: "GET",
    path: "/subscription",
    token,
    timeoutMs: 5000,
  })
}

/**
 * Purchase premium subscription ($2/month)
 */
export async function purchasePremium(token: string): Promise<PurchaseResult> {
  return await apiRequest<PurchaseResult>({
    method: "POST",
    path: "/subscription/purchase",
    token,
    timeoutMs: 10000,
  })
}

/**
 * Toggle auto-renew setting
 */
export async function setAutoRenew(token: string, enabled: boolean): Promise<{ success: boolean }> {
  return await apiRequest<{ success: boolean }>({
    method: "PATCH",
    path: "/subscription/auto-renew",
    token,
    body: { enabled },
    timeoutMs: 5000,
  })
}

/**
 * Cancel subscription (disable auto-renew)
 */
export async function cancelSubscription(token: string): Promise<{ success: boolean }> {
  return await apiRequest<{ success: boolean }>({
    method: "POST",
    path: "/subscription/cancel",
    token,
    timeoutMs: 5000,
  })
}
