// lib/services/training-centers-service.ts
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

export interface EnrollmentRequest {
  id: string
  center_id: string
  user_id: string
  username: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  reviewed_at: string | null
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
  // Auth context (faqat login qilgan foydalanuvchi uchun)
  is_enrolled?: boolean          // true = approved student
  is_request_pending?: boolean   // true = pending so'rov bor
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
// PUBLIC API
// ============================================================

export async function listCenters(params?: {
  page?: number; limit?: number; search?: string
  city?: string; sort?: "rating" | "students" | "newest"
  token?: string | null
}): Promise<CentersListResponse> {
  const sp = new URLSearchParams()
  if (params?.page) sp.set("page", String(params.page))
  if (params?.limit) sp.set("limit", String(params.limit))
  if (params?.search) sp.set("search", params.search)
  if (params?.city && params.city !== "all") sp.set("city", params.city)
  if (params?.sort) sp.set("sort", params.sort)
  const q = sp.toString()
  return apiRequest<CentersListResponse>({
    method: "GET",
    path: `/training-centers${q ? `?${q}` : ""}`,
    token: params?.token ?? undefined,
    timeoutMs: 10000,
  })
}

export async function getCenter(id: string, token?: string | null): Promise<TrainingCenter> {
  return apiRequest<TrainingCenter>({
    method: "GET",
    path: `/training-centers/${id}`,
    token: token ?? undefined,
    timeoutMs: 10000,
  })
}

// ============================================================
// AUTH: Foydalanuvchi
// ============================================================

export async function getMyCenter(token: string): Promise<TrainingCenter | null> {
  try {
    return await apiRequest<TrainingCenter>({
      method: "GET", path: "/training-centers/my", token, timeoutMs: 10000,
    })
  } catch (err: unknown) {
    if (err && typeof err === "object" && "status" in err && (err as { status: number }).status === 404) return null
    throw err
  }
}

export async function registerCenter(token: string, payload: RegisterCenterPayload): Promise<TrainingCenter> {
  return apiRequest<TrainingCenter>({
    method: "POST", path: "/training-centers", token, body: payload, timeoutMs: 15000,
  })
}

export async function updateMyCenter(token: string, payload: UpdateCenterPayload): Promise<TrainingCenter> {
  return apiRequest<TrainingCenter>({
    method: "PATCH", path: "/training-centers/my", token, body: payload, timeoutMs: 15000,
  })
}

/**
 * DELETE /training-centers/my
 * O'z markazini o'chirish
 */
export async function deleteMyCenter(token: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>({
    method: "DELETE",
    path: "/training-centers/my",
    token,
    timeoutMs: 10000,
  })
}

/**
 * POST /training-centers/:id/enroll
 * "Studied here" bosilganda so'rov yuboriladi.
 * Natija: { status: 'pending', message: string }
 * Enrollment TO'G'RIDAN emas — owner tasdiqlashi kerak!
 */
export async function requestEnroll(
  token: string,
  centerId: string
): Promise<{ status: "pending"; message: string }> {
  return apiRequest({
    method: "POST", path: `/training-centers/${centerId}/enroll`, token, timeoutMs: 10000,
  })
}

/**
 * DELETE /training-centers/:id/enroll
 * So'rovni bekor qilish yoki studentlikdan chiqish
 */
export async function cancelEnroll(token: string, centerId: string): Promise<{ cancelled: boolean }> {
  return apiRequest({
    method: "DELETE", path: `/training-centers/${centerId}/enroll`, token, timeoutMs: 10000,
  })
}

export async function rateCenter(
  token: string, centerId: string, rating: number
): Promise<{ rating: number; rating_count: number; user_rating: number }> {
  return apiRequest({
    method: "POST", path: `/training-centers/${centerId}/rate`,
    token, body: { rating }, timeoutMs: 10000,
  })
}

// ============================================================
// OWNER: Enrollment so'rovlarini boshqarish
// ============================================================

/**
 * GET /training-centers/my/enrollment-requests
 * Owner o'z markaziga kelgan barcha so'rovlarni ko'radi
 */
export async function getMyEnrollmentRequests(token: string): Promise<EnrollmentRequest[]> {
  return apiRequest<EnrollmentRequest[]>({
    method: "GET", path: "/training-centers/my/enrollment-requests", token, timeoutMs: 10000,
  })
}

/**
 * PATCH /training-centers/my/enrollment-requests/:requestId/approve
 * So'rovni tasdiqlash → user markaz studenti bo'ladi
 */
export async function approveEnrollment(token: string, requestId: string): Promise<{ success: boolean }> {
  return apiRequest({
    method: "PATCH",
    path: `/training-centers/my/enrollment-requests/${requestId}/approve`,
    token, timeoutMs: 10000,
  })
}

/**
 * PATCH /training-centers/my/enrollment-requests/:requestId/reject
 * So'rovni rad etish
 */
export async function rejectEnrollment(token: string, requestId: string, note?: string): Promise<{ success: boolean }> {
  return apiRequest({
    method: "PATCH",
    path: `/training-centers/my/enrollment-requests/${requestId}/reject`,
    token, body: { note }, timeoutMs: 10000,
  })
}

// ============================================================
// ADMIN API
// ============================================================

export async function adminListCenters(
  token: string,
  params?: { page?: number; limit?: number; status?: string; search?: string }
): Promise<CentersListResponse> {
  const sp = new URLSearchParams()
  if (params?.page) sp.set("page", String(params.page))
  if (params?.limit) sp.set("limit", String(params.limit))
  if (params?.status && params.status !== "all") sp.set("status", params.status)
  if (params?.search) sp.set("search", params.search)
  const q = sp.toString()
  return apiRequest<CentersListResponse>({
    method: "GET", path: `/admin/training-centers${q ? `?${q}` : ""}`, token, timeoutMs: 10000,
  })
}

export async function adminApproveCenter(token: string, id: string): Promise<TrainingCenter> {
  return apiRequest<TrainingCenter>({ method: "PATCH", path: `/admin/training-centers/${id}/approve`, token })
}

export async function adminRejectCenter(token: string, id: string, reason?: string): Promise<TrainingCenter> {
  return apiRequest<TrainingCenter>({ method: "PATCH", path: `/admin/training-centers/${id}/reject`, token, body: { reason } })
}

export async function adminToggleListing(token: string, id: string): Promise<TrainingCenter> {
  return apiRequest<TrainingCenter>({ method: "PATCH", path: `/admin/training-centers/${id}/toggle-listing`, token })
}
