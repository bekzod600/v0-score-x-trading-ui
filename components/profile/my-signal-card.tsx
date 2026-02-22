"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, ShoppingCart, Clock, Ban, ExternalLink, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { StatusBadge } from "@/components/signals/status-badge"
import { useWallet } from "@/lib/wallet-context"
import { formatDistanceToNow } from "date-fns"

// Define Signal type locally to avoid mock-data dependency
interface Signal {
  id: string
  ticker: string | null
  entry: number | null
  tp1: number | null
  tp2: number | null
  sl: number | null
  currentPrice: number
  status: string
  isFree: boolean
  price: number
  discountPercent: number
  createdAt: string
  closedAt?: string | null
  views?: number
  purchases?: number
}

function getFinalPrice(signal: Signal): number {
  if (signal.isFree) return 0
  if (signal.discountPercent > 0) {
    return Math.round(signal.price * (1 - signal.discountPercent / 100))
  }
  return signal.price
}

interface MySignalCardProps {
  signal: Signal
  token?: string
  onCancel?: (signalId: string) => void
}

export function MySignalCard({ signal, token, onCancel }: MySignalCardProps) {
  const { addNotification } = useWallet()
  const [isCancelled, setIsCancelled] = useState(signal.status === "CANCEL")
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const finalPrice = getFinalPrice(signal)

  const views = signal.views
  const purchases = signal.purchases

  const canCancel = !isCancelled && !["TP1_HIT", "TP2_HIT", "SL_HIT", "HOLD", "CANCEL"].includes(signal.status)

  const handleCancel = async () => {
    if (!token) {
      // token yo'q bo'lsa local state update qilib qo'yamiz
      setIsCancelled(true)
      onCancel?.(signal.id)
      return
    }
    setIsCancelling(true)
    setCancelError(null)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/me/signals/${signal.id}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      )
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || "Failed to cancel signal")
      }
      setIsCancelled(true)
      onCancel?.(signal.id)
      addNotification({
        title: "Signal Cancelled",
        message: `Your ${signal.ticker} signal has been cancelled.`,
        type: "info",
        link: `/signals/${signal.id}`,
      })
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Failed to cancel")
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <Card className={isCancelled ? "opacity-60" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Signal Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold font-mono">{signal.ticker}</span>
              <StatusBadge status={isCancelled ? "CANCEL" : signal.status} />
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDistanceToNow(new Date(signal.createdAt), { addSuffix: true })}
              </span>
              {views !== undefined && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />{views} views
                </span>
              )}
              {!signal.isFree && purchases !== undefined && (
                <span className="flex items-center gap-1">
                  <ShoppingCart className="h-3.5 w-3.5" />{purchases} purchases
                </span>
              )}
            </div>

            {/* Price info */}
            <div className="flex items-center gap-2">
              {signal.isFree ? (
                <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                  FREE
                </Badge>
              ) : (
                <>
                  <Badge variant="outline">${finalPrice}</Badge>
                  {signal.discountPercent > 0 && (
                    <Badge className="bg-destructive/10 text-destructive border-destructive/30">
                      -{signal.discountPercent}% off
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col gap-2 shrink-0">
            <Link href={`/signals/${signal.id}`}>
              <Button variant="outline" size="sm" className="w-full gap-1.5 bg-transparent">
                <ExternalLink className="h-3.5 w-3.5" />
                View
              </Button>
            </Link>
            {canCancel && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 text-destructive hover:text-destructive bg-transparent"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel this signal?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will mark your {signal.ticker} signal as cancelled. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <div className="flex w-full flex-col gap-2">
                      {cancelError && (
                        <p className="text-xs text-destructive text-center">{cancelError}</p>
                      )}
                      <div className="flex gap-2 justify-end">
                        <AlertDialogCancel disabled={isCancelling}>Keep Signal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => { e.preventDefault(); handleCancel() }}
                          disabled={isCancelling}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isCancelling ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cancelling...</>
                          ) : (
                            "Cancel Signal"
                          )}
                        </AlertDialogAction>
                      </div>
                    </div>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
