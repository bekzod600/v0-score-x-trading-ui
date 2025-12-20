"use client"

import { Bell, Check, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useWallet } from "@/lib/wallet-context"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

export function NotificationBell() {
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotifications } = useWallet()
  const [sheetOpen, setSheetOpen] = useState(false)
  const unreadCount = notifications.filter((n) => !n.read).length

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
      {notifications.length === 0 ? (
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
                markNotificationRead(notification.id)
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
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={markAllNotificationsRead}>
            <Check className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={clearNotifications}>
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </>
      )}
    </div>
  )

  const BellButton = (
    <Button variant="ghost" size="icon" className="relative">
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
      <span className="sr-only">Notifications</span>
    </Button>
  )

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
