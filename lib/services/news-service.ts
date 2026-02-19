import { apiRequest } from "@/lib/api-client"

// ==========================================
// TYPES
// ==========================================

export interface NewsPost {
  id: string
  title: string
  summary: string
  content: string
  cover_image: string | null
  published: boolean
  author_id: string
  author_username: string
  created_at: string
  updated_at: string
}

export interface NewsListResponse {
  posts: NewsPost[]
  total: number
  page: number
  limit: number
}

export interface CreateNewsPayload {
  title: string
  summary: string
  content: string
  cover_image?: string
  published?: boolean
}

export interface UpdateNewsPayload {
  title?: string
  summary?: string
  content?: string
  cover_image?: string
  published?: boolean
}

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================

export async function listNews(params?: {
  page?: number
  limit?: number
}): Promise<NewsListResponse> {
  const page = params?.page ?? 1
  const limit = params?.limit ?? 20
  return apiRequest<NewsListResponse>({
    method: "GET",
    path: `/news?page=${page}&limit=${limit}`,
    timeoutMs: 10000,
  })
}

export async function getNews(id: string): Promise<NewsPost> {
  return apiRequest<NewsPost>({
    method: "GET",
    path: `/news/${id}`,
    timeoutMs: 10000,
  })
}

// ==========================================
// ADMIN ENDPOINTS (token required)
// ==========================================

export async function adminListNews(
  token: string,
  params?: { page?: number; limit?: number }
): Promise<NewsListResponse> {
  const page = params?.page ?? 1
  const limit = params?.limit ?? 50
  return apiRequest<NewsListResponse>({
    method: "GET",
    path: `/admin/news?page=${page}&limit=${limit}`,
    token,
  })
}

export async function adminGetNews(
  token: string,
  id: string
): Promise<NewsPost> {
  return apiRequest<NewsPost>({
    method: "GET",
    path: `/admin/news/${id}`,
    token,
  })
}

export async function adminCreateNews(
  token: string,
  payload: CreateNewsPayload
): Promise<NewsPost> {
  return apiRequest<NewsPost>({
    method: "POST",
    path: "/admin/news",
    token,
    body: payload,
  })
}

export async function adminUpdateNews(
  token: string,
  id: string,
  payload: UpdateNewsPayload
): Promise<NewsPost> {
  return apiRequest<NewsPost>({
    method: "PATCH",
    path: `/admin/news/${id}`,
    token,
    body: payload,
  })
}

export async function adminTogglePublish(
  token: string,
  id: string
): Promise<NewsPost> {
  return apiRequest<NewsPost>({
    method: "PATCH",
    path: `/admin/news/${id}/toggle-publish`,
    token,
  })
}

export async function adminDeleteNews(
  token: string,
  id: string
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>({
    method: "DELETE",
    path: `/admin/news/${id}`,
    token,
  })
}
