"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, ShoppingCart, Clock, Ban, ExternalLink } from "lucide-react"
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
import { type Signal, getFinalPrice } from "@/lib/mock-data"
import { useWallet } from "@/lib/wallet-context"
import { formatDistanceToNow } from "date-fns"

interface MySignalCardProps {
  signal: Signal
  onCancel?: (signalId: string) => void
}

export function MySignalCard({ signal, onCancel }: MySignalCardProps) {
  const { addNotification } = useWallet()
  const [isCancelled, setIsCancelled] = useState(signal.status === "CANCEL")
  const finalPrice = getFinalPrice(signal)

  // Mock stats
  const views = Math.floor(Math.random() * 500) + 50
  const purchases = signal.isFree ? 0 : Math.floor(Math.random() * 20)

  const canCancel = !isCancelled && !["TP1_HIT", "TP2_HIT", "SL_HIT", "HOLD", "CANCEL"].includes(signal.status)

  const handleCancel = () => {
    setIsCancelled(true)
    onCancel?.(signal.id)
    addNotification({
      title: "Signal Cancelled",
      message: `Your ${signal.ticker} signal has been cancelled.`,
      type: "info",
      link: `/signals/${signal.id}`,
    })
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
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {views} views
              </span>
              {!signal.isFree && (
                <span className="flex items-center gap-1">
                  <ShoppingCart className="h-3.5 w-3.5" />
                  {purchases} purchases
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
                    <AlertDialogCancel>Keep Signal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancel}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Cancel Signal
                    </AlertDialogAction>
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
