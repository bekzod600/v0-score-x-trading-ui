import Link from "next/link"
import { Trophy, Star, TrendingUp, Hash } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import type { Trader } from "@/lib/mock-data"

interface SellerHeaderProps {
  trader: Trader
  variant?: "card" | "detail"
}

export function SellerHeader({ trader, variant = "card" }: SellerHeaderProps) {
  const isDetail = variant === "detail"

  return (
    <div className="bg-primary px-3 py-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/u/${trader.username}`}>
            <Avatar className={cn("border-2 border-primary-foreground/20", isDetail ? "h-11 w-11" : "h-9 w-9")}>
              <AvatarImage src={trader.avatar || "/placeholder.svg"} alt={trader.username} />
              <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground text-xs">
                {trader.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link
              href={`/u/${trader.username}`}
              className={cn(
                "font-semibold text-primary-foreground hover:underline",
                isDetail ? "text-base" : "text-sm",
              )}
            >
              {trader.username}
            </Link>
            <div className="flex items-center gap-2 text-xs text-primary-foreground/80">
              <span className="flex items-center gap-0.5">
                <Trophy className="h-3 w-3" />
                {trader.scoreXPoints}
              </span>
              <span className="flex items-center gap-0.5">
                <Hash className="h-3 w-3" />
                {trader.rank}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5 text-xs text-primary-foreground/80">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-primary-foreground/80" />
            {trader.avgStars.toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span className={trader.totalPLPercent >= 0 ? "text-primary-foreground" : "text-destructive"}>
              {trader.totalPLPercent >= 0 ? "+" : ""}
              {trader.totalPLPercent}%
            </span>
          </span>
          <span className="text-primary-foreground/60">{trader.totalSignals} signals</span>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
