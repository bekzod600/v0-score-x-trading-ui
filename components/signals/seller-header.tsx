import Link from "next/link"
import { Trophy, Star, TrendingUp, Hash } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

// Define Trader interface locally to avoid mock-data dependency
interface Trader {
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

interface SellerHeaderProps {
  trader: Trader | Partial<Trader>
  variant?: "card" | "detail"
}

export function SellerHeader({ trader, variant = "card" }: SellerHeaderProps) {
  const isDetail = variant === "detail"
  
  // Safe defaults for all trader properties
  const username = trader?.username || "Unknown"
  const avatar = trader?.avatar || ""
  const scoreXPoints = trader?.scoreXPoints ?? 0
  const rank = trader?.rank ?? 0
  const avgStars = trader?.avgStars ?? 0
  const totalPLPercent = trader?.totalPLPercent ?? 0
  const totalSignals = trader?.totalSignals ?? 0

  return (
    <div className="bg-primary px-3 py-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/u/${username}`}>
            <Avatar className={cn("border-2 border-primary-foreground/20", isDetail ? "h-11 w-11" : "h-9 w-9")}>
              <AvatarImage src={avatar || "/placeholder.svg"} alt={username} />
              <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground text-xs">
                {username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link
              href={`/u/${username}`}
              className={cn(
                "font-semibold text-primary-foreground hover:underline",
                isDetail ? "text-base" : "text-sm",
              )}
            >
              {username}
            </Link>
            <div className="flex items-center gap-2 text-xs text-primary-foreground/80">
              <span className="flex items-center gap-0.5">
                <Trophy className="h-3 w-3" />
                {scoreXPoints}
              </span>
              <span className="flex items-center gap-0.5">
                <Hash className="h-3 w-3" />
                {rank}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5 text-xs text-primary-foreground/80">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-primary-foreground/80" />
            {avgStars.toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span className={totalPLPercent >= 0 ? "text-primary-foreground" : "text-destructive"}>
              {totalPLPercent >= 0 ? "+" : ""}
              {totalPLPercent}%
            </span>
          </span>
          <span className="text-primary-foreground/60">{totalSignals} signals</span>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
