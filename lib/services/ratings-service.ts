import { apiRequest } from "@/lib/api-client"

/**
 * Rate a trader
 * POST /traders/:username/rate
 * No mock data fallback - throws on API error
 * Requires authentication
 */
export async function rateTrader(
  username: string,
  stars: number,
  token: string
): Promise<{ success: boolean; newAvgStars: number }> {
  return await apiRequest({
    method: "POST",
    path: `/traders/${username}/rate`,
    token,
    body: { stars },
    timeoutMs: 5000,
  })
}

/**
 * Get user's rating for a trader
 * GET /traders/:username/my-rating
 * No mock data fallback - throws on API error
 * Requires authentication
 */
export async function getMyTraderRating(
  username: string,
  token: string
): Promise<{ stars: number | null }> {
  return await apiRequest({
    method: "GET",
    path: `/traders/${username}/my-rating`,
    token,
    timeoutMs: 5000,
  })
}

/**
 * Vote on a signal (like/dislike)
 * POST /signals/:signalId/vote
 * No mock data fallback - throws on API error
 * Requires authentication
 */
export async function voteSignal(
  signalId: string,
  vote: "like" | "dislike",
  token: string
): Promise<{ success: boolean; likes: number; dislikes: number }> {
  return await apiRequest({
    method: "POST",
    path: `/signals/${signalId}/vote`,
    token,
    body: { vote },
    timeoutMs: 5000,
  })
}

/**
 * Remove vote from a signal
 * DELETE /signals/:signalId/vote
 * No mock data fallback - throws on API error
 * Requires authentication
 */
export async function removeVote(
  signalId: string,
  token: string
): Promise<{ success: boolean }> {
  return await apiRequest({
    method: "DELETE",
    path: `/signals/${signalId}/vote`,
    token,
    timeoutMs: 5000,
  })
}
