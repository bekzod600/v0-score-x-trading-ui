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

const STORAGE_KEY = "scorex_saved_filters"

function getStoredFilters(): SavedFilter[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function storeFilter(filter: SavedFilter): void {
  if (typeof window === "undefined") return
  try {
    const filters = getStoredFilters()
    filters.push(filter)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
  } catch {
    // ignore storage errors
  }
}

export async function listFilters(token: string): Promise<FiltersResponse> {
  try {
    return await apiRequest<FiltersResponse>({
      method: "GET",
      path: "/filters",
      token,
      timeoutMs: 5000,
    })
  } catch (err) {
    console.log("[v0] API unavailable, using local saved filters")
    return { filters: getStoredFilters() }
  }
}

export async function createFilter(payload: CreateFilterPayload, token: string): Promise<CreateFilterResponse> {
  try {
    return await apiRequest<CreateFilterResponse>({
      method: "POST",
      path: "/filters",
      token,
      body: payload,
      timeoutMs: 5000,
    })
  } catch (err) {
    console.log("[v0] API unavailable, storing filter locally")
    const newFilter: SavedFilter = {
      id: `local-${Date.now()}`,
      name: payload.name,
      criteria: payload.criteria,
      createdAt: new Date().toISOString(),
    }
    storeFilter(newFilter)
    return { filter: newFilter }
  }
}
