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

const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    title: "Signal Hit TP1!",
    message: "Your AAPL signal reached TP1. +8.5% profit locked in.",
    type: "success",
    read: false,
    link: "/signals/1",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-2",
    title: "New Signal from TraderPro",
    message: "A trader you follow just posted a new signal.",
    type: "info",
    read: false,
    link: "/signals",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-3",
    title: "Wallet Top-Up Confirmed",
    message: "Your 100,000 UZS top-up has been confirmed.",
    type: "success",
    read: true,
    link: "/wallet",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
]

export async function listNotifications(token: string): Promise<NotificationsResponse> {
  try {
    return await apiRequest<NotificationsResponse>({
      method: "GET",
      path: "/notifications",
      token,
      timeoutMs: 5000,
    })
  } catch (err) {
    console.log("[v0] API unavailable, using mock notifications")
    return { notifications: mockNotifications }
  }
}

export async function markRead(id: string, token: string): Promise<MarkReadResponse> {
  try {
    return await apiRequest<MarkReadResponse>({
      method: "POST",
      path: `/notifications/${id}/read`,
      token,
      timeoutMs: 5000,
    })
  } catch (err) {
    console.log("[v0] API unavailable, mocking mark read success")
    return { success: true }
  }
}
