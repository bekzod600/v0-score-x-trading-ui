import { apiRequest } from "@/lib/api-client"

// Types for Telegram auth endpoints
export interface TelegramInitiateResponse {
  loginId: string
  deepLink: string
  botUsername: string
  expiresIn: number // seconds
}

export interface TelegramStatusResponse {
  status: "PENDING" | "CONFIRMED" | "EXPIRED"
  accessToken?: string
  user?: {
    id: string
    username: string
    displayName?: string
    avatar?: string
    scoreXPoints?: number
  }
}

/**
 * Initiate Telegram login flow
 * POST /auth/telegram/initiate
 */
export async function initiateTelegramLogin(): Promise<TelegramInitiateResponse> {
  return apiRequest<TelegramInitiateResponse>({
    method: "POST",
    path: "/auth/telegram/initiate",
  })
}

/**
 * Check Telegram login status
 * GET /auth/telegram/status/:loginId
 */
export async function getTelegramStatus(loginId: string): Promise<TelegramStatusResponse> {
  return apiRequest<TelegramStatusResponse>({
    method: "GET",
    path: `/auth/telegram/status/${loginId}`,
  })
}

/**
 * Get current authenticated user info
 * GET /auth/me
 * Requires authentication token
 */
export async function getCurrentUser(token: string): Promise<{
  id: string
  username: string
  displayName?: string
  avatar?: string
  scoreXPoints?: number
}> {
  return apiRequest({
    method: "GET",
    path: "/auth/me",
    token,
  })
}

/**
 * Logout (invalidate token)
 * POST /auth/logout
 * Requires authentication token
 */
export async function logout(token: string): Promise<{ success: boolean }> {
  return apiRequest({
    method: "POST",
    path: "/auth/logout",
    token,
  })
}
