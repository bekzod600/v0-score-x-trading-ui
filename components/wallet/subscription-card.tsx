"use client"

import { useState } from "react"
import { Check, Crown, Zap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useWallet } from "@/lib/wallet-context"
import { useUser } from "@/lib/user-context"
import { useToast } from "@/lib/toast-context"
import { useRouter } from "next/navigation"
import {
  purchasePremium,
  setAutoRenew as setAutoRenewAPI,
} from "@/lib/services/subscription-service"

const premiumFeatures = [
  "Access to all FREE signals",
  "Priority notifications",
  "Advanced analytics",
  "No platform fees",
  "Exclusive trader badges",
]

export function SubscriptionCard() {
  const router = useRouter()
  const { balance, refreshBalance } = useWallet()
  const user = useUser()
  const token = user.token
  const isLoggedIn = user.isLoggedIn
  const refreshSubscription = (user as Record<string, unknown>).refreshSubscription as (() => Promise<void>) | undefined
  const subscription = ((user as Record<string, unknown>).subscription ?? {
    isActive: false,
    plan: "free",
    daysRemaining: null,
    expiresAt: null,
    autoRenew: false,
  }) as {
    isActive: boolean
    plan: string
    daysRemaining: number | null
    expiresAt: string | null
    autoRenew: boolean
  }
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  const premiumPrice = 2
  const isPremium = subscription.isActive
  const hasInsufficientBalance = balance < premiumPrice

  const handlePurchase = async () => {
    if (!isLoggedIn || !token) {
      router.push("/login")
      return
    }

    if (hasInsufficientBalance) {
      router.push("/wallet")
      return
    }

    setIsLoading(true)
    try {
      const result = await purchasePremium(token)
      showToast(result.message || "Premium subscription activated!", "success")
      if (refreshSubscription) await refreshSubscription()
      await refreshBalance()
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Purchase failed", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAutoRenewChange = async (enabled: boolean) => {
    if (!token) return
    
    setIsToggling(true)
    try {
      await setAutoRenewAPI(token, enabled)
      if (refreshSubscription) await refreshSubscription()
      showToast(enabled ? "Auto-renew enabled" : "Auto-renew disabled", "success")
    } catch {
      showToast("Failed to update setting", "error")
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Subscription
            </CardTitle>
            <CardDescription>
              {isPremium ? "You're on Premium" : "Upgrade to Premium"}
            </CardDescription>
          </div>
          {isPremium && (
            <Badge className="bg-primary text-primary-foreground">
              <Zap className="mr-1 h-3 w-3" />
              Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Current Plan */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Current Plan</span>
          <span className="font-semibold capitalize">{subscription.plan}</span>
        </div>

        {isPremium ? (
          <>
            {/* Days Remaining */}
            {subscription.daysRemaining !== null && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Days Remaining</span>
                <span className="font-semibold">{subscription.daysRemaining} days</span>
              </div>
            )}

            {/* Expiry */}
            {subscription.expiresAt && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Expires</span>
                <span className="font-semibold">
                  {new Date(subscription.expiresAt).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Auto-renew Toggle */}
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div className="space-y-0.5">
                <Label htmlFor="auto-renew" className="font-medium">
                  Auto-renew
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically renew using wallet balance
                </p>
              </div>
              <Switch
                id="auto-renew"
                checked={subscription.autoRenew}
                onCheckedChange={handleAutoRenewChange}
                disabled={isToggling}
              />
            </div>

            {subscription.autoRenew && balance < premiumPrice && (
              <div className="rounded-lg bg-warning/10 border border-warning/20 p-3 text-sm text-warning">
                Warning: Insufficient balance for renewal. Please top up before expiry.
              </div>
            )}

            {/* What's included */}
            <div className="space-y-3">
              <p className="font-medium">Your Premium benefits:</p>
              <ul className="space-y-2">
                {premiumFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-success shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <>
            {/* Premium Features */}
            <div className="space-y-3">
              <p className="font-medium">Premium includes:</p>
              <ul className="space-y-2">
                {premiumFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-success shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Important Note */}
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium mb-1">Why Premium?</p>
              <p className="text-muted-foreground">
                Without Premium, all signals (including FREE ones) are locked.
                Subscribe to unlock all FREE signals instantly!
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">${premiumPrice}</span>
              <span className="text-muted-foreground">/month</span>
            </div>

            {/* Balance Check */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your balance</span>
              <span
                className={cn(
                  "font-mono font-semibold",
                  hasInsufficientBalance ? "text-destructive" : "text-success"
                )}
              >
                ${balance.toFixed(2)}
              </span>
            </div>

            {/* Purchase Button */}
            <Button
              onClick={handlePurchase}
              disabled={isLoading}
              className="w-full"
              variant={hasInsufficientBalance ? "outline" : "default"}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : hasInsufficientBalance ? (
                "Top Up Wallet"
              ) : (
                "Upgrade to Premium"
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
