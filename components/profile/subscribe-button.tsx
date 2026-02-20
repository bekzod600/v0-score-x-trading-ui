"use client"

import { useState } from "react"
import { Bell, BellOff, BellRing, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useUser } from "@/lib/user-context"
import { useWallet } from "@/lib/wallet-context"
import { useI18n } from "@/lib/i18n-context"
import { useToast } from "@/lib/toast-context"
import { LoginRequiredModal } from "@/components/auth/login-required-modal"
import { subscribeToTrader, unsubscribeFromTrader, updateBellSetting } from "@/lib/services/subscriptions-service"
import { cn } from "@/lib/utils"

interface SubscribeButtonProps {
  traderId: string
  traderUsername: string
}

export function SubscribeButton({ traderId, traderUsername }: SubscribeButtonProps) {
  const { subscriptions, isLoggedIn, token } = useUser()
  const { addNotification } = useWallet()
  const { t } = useI18n()
  const { showToast } = useToast()
  const [showBellMenu, setShowBellMenu] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [localSubscribed, setLocalSubscribed] = useState<boolean | null>(null)
  const [bellSetting, setBellSetting] = useState<"all" | "personalized" | "none">("all")

  // Use local override if set, otherwise check context array
  const subscribed = localSubscribed !== null
    ? localSubscribed
    : subscriptions.includes(traderId)

  const handleSubscribe = async () => {
    if (!isLoggedIn || !token) {
      setShowLoginModal(true)
      return
    }
    setIsLoading(true)
    try {
      await subscribeToTrader(traderUsername, token)
      setLocalSubscribed(true)
      addNotification({
        title: "Subscribed!",
        message: `You are now following @${traderUsername}. You'll receive notifications for new signals.`,
        type: "success",
        link: `/u/${traderUsername}`,
      })
    } catch {
      showToast("error", "Failed to subscribe. Try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    if (!token) return
    setIsLoading(true)
    try {
      await unsubscribeFromTrader(traderUsername, token)
      setLocalSubscribed(false)
      addNotification({
        title: "Unsubscribed",
        message: `You unfollowed @${traderUsername}.`,
        type: "info",
      })
    } catch {
      showToast("error", "Failed to unsubscribe. Try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBellChange = async (setting: "all" | "personalized" | "none") => {
    if (!token) return
    try {
      await updateBellSetting(traderUsername, setting, token)
      setBellSetting(setting)
    } catch {
      showToast("error", "Failed to update notification setting.")
    }
    setShowBellMenu(false)
  }

  const BellIcon = bellSetting === "none" ? BellOff : bellSetting === "all" ? BellRing : Bell

  if (!subscribed) {
    return (
      <>
        <Button onClick={handleSubscribe} className="gap-2" disabled={isLoading}>
          {isLoading ? "..." : t("action.subscribe")}
        </Button>
        <LoginRequiredModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      </>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" onClick={handleUnsubscribe} className="gap-2" disabled={isLoading}>
        <Check className="h-4 w-4" />
        {isLoading ? "..." : t("action.subscribed")}
      </Button>
      <DropdownMenu open={showBellMenu} onOpenChange={setShowBellMenu}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className={cn(bellSetting === "none" && "text-muted-foreground")}>
            <BellIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => handleBellChange("all")}
            className={cn(bellSetting === "all" && "bg-secondary")}
          >
            <BellRing className="h-4 w-4 mr-2" />
            All notifications
            {bellSetting === "all" && <Check className="h-4 w-4 ml-auto" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleBellChange("personalized")}
            className={cn(bellSetting === "personalized" && "bg-secondary")}
          >
            <Bell className="h-4 w-4 mr-2" />
            Personalized
            {bellSetting === "personalized" && <Check className="h-4 w-4 ml-auto" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleBellChange("none")}
            className={cn(bellSetting === "none" && "bg-secondary")}
          >
            <BellOff className="h-4 w-4 mr-2" />
            None (mute)
            {bellSetting === "none" && <Check className="h-4 w-4 ml-auto" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
