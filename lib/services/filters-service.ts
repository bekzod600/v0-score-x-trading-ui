import { apiRequest } from "@/lib/api-client"

export interface SavedFilter {
  id: string
  name: string
  criteria: Record<string, unknown>
  createdAt: string
}

export interface FiltersResponse {
  filters: SavedFilter[]
}

export interface CreateFilterPayload {
  name: string
  criteria: Record<string, unknown>
}

export interface CreateFilterResponse {
  filter: SavedFilter
}

/**
 * List saved filters for authenticated user
 * GET /filters
 * No mock data fallback - throws on API error
 * Requires authentication
 */
export async function listFilters(token: string): Promise<FiltersResponse> {
  return await apiRequest<FiltersResponse>({
    method: "GET",
    path: "/filters",
    token,
    timeoutMs: 5000,
  })
}

/**
 * Create a new saved filter
 * POST /filters
 * No mock data fallback - throws on API error
 * Requires authentication
 */
export async function createFilter(payload: CreateFilterPayload, token: string): Promise<CreateFilterResponse> {
  return await apiRequest<CreateFilterResponse>({
    method: "POST",
    path: "/filters",
    token,
    body: payload,
    timeoutMs: 5000,
  })
}
