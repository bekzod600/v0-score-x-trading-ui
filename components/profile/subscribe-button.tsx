"use client"

import { useState } from "react"
import { Bell, BellOff, BellRing, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useUser } from "@/lib/user-context"
import { useWallet } from "@/lib/wallet-context"
import { useI18n } from "@/lib/i18n-context"
import { LoginRequiredModal } from "@/components/auth/login-required-modal"
import { cn } from "@/lib/utils"

interface SubscribeButtonProps {
  traderId: string
  traderUsername: string
}

export function SubscribeButton({ traderId, traderUsername }: SubscribeButtonProps) {
  const { isSubscribed, subscribe, unsubscribe, getBellSetting, setBellSetting, isLoggedIn } = useUser()
  const { addNotification } = useWallet()
  const { t } = useI18n()
  const [showBellMenu, setShowBellMenu] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const subscribed = isSubscribed(traderId)
  const bellSetting = getBellSetting(traderId)

  const handleSubscribe = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }
    subscribe(traderId)
    addNotification({
      title: "Subscribed!",
      message: `You are now following @${traderUsername}. You'll receive notifications for new signals.`,
      type: "success",
      link: `/u/${traderUsername}`,
    })
  }

  const handleUnsubscribe = () => {
    unsubscribe(traderId)
    addNotification({
      title: "Unsubscribed",
      message: `You unfollowed @${traderUsername}.`,
      type: "info",
    })
  }

  const handleBellChange = (setting: "all" | "personalized" | "none") => {
    setBellSetting(traderId, setting)
    setShowBellMenu(false)
  }

  const BellIcon = bellSetting === "none" ? BellOff : bellSetting === "all" ? BellRing : Bell

  if (!subscribed) {
    return (
      <>
        <Button onClick={handleSubscribe} className="gap-2">
          {t("action.subscribe")}
        </Button>
        <LoginRequiredModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      </>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" onClick={handleUnsubscribe} className="gap-2">
        <Check className="h-4 w-4" />
        {t("action.subscribed")}
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
