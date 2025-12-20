"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@/lib/user-context"

interface StarRatingProps {
  traderId: string
  avgStars: number
  totalCount: number
  size?: "sm" | "md" | "lg"
  showRateButton?: boolean
}

export function StarRating({ traderId, avgStars, totalCount, size = "md", showRateButton = false }: StarRatingProps) {
  const { getUserRating, rateTrader, isLoggedIn } = useUser()
  const [hoverRating, setHoverRating] = useState(0)
  const [isRating, setIsRating] = useState(false)
  const userRating = getUserRating(traderId)

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  const handleRate = (stars: number) => {
    if (!isLoggedIn) {
      // Would redirect to login in real app
      return
    }
    rateTrader(traderId, stars)
    setIsRating(false)
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
                star <= Math.round(avgStars) ? "fill-warning text-warning" : "text-muted-foreground/30",
              )}
            />
          ))}
        </div>
        <span className="text-sm font-medium">{avgStars.toFixed(1)}</span>
        <span className="text-xs text-muted-foreground">({totalCount})</span>
      </div>
      {showRateButton && (
        <button onClick={() => setIsRating(true)} className="text-xs text-primary hover:underline text-left">
          {userRating ? `Your rating: ${userRating} stars (tap to change)` : "Rate this trader"}
        </button>
      )}
    </div>
  )
}
