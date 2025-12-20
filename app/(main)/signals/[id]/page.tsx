"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Lock,
  Heart,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Wallet,
  AlertCircle,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { SellerHeader } from "@/components/signals/seller-header"
import { StatusBadge } from "@/components/signals/status-badge"
import { HalalBadges } from "@/components/signals/halal-badges"
import { useWallet } from "@/lib/wallet-context"
import { useI18n } from "@/lib/i18n-context"
import {
  mockSignals,
  calculatePotentialProfit,
  calculatePotentialLoss,
  calculateRiskRatio,
  getFinalPrice,
} from "@/lib/mock-data"

const timelineSteps = [
  { key: "posted", label: "Posted" },
  { key: "waiting", label: "Waiting Entry" },
  { key: "active", label: "Active" },
  { key: "result", label: "Result" },
]

export default function SignalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { t } = useI18n()
  const signal = mockSignals.find((s) => s.id === id) || mockSignals[0]

  const { balance, isSignalPurchased, purchaseSignal } = useWallet()
  const isPurchased = signal.isFree || isSignalPurchased(signal.id)

  const [isFavorite, setIsFavorite] = useState(signal.isFavorite)
  const [likes, setLikes] = useState(signal.likes)
  const [dislikes, setDislikes] = useState(signal.dislikes)

  const isLocked = !signal.isFree && !isPurchased
  const potentialProfit = calculatePotentialProfit(signal)
  const potentialLoss = calculatePotentialLoss(signal)
  const riskRatio = calculateRiskRatio(signal)
  const finalPrice = getFinalPrice(signal)
  const hasInsufficientBalance = balance < finalPrice

  const handlePurchase = () => {
    if (hasInsufficientBalance) {
      router.push("/wallet")
      return
    }
    purchaseSignal(signal.id, finalPrice, signal.ticker)
  }

  // Determine timeline progress
  const getTimelineProgress = () => {
    switch (signal.status) {
      case "WAITING_ENTRY":
        return 1
      case "ACTIVE":
        return 2
      case "TP1_HIT":
      case "TP2_HIT":
      case "SL_HIT":
      case "HOLD":
      case "CANCEL":
        return 3
      default:
        return 0
    }
  }
  const timelineProgress = getTimelineProgress()

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back Button */}
      <Link
        href="/signals"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Signals
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Signal Card */}
          <Card className="overflow-hidden">
            {/* Seller Header */}
            <SellerHeader trader={signal.trader} variant="detail" />

            <CardContent className="p-6">
              {/* Ticker + Status + Price */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-3xl font-bold font-mono">
                      {isLocked ? (
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Lock className="h-6 w-6" />
                          ***
                        </span>
                      ) : (
                        signal.ticker
                      )}
                    </h1>
                    <StatusBadge status={signal.status} size="md" />
                  </div>
                  <p className="text-muted-foreground">BUY Signal</p>
                </div>
                <div className="text-right">
                  {signal.isFree ? (
                    <Badge className="bg-success text-success-foreground text-lg px-4 py-2">FREE</Badge>
                  ) : (
                    <div>
                      {signal.discountPercent > 0 && (
                        <div className="text-sm text-muted-foreground line-through">${signal.price}</div>
                      )}
                      <div className="text-3xl font-bold text-primary">${finalPrice}</div>
                      {signal.discountPercent > 0 && (
                        <Badge className="bg-destructive text-destructive-foreground mt-1">
                          -{signal.discountPercent}% OFF
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Price Levels */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-6">
                <div className="rounded-lg bg-muted p-4">
                  <div className="text-sm text-muted-foreground">Entry Price</div>
                  <div className="text-xl font-bold font-mono">{isLocked ? "***" : `$${signal.entry.toFixed(2)}`}</div>
                </div>
                <div className="rounded-lg bg-success/10 p-4">
                  <div className="text-sm text-success">Take Profit 1</div>
                  <div className="text-xl font-bold font-mono text-success">
                    {isLocked ? "***" : `$${signal.tp1.toFixed(2)}`}
                  </div>
                </div>
                <div className="rounded-lg bg-success/10 p-4">
                  <div className="text-sm text-success">Take Profit 2</div>
                  <div className="text-xl font-bold font-mono text-success">
                    {isLocked ? "***" : `$${signal.tp2.toFixed(2)}`}
                  </div>
                </div>
                <div className="rounded-lg bg-destructive/10 p-4">
                  <div className="text-sm text-destructive">Stop Loss</div>
                  <div className="text-xl font-bold font-mono text-destructive">
                    {isLocked ? "***" : `$${signal.sl.toFixed(2)}`}
                  </div>
                </div>
              </div>

              {isLocked && (
                <div className="mb-6 space-y-3">
                  {/* Wallet Balance Display */}
                  <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Your balance:</span>
                    </div>
                    <span
                      className={cn(
                        "font-semibold font-mono",
                        hasInsufficientBalance ? "text-destructive" : "text-success",
                      )}
                    >
                      ${balance.toFixed(2)}
                    </span>
                  </div>

                  {/* Insufficient Balance Warning */}
                  {hasInsufficientBalance && (
                    <div className="flex items-center gap-2 rounded-lg bg-warning/10 border border-warning/20 p-3 text-sm text-warning">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>Insufficient balance. Please top up your wallet.</span>
                    </div>
                  )}

                  {/* Buy Button */}
                  <Button
                    className="w-full"
                    size="lg"
                    variant={hasInsufficientBalance ? "outline" : "default"}
                    onClick={handlePurchase}
                  >
                    {hasInsufficientBalance ? (
                      <>
                        <Wallet className="mr-2 h-4 w-4" />
                        Top Up Wallet
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Buy to Unlock for ${finalPrice}
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 border-t border-border pt-4">
                <button
                  onClick={() => setLikes((l) => l + 1)}
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ThumbsUp className="h-5 w-5" />
                  {likes}
                </button>
                <button
                  onClick={() => setDislikes((d) => d + 1)}
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ThumbsDown className="h-5 w-5" />
                  {dislikes}
                </button>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={cn(
                    "flex items-center gap-2 transition-colors",
                    isFavorite ? "text-destructive" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
                  {isFavorite ? "Saved" : "Save"}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section (Placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" />
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed border-border bg-muted/50 p-8 text-center">
                <p className="text-muted-foreground">Comments coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Signal Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timelineSteps.map((step, index) => {
                  const isActive = index <= timelineProgress
                  const isCurrent = index === timelineProgress
                  return (
                    <div key={step.key} className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-3 w-3 rounded-full shrink-0",
                          isActive ? "bg-primary" : "bg-border",
                          isCurrent && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
                        )}
                      />
                      <div className={cn("font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>
                        {step.label}
                        {step.key === "result" && timelineProgress === 3 && (
                          <span className="ml-2">
                            <StatusBadge status={signal.status} size="sm" />
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Risk Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-success/10 p-3">
                <span className="text-sm text-muted-foreground">Potential Profit</span>
                <span className="font-semibold text-success flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />+{potentialProfit}%
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-destructive/10 p-3">
                <span className="text-sm text-muted-foreground">Potential Loss</span>
                <span className="font-semibold text-destructive flex items-center gap-1">
                  <TrendingDown className="h-4 w-4" />-{potentialLoss}%
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                <span className="text-sm text-muted-foreground">Risk Ratio</span>
                <span className="font-semibold">{riskRatio}:1</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {t("signals.etaLabel")}
                </span>
                <span className="font-semibold">
                  {signal.trader.avgDaysToResult.toFixed(1)} {t("signals.etaDays")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Halal Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Halal Status</CardTitle>
            </CardHeader>
            <CardContent>
              <HalalBadges
                islamiclyStatus={signal.islamiclyStatus}
                musaffaStatus={signal.musaffaStatus}
                size="md"
                className="flex-col items-stretch"
              />
            </CardContent>
          </Card>

          {/* Trader Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trader Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Signals</span>
                <span className="font-semibold">{signal.trader.totalSignals}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total P/L</span>
                <span
                  className={cn(
                    "font-semibold",
                    signal.trader.totalPLPercent >= 0 ? "text-success" : "text-destructive",
                  )}
                >
                  {signal.trader.totalPLPercent >= 0 ? "+" : ""}
                  {signal.trader.totalPLPercent}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ScoreX Points</span>
                <span className="font-semibold">{signal.trader.scoreXPoints}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subscribers</span>
                <span className="font-semibold">{signal.trader.subscribers}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
