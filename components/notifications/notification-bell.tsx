"use client"

import { Bell, Check, Trash2, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useUser } from "@/lib/user-context"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { listNotifications, markRead, type Notification } from "@/lib/services/notifications-service"

export function NotificationBell() {
  const router = useRouter()
  const { isLoggedIn, token } = useUser()
  const [sheetOpen, setSheetOpen] = useState(false)

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const unreadCount = notifications?.filter((n) => !n.read).length || 0

  const fetchNotifications = useCallback(async () => {
    if (!token) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await listNotifications(token)
      setNotifications(response?.notifications || [])
    } catch (err) {
      console.error("[v0] Failed to fetch notifications:", err)
      setNotifications([])
      setError("Failed to load")
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (isLoggedIn && token) {
      fetchNotifications()
    }
  }, [isLoggedIn, token, fetchNotifications])

  const handleMarkRead = async (id: string) => {
    if (!token) return

    // Optimistic update
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))

    try {
      await markRead(id, token)
    } catch (err) {
      console.error("[v0] Failed to mark notification as read:", err)
      // Revert on error
      fetchNotifications()
    }
  }

  const handleMarkAllRead = async () => {
    if (!token) return

    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))

    try {
      await Promise.all(unreadIds.map((id) => markRead(id, token)))
    } catch (err) {
      console.error("[v0] Failed to mark all as read:", err)
      fetchNotifications()
    }
  }

  const handleClear = () => {
    setNotifications([])
  }

  const handleBellClick = () => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
  }

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "success":
        return "border-l-success"
      case "warning":
        return "border-l-warning"
      case "error":
        return "border-l-destructive"
      default:
        return "border-l-primary"
    }
  }

  const NotificationList = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
      {isLoading ? (
        <div className="px-3 py-8 text-center">
          <RefreshCw className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-2">Loading...</p>
        </div>
      ) : error ? (
        <div className="px-3 py-8 text-center">
          <p className="text-sm text-destructive mb-2">{error}</p>
          <Button size="sm" variant="outline" onClick={fetchNotifications} className="gap-2 bg-transparent">
            <RefreshCw className="h-3 w-3" />
            Retry
          </Button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="px-3 py-12 text-center text-sm text-muted-foreground">No notifications yet</div>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto">
          {notifications.slice(0, 20).map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "flex flex-col items-start gap-1 border-l-2 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50",
                getTypeStyles(notification.type),
                !notification.read && "bg-muted/30",
              )}
              onClick={() => {
                handleMarkRead(notification.id)
                onItemClick?.()
              }}
            >
              <div className="flex w-full items-start justify-between gap-2">
                <span className="font-medium text-sm">{notification.title}</span>
                {!notification.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />}
              </div>
              <span className="text-xs text-muted-foreground line-clamp-2">{notification.message}</span>
              <span className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </span>
              {notification.link && (
                <Link
                  href={notification.link}
                  className="text-xs text-primary hover:underline mt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  View details
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )

  const ActionButtons = () => (
    <div className="flex gap-1">
      {notifications.length > 0 && (
        <>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={handleMarkAllRead}>
            <Check className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={handleClear}>
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </>
      )}
    </div>
  )

  const BellButton = (
    <Button variant="ghost" size="icon" className="relative" onClick={handleBellClick}>
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
      <span className="sr-only">Notifications</span>
    </Button>
  )

  if (!isLoggedIn) {
    return BellButton
  }

  return (
    <>
      {/* Desktop: Dropdown */}
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>{BellButton}</DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-3 py-2">
              <h4 className="font-semibold">Notifications</h4>
              <ActionButtons />
            </div>
            <DropdownMenuSeparator />
            <NotificationList />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile: Bottom Sheet */}
      <div className="md:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>{BellButton}</SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
            <SheetHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <SheetTitle>Notifications</SheetTitle>
                <ActionButtons />
              </div>
            </SheetHeader>
            <NotificationList onItemClick={() => setSheetOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
