import { apiRequest } from "@/lib/api-client"

export interface Subscription {
  id: string
  traderId: string
  traderUsername: string
  bellSetting: "all" | "personalized" | "none"
  createdAt: string
}

export interface SubscriptionsResponse {
  subscriptions: Subscription[]
}

/**
 * Get current user's subscriptions
 * GET /me/subscriptions
 * No mock data fallback - throws on API error
 * Requires authentication
 */
export async function getMySubscriptions(token: string): Promise<SubscriptionsResponse> {
  return await apiRequest<SubscriptionsResponse>({
    method: "GET",
    path: "/me/subscriptions",
    token,
    timeoutMs: 5000,
  })
}

/**
 * Subscribe to a trader
 * POST /traders/:username/subscribe
 * No mock data fallback - throws on API error
 * Requires authentication
 */
export async function subscribeToTrader(
  username: string, 
  token: string
): Promise<{ success: boolean }> {
  return await apiRequest<{ success: boolean }>({
    method: "POST",
    path: `/traders/${username}/subscribe`,
    token,
    timeoutMs: 5000,
  })
}

/**
 * Unsubscribe from a trader
 * DELETE /traders/:username/subscribe
 * No mock data fallback - throws on API error
 * Requires authentication
 */
export async function unsubscribeFromTrader(
  username: string, 
  token: string
): Promise<{ success: boolean }> {
  return await apiRequest<{ success: boolean }>({
    method: "DELETE",
    path: `/traders/${username}/subscribe`,
    token,
    timeoutMs: 5000,
  })
}

/**
 * Update bell notification setting for a subscription
 * PATCH /traders/:username/subscribe
 * No mock data fallback - throws on API error
 * Requires authentication
 */
export async function updateBellSetting(
  username: string,
  setting: "all" | "personalized" | "none",
  token: string
): Promise<{ success: boolean }> {
  return await apiRequest<{ success: boolean }>({
    method: "PATCH",
    path: `/traders/${username}/subscribe`,
    token,
    body: { bellSetting: setting },
    timeoutMs: 5000,
  })
}
