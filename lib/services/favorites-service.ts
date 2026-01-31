import { apiRequest } from "@/lib/api-client"
import { type ApiSignal } from "./signals-service"

export interface FavoritesResponse {
  favorites: ApiSignal[]
}

/**
 * Get user's favorite signals
 * GET /me/favorites
 * No mock data fallback - throws on API error
 * Requires authentication
 */
export async function getMyFavorites(token: string): Promise<FavoritesResponse> {
  return await apiRequest<FavoritesResponse>({
    method: "GET",
    path: "/me/favorites",
    token,
    timeoutMs: 5000,
  })
}

/**
 * Add a signal to favorites
 * POST /signals/:id/favorite
 * No mock data fallback - throws on API error
 * Requires authentication
 */
export async function addFavorite(
  signalId: string,
  token: string
): Promise<{ success: boolean }> {
  return await apiRequest({
    method: "POST",
    path: `/signals/${signalId}/favorite`,
    token,
    timeoutMs: 5000,
  })
}

/**
 * Remove a signal from favorites
 * DELETE /signals/:id/favorite
 * No mock data fallback - throws on API error
 * Requires authentication
 */
export async function removeFavorite(
  signalId: string,
  token: string
): Promise<{ success: boolean }> {
  return await apiRequest({
    method: "DELETE",
    path: `/signals/${signalId}/favorite`,
    token,
    timeoutMs: 5000,
  })
}
