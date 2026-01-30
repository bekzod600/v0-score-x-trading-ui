import { apiRequest } from "@/lib/api-client"

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  link?: string
  createdAt: string
}

export interface NotificationsResponse {
  notifications: Notification[]
}

export interface MarkReadResponse {
  success: boolean
}

/**
 * List notifications for authenticated user
 * GET /notifications
 * No mock data fallback - throws on API error
 * Requires authentication
 */
export async function listNotifications(token: string): Promise<NotificationsResponse> {
  return await apiRequest<NotificationsResponse>({
    method: "GET",
    path: "/notifications",
    token,
    timeoutMs: 5000,
  })
}

/**
 * Mark notification as read
 * POST /notifications/:id/read
 * No mock data fallback - throws on API error
 * Requires authentication
 */
export async function markRead(id: string, token: string): Promise<MarkReadResponse> {
  return await apiRequest<MarkReadResponse>({
    method: "POST",
    path: `/notifications/${id}/read`,
    token,
    timeoutMs: 5000,
  })
}
