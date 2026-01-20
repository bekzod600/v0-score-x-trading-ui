"use client"

import { useState } from "react"
import Link from "next/link"
import { Lock, Heart, ThumbsUp, ThumbsDown, TrendingUp, TrendingDown, Clock, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { SellerHeader } from "./seller-header"
import { StatusBadge } from "./status-badge"
import { HalalBadges } from "./halal-badges"
import { useUser } from "@/lib/user-context"
import { useI18n } from "@/lib/i18n-context"
import { LoginRequiredModal } from "@/components/auth/login-required-modal"

interface SignalCardSignal {
  id: string
  ticker: string
  entry: number
  tp1: number
  tp2: number
  sl: number
  currentPrice: number
  status: string
  isFree: boolean
  price: number
  discountPercent: number
  islamiclyStatus: string
  musaffaStatus: string
  trader: {
    id: string
    username: string
    avatar: string
    scoreXPoints: number
    rank: number
    avgStars: number
    totalPLPercent: number
    totalSignals: number
    subscribers: number
    avgDaysToResult: number
  }
  likes: number
  dislikes: number
  createdAt: string
  closedAt: string | null
  isLocked: boolean
  isPurchased: boolean
}

interface SignalCardProps {
  signal: SignalCardSignal
  isResult?: boolean
}

function calculatePotentialProfit(signal: SignalCardSignal): number {
  if (!signal.entry || !signal.tp2) return 0
  return Number((((signal.tp2 - signal.entry) / signal.entry) * 100).toFixed(1))
}

function calculatePotentialLoss(signal: SignalCardSignal): number {
  if (!signal.entry || !signal.sl) return 0
  return Number((((signal.entry - signal.sl) / signal.entry) * 100).toFixed(1))
}

function calculateRiskRatio(signal: SignalCardSignal): number {
  const profit = calculatePotentialProfit(signal)
  const loss = calculatePotentialLoss(signal)
  if (loss === 0) return 0
  return Number((profit / loss).toFixed(1))
}

function getFinalPrice(signal: SignalCardSignal): number {
  if (signal.isFree) return 0
  if (signal.discountPercent > 0) {
    return Math.round(signal.price * (1 - signal.discountPercent / 100))
  }
  return signal.price
}

function getResultOutcome(signal: SignalCardSignal): { type: "profit" | "loss" | "neutral"; value: number } | null {
  if (!["TP1_HIT", "TP2_HIT", "SL_HIT", "CANCEL"].includes(signal.status)) return null

  if (signal.status === "TP1_HIT") {
    const profit = signal.entry && signal.tp1 ? ((signal.tp1 - signal.entry) / signal.entry) * 100 : 0
    return { type: "profit", value: Number(profit.toFixed(1)) }
  }
  if (signal.status === "TP2_HIT") {
    const profit = signal.entry && signal.tp2 ? ((signal.tp2 - signal.entry) / signal.entry) * 100 : 0
    return { type: "profit", value: Number(profit.toFixed(1)) }
  }
  if (signal.status === "SL_HIT") {
    const loss = signal.entry && signal.sl ? ((signal.entry - signal.sl) / signal.entry) * 100 : 0
    return { type: "loss", value: Number(loss.toFixed(1)) }
  }
  return { type: "neutral", value: 0 }
}

export function SignalCard({ signal, isResult = false }: SignalCardProps) {
  const { isFavorite, toggleFavorite, voteSignal, getVote, isLoggedIn } = useUser()
  const { t } = useI18n()
  const [showLoginModal, setShowLoginModal] = useState(false)

  const favorite = isFavorite(signal.id)
  const userVote = getVote(signal.id)

  // Backend rule: isLocked = !isFree && !isPurchased
  // Premium status does NOT unlock signals
  const isLocked = signal.isLocked

  const potentialProfit = calculatePotentialProfit(signal)
  const potentialLoss = calculatePotentialLoss(signal)
  const riskRatio = calculateRiskRatio(signal)
  const finalPrice = getFinalPrice(signal)
  const outcome = isResult ? getResultOutcome(signal) : null

  // Calculate display likes/dislikes based on user vote
  let displayLikes = signal.likes
  let displayDislikes = signal.dislikes
  if (userVote === "like") displayLikes += 1
  if (userVote === "dislike") displayDislikes += 1

  const handleVote = (vote: "like" | "dislike") => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }
    voteSignal(signal.id, vote)
  }

  const handleFavorite = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }
    toggleFavorite(signal.id)
  }

  return (
    <>
      <Card className="overflow-hidden border-border bg-card">
        <SellerHeader trader={signal.trader as any} />

        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Left: Signal Details */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Ticker + Status */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl font-bold font-mono">
                  {isLocked ? (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      ***
                    </span>
                  ) : (
                    signal.ticker
                  )}
                </span>
                <StatusBadge status={signal.status as any} />
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-md bg-success/10 px-2 py-1.5">
                  <div className="text-xs text-muted-foreground">{t("signals.profit")}</div>
                  <div className="font-semibold text-success flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />+{potentialProfit}%
                  </div>
                </div>
                <div className="rounded-md bg-destructive/10 px-2 py-1.5">
                  <div className="text-xs text-muted-foreground">{t("signals.loss")}</div>
                  <div className="font-semibold text-destructive flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />-{potentialLoss}%
                  </div>
                </div>
                <div className="rounded-md bg-muted px-2 py-1.5">
                  <div className="text-xs text-muted-foreground">{t("signals.risk")}</div>
                  <div className="font-semibold">{riskRatio}:1</div>
                </div>
              </div>

              {/* Current Price + Estimated Time to Result */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>
                  {t("signals.current")}: <span className="font-mono">${(signal.currentPrice ?? 0).toFixed(2)}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {t("signals.etaLabel")}:{" "}
                  <span className="font-medium text-foreground">{(signal.trader?.avgDaysToResult ?? 0).toFixed(1)}</span>{" "}
                  {t("signals.etaDays")}
                </span>
              </div>

              {/* Price Levels - Show *** if isLocked from backend */}
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                <div className="rounded bg-muted/50 px-2 py-1">
                  <span className="text-muted-foreground">EP</span>
                  <div className="font-mono font-medium">{isLocked ? "***" : `$${(signal.entry ?? 0).toFixed(0)}`}</div>
                </div>
                <div className="rounded bg-success/5 px-2 py-1">
                  <span className="text-success">TP1</span>
                  <div className="font-mono font-medium text-success">
                    {isLocked ? "***" : `$${(signal.tp1 ?? 0).toFixed(0)}`}
                  </div>
                </div>
                <div className="rounded bg-success/5 px-2 py-1">
                  <span className="text-success">TP2</span>
                  <div className="font-mono font-medium text-success">
                    {isLocked ? "***" : `$${(signal.tp2 ?? 0).toFixed(0)}`}
                  </div>
                </div>
                <div className="rounded bg-destructive/5 px-2 py-1">
                  <span className="text-destructive">SL</span>
                  <div className="font-mono font-medium text-destructive">
                    {isLocked ? "***" : `$${(signal.sl ?? 0).toFixed(0)}`}
                  </div>
                </div>
              </div>

              <HalalBadges
                islamiclyStatus={signal.islamiclyStatus as any}
                musaffaStatus={signal.musaffaStatus as any}
              />

              {/* Result Outcome */}
              {isResult && outcome && signal.closedAt && (
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Closed {new Date(signal.closedAt).toLocaleDateString()}</span>
                  {outcome.type === "profit" && (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">
                      +{outcome.value}% profit
                    </Badge>
                  )}
                  {outcome.type === "loss" && (
                    <Badge
                      variant="outline"
                      className="bg-destructive/10 text-destructive border-destructive/30 text-xs"
                    >
                      -{outcome.value}% loss
                    </Badge>
                  )}
                  {outcome.type === "neutral" && (
                    <Badge variant="outline" className="text-xs">
                      No change
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Right: Price Block */}
            <div className="flex flex-col items-end justify-between shrink-0">
              <div className="text-right">
                {signal.isFree ? (
                  <Badge className="bg-success text-success-foreground text-base px-3 py-1">{t("signals.free")}</Badge>
                ) : (
                  <div className="space-y-1">
                    {signal.discountPercent > 0 && (
                      <div className="text-sm text-muted-foreground line-through">${signal.price}</div>
                    )}
                    <div className="text-2xl font-bold text-primary">${finalPrice}</div>
                    {signal.discountPercent > 0 && (
                      <Badge className="bg-destructive text-destructive-foreground text-xs">
                        -{signal.discountPercent}%
                      </Badge>
                    )}
                    {isLocked && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Lock className="h-3 w-3" />
                        {t("signals.locked")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleVote("like")}
                className={cn(
                  "flex items-center gap-1 text-sm transition-colors",
                  userVote === "like" ? "text-success" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <ThumbsUp className={cn("h-4 w-4", userVote === "like" && "fill-current")} />
                <span className="text-xs">{displayLikes}</span>
              </button>
              <button
                onClick={() => handleVote("dislike")}
                className={cn(
                  "flex items-center gap-1 text-sm transition-colors",
                  userVote === "dislike" ? "text-destructive" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <ThumbsDown className={cn("h-4 w-4", userVote === "dislike" && "fill-current")} />
                <span className="text-xs">{displayDislikes}</span>
              </button>
              <button
                onClick={handleFavorite}
                className={cn(
                  "flex items-center text-sm transition-colors",
                  favorite ? "text-destructive" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Heart className={cn("h-4 w-4", favorite && "fill-current")} />
              </button>
            </div>

            <Link href={`/signals/${signal.id}`}>
              <Button size="sm" variant="outline" className="gap-1.5 bg-transparent">
                <Eye className="h-3.5 w-3.5" />
                {t("signals.viewDetails")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <LoginRequiredModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </>
  )
}
