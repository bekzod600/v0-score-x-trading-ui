"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@/lib/user-context"
import { useToast } from "@/lib/toast-context"
import { rateTrader as rateTraderAPI, getMyTraderRating } from "@/lib/services/ratings-service"

interface StarRatingProps {
  traderId: string
  username: string
  avgStars: number
  totalCount: number
  size?: "sm" | "md" | "lg"
  showRateButton?: boolean
}

export function StarRating({ traderId, username, avgStars = 0, totalCount = 0, size = "md", showRateButton = false }: StarRatingProps) {
  const { isLoggedIn, token } = useUser()
  const { showToast } = useToast()
  const [hoverRating, setHoverRating] = useState(0)
  const [isRating, setIsRating] = useState(false)
  const [userRating, setUserRating] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [localAvg, setLocalAvg] = useState<number>(Number(avgStars) || 0)

  useEffect(() => {
    const val = Number(avgStars)
    if (!isNaN(val)) setLocalAvg(val)
  }, [avgStars])

  useEffect(() => {
    if (!isLoggedIn || !token || !showRateButton) return
    getMyTraderRating(username, token)
      .then((res) => { if (res.stars) setUserRating(res.stars) })
      .catch(() => {})
  }, [isLoggedIn, token, username, showRateButton])

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  const handleRate = async (stars: number) => {
    if (!isLoggedIn || !token) return
    setIsLoading(true)
    try {
      const res = await rateTraderAPI(username, stars, token)
      setUserRating(stars)
      setLocalAvg(Number(res.newAvgStars) || stars)
      setIsRating(false)
    } catch {
      showToast("error", "Failed to rate. Try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isRating) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleRate(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  star <= (hoverRating || userRating || 0) ? "fill-warning text-warning" : "text-muted-foreground",
                )}
              />
            </button>
          ))}
        </div>
        <button onClick={() => setIsRating(false)} className="text-xs text-muted-foreground hover:text-foreground">
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                sizeClasses[size],
                star <= Math.round(localAvg) ? "fill-warning text-warning" : "text-muted-foreground/30",
              )}
            />
          ))}
        </div>
        <span className="text-sm font-medium">{(Number(localAvg) || 0).toFixed(1)}</span>
        <span className="text-xs text-muted-foreground">({totalCount ?? 0})</span>
      </div>
      {showRateButton && (
        <button onClick={() => setIsRating(true)} className="text-xs text-primary hover:underline text-left">
          {userRating ? `Your rating: ${userRating} stars (tap to change)` : "Rate this trader"}
        </button>
      )}
    </div>
  )
}
