// lib/services/training-centers-service.ts
// Real API integration — mock datadan to'liq ajratilgan

import { apiRequest } from "@/lib/api-client"

// ============================================================
// TYPES
// ============================================================

export interface CenterOwner {
  id: string
  username: string
  avatar: string | null
}

export interface CenterStudent {
  user_id: string
  username: string
  avatar: string | null
  enrolled_at: string
}

export interface TrainingCenter {
  id: string
  owner: CenterOwner
  name: string
  description: string
  city: string | null
  address: string | null
  phone: string | null
  telegram: string | null
  website: string | null
  logo_url: string | null
  status: "pending" | "approved" | "rejected"
  is_listed: boolean
  rating: number
  rating_count: number
  students_count: number
  rejection_reason: string | null
  approved_at: string | null
  created_at: string
  // Auth context (optional — faqat login qilgan bo'lsa)
  is_enrolled?: boolean
  user_rating?: number | null
  students?: CenterStudent[]
}

export interface CentersListResponse {
  centers: TrainingCenter[]
  total: number
  page: number
  limit: number
}

export interface RegisterCenterPayload {
  name: string
  description: string
  city: string
  address?: string
  phone: string
  telegram?: string
  website?: string
  logo_url?: string
}

export interface UpdateCenterPayload {
  description?: string
  address?: string
  phone?: string
  telegram?: string
  website?: string
  logo_url?: string
}

// ============================================================
// PUBLIC API — auth shart emas
// ============================================================

/**
 * GET /training-centers
 * Tasdiqlangan markazlar ro'yxati (search, filter, sort)
 */
export async function listCenters(params?: {
  page?: number
  limit?: number
  search?: string
  city?: string
  sort?: "rating" | "students" | "newest"
  token?: string | null
}): Promise<CentersListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.limit) searchParams.set("limit", String(params.limit))
  if (params?.search) searchParams.set("search", params.search)
  if (params?.city && params.city !== "all") searchParams.set("city", params.city)
  if (params?.sort) searchParams.set("sort", params.sort)

  const query = searchParams.toString()
  return apiRequest<CentersListResponse>({
    method: "GET",
    path: `/training-centers${query ? `?${query}` : ""}`,
    token: params?.token ?? undefined,
    timeoutMs: 10000,
  })
}

/**
 * GET /training-centers/:id
 * Bitta markaz detallari (faqat approved+listed)
 * Token ixtiyoriy — enrollment va user_rating konteksti uchun
 */
export async function getCenter(
  id: string,
  token?: string | null
): Promise<TrainingCenter> {
  return apiRequest<TrainingCenter>({
    method: "GET",
    path: `/training-centers/${id}`,
    token: token ?? undefined,
    timeoutMs: 10000,
  })
}

// ============================================================
// AUTH API — JWT talab qiladi
// ============================================================

/**
 * GET /training-centers/my
 * Owner o'z markazini ko'rish
 */
export async function getMyCenter(token: string): Promise<TrainingCenter | null> {
  try {
    return await apiRequest<TrainingCenter>({
      method: "GET",
      path: "/training-centers/my",
      token,
      timeoutMs: 10000,
    })
  } catch (err: unknown) {
    // 404 = markaz yo'q
    if (err && typeof err === "object" && "status" in err && (err as { status: number }).status === 404) return null
    throw err
  }
}

/**
 * POST /training-centers
 * Yangi markaz ro'yxatdan o'tkazish
 */
export async function registerCenter(
  token: string,
  payload: RegisterCenterPayload
): Promise<TrainingCenter> {
  return apiRequest<TrainingCenter>({
    method: "POST",
    path: "/training-centers",
    token,
    body: payload,
    timeoutMs: 15000,
  })
}

/**
 * PATCH /training-centers/my
 * Owner o'z markazini yangilashi
 */
export async function updateMyCenter(
  token: string,
  payload: UpdateCenterPayload
): Promise<TrainingCenter> {
  return apiRequest<TrainingCenter>({
    method: "PATCH",
    path: "/training-centers/my",
    token,
    body: payload,
    timeoutMs: 15000,
  })
}

/**
 * POST /training-centers/:id/enroll
 * "Men shu yerda o'qidim" belgisi qo'yish
 */
export async function enrollCenter(
  token: string,
  centerId: string
): Promise<{ enrolled: boolean; students_count: number }> {
  return apiRequest({
    method: "POST",
    path: `/training-centers/${centerId}/enroll`,
    token,
    timeoutMs: 10000,
  })
}

/**
 * DELETE /training-centers/:id/enroll
 * Belgi olib tashlash
 */
export async function unenrollCenter(
  token: string,
  centerId: string
): Promise<{ enrolled: boolean; students_count: number }> {
  return apiRequest({
    method: "DELETE",
    path: `/training-centers/${centerId}/enroll`,
    token,
    timeoutMs: 10000,
  })
}

/**
 * POST /training-centers/:id/rate
 * 1-5 yulduz reyting berish
 */
export async function rateCenter(
  token: string,
  centerId: string,
  rating: number
): Promise<{ rating: number; rating_count: number; user_rating: number }> {
  return apiRequest({
    method: "POST",
    path: `/training-centers/${centerId}/rate`,
    token,
    body: { rating },
    timeoutMs: 10000,
  })
}

// ============================================================
// ADMIN API — admin/super_admin JWT talab qiladi
// ============================================================

/**
 * GET /admin/training-centers
 * Barcha markazlar (status filter bilan)
 */
export async function adminListCenters(
  token: string,
  params?: {
    page?: number
    limit?: number
    status?: "pending" | "approved" | "rejected" | "all"
    search?: string
  }
): Promise<CentersListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.limit) searchParams.set("limit", String(params.limit))
  if (params?.status && params.status !== "all") searchParams.set("status", params.status)
  if (params?.search) searchParams.set("search", params.search)

  const query = searchParams.toString()
  return apiRequest<CentersListResponse>({
    method: "GET",
    path: `/admin/training-centers${query ? `?${query}` : ""}`,
    token,
    timeoutMs: 10000,
  })
}

/**
 * PATCH /admin/training-centers/:id/approve
 * Markazni tasdiqlash
 */
export async function adminApproveCenter(
  token: string,
  id: string
): Promise<TrainingCenter> {
  return apiRequest<TrainingCenter>({
    method: "PATCH",
    path: `/admin/training-centers/${id}/approve`,
    token,
    timeoutMs: 10000,
  })
}

/**
 * PATCH /admin/training-centers/:id/reject
 * Markazni rad etish
 */
export async function adminRejectCenter(
  token: string,
  id: string,
  reason?: string
): Promise<TrainingCenter> {
  return apiRequest<TrainingCenter>({
    method: "PATCH",
    path: `/admin/training-centers/${id}/reject`,
    token,
    body: { reason },
    timeoutMs: 10000,
  })
}

/**
 * PATCH /admin/training-centers/:id/toggle-listing
 * Ko'rinishini yoqish/o'chirish
 */
export async function adminToggleListing(
  token: string,
  id: string
): Promise<TrainingCenter> {
  return apiRequest<TrainingCenter>({
    method: "PATCH",
    path: `/admin/training-centers/${id}/toggle-listing`,
    token,
    timeoutMs: 10000,
  })
}
