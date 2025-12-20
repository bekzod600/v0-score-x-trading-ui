"use client"

import { useState } from "react"
import { Check, Crown, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useWallet } from "@/lib/wallet-context"
import { useRouter } from "next/navigation"

const premiumFeatures = [
  "Unlimited signal access",
  "Priority notifications",
  "Advanced analytics",
  "No platform fees",
  "Exclusive trader badges",
]

export function SubscriptionCard() {
  const router = useRouter()
  const { balance, subscription, purchaseSubscription, setAutoRenew } = useWallet()
  const [isLoading, setIsLoading] = useState(false)

  const premiumPrice = 29.99
  const isPremium = subscription.plan === "premium"
  const hasInsufficientBalance = balance < premiumPrice

  const handlePurchase = async () => {
    if (hasInsufficientBalance) {
      router.push("/wallet")
      return
    }
    setIsLoading(true)
    // Simulate processing
    await new Promise((r) => setTimeout(r, 500))
    purchaseSubscription()
    setIsLoading(false)
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
            <CardDescription>{isPremium ? "You're on Premium" : "Upgrade to Premium"}</CardDescription>
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
            {/* Expiry */}
            {subscription.expiresAt && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Expires</span>
                <span className="font-semibold">{new Date(subscription.expiresAt).toLocaleDateString()}</span>
              </div>
            )}

            {/* Auto-renew Toggle */}
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div className="space-y-0.5">
                <Label htmlFor="auto-renew" className="font-medium">
                  Auto-renew
                </Label>
                <p className="text-sm text-muted-foreground">Automatically renew using wallet balance</p>
              </div>
              <Switch id="auto-renew" checked={subscription.autoRenew} onCheckedChange={setAutoRenew} />
            </div>

            {subscription.autoRenew && balance < premiumPrice && (
              <div className="rounded-lg bg-warning/10 border border-warning/20 p-3 text-sm text-warning">
                Warning: Insufficient balance for renewal. Please top up before expiry.
              </div>
            )}
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

            {/* Price */}
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">${premiumPrice}</span>
              <span className="text-muted-foreground">/month</span>
            </div>

            {/* Balance Check */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your balance</span>
              <span
                className={cn("font-mono font-semibold", hasInsufficientBalance ? "text-destructive" : "text-success")}
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
              {hasInsufficientBalance ? "Top Up Wallet" : "Upgrade to Premium"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
