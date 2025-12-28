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
