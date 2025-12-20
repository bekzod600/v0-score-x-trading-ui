"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Trophy, Star, ChevronDown, Users, GraduationCap, MapPin, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import { cn } from "@/lib/utils"
import { mockTraders } from "@/lib/mock-data"
import { useAdmin } from "@/lib/admin-context"

type TraderSortBy = "scorex" | "profit" | "stars"
type CenterSortBy = "rating" | "students" | "newest"

function formatProfitPercent(value: number): string {
  const formatted = value.toFixed(1)
  if (value > 0) return `+${formatted}%`
  if (value === 0) return "0.0%"
  return `${formatted}%`
}

export default function RatingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tab = searchParams.get("tab") || "traders"

  const [traderSortBy, setTraderSortBy] = useState<TraderSortBy>("scorex")
  const [centerSortBy, setCenterSortBy] = useState<CenterSortBy>("rating")

  const { trainingCenters } = useAdmin()

  // Filter only approved centers
  const approvedCenters = trainingCenters.filter((c) => c.status === "approved")

  const sortedTraders = [...mockTraders].sort((a, b) => {
    switch (traderSortBy) {
      case "profit":
        return b.totalPLPercent - a.totalPLPercent
      case "stars":
        return b.avgStars - a.avgStars
      case "scorex":
      default:
        return b.scoreXPoints - a.scoreXPoints
    }
  })

  const sortedCenters = [...approvedCenters].sort((a, b) => {
    switch (centerSortBy) {
      case "students":
        return b.studentsCount - a.studentsCount
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "rating":
      default:
        return b.rating - a.rating
    }
  })

  const traderSortLabels: Record<TraderSortBy, string> = {
    scorex: "ScoreX Points",
    profit: "Total Profit",
    stars: "Average Stars",
  }

  const centerSortLabels: Record<CenterSortBy, string> = {
    rating: "Top Rated",
    students: "Most Students",
    newest: "Newest",
  }

  const handleTabChange = (newTab: string) => {
    router.push(`/rating?tab=${newTab}`)
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">Leaderboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Top performers on ScoreX</p>
      </div>

      <div className="mb-6 flex gap-2 border-b border-border">
        <button
          onClick={() => handleTabChange("traders")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
            tab === "traders"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <Trophy className="h-4 w-4" />
          Traders
        </button>
        <button
          onClick={() => handleTabChange("centers")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
            tab === "centers"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <GraduationCap className="h-4 w-4" />
          Training Centers
        </button>
      </div>

      {tab === "traders" ? (
        <>
          {/* Sort dropdown */}
          <div className="mb-6 flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  Sort by: {traderSortLabels[traderSortBy]}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTraderSortBy("scorex")}>ScoreX Points</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTraderSortBy("profit")}>Total Profit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTraderSortBy("stars")}>Average Stars</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {sortedTraders.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No traders yet"
              description="Be the first to join and start climbing the leaderboard!"
            />
          ) : (
            <>
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Top Performers</h2>
                </div>

                {/* Podium layout: #2 left, #1 center (elevated), #3 right */}
                <div className="grid grid-cols-3 gap-3 items-end">
                  {/* #2 - Silver */}
                  {sortedTraders[1] && (
                    <Link href={`/u/${sortedTraders[1].username}`} className="block">
                      <Card className="relative overflow-hidden transition-all hover:shadow-lg border-muted-foreground/20 bg-gradient-to-b from-card to-muted/30 dark:from-card dark:to-muted/20">
                        <div className="absolute top-2 left-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted-foreground/20 text-xs font-bold text-foreground shadow-sm">
                            2
                          </div>
                        </div>
                        <CardContent className="flex flex-col items-center pt-10 pb-5 px-3">
                          <Avatar className="mb-3 h-14 w-14 ring-2 ring-muted-foreground/30 ring-offset-2 ring-offset-background">
                            <AvatarImage
                              src={sortedTraders[1].avatar || "/placeholder.svg"}
                              alt={sortedTraders[1].username}
                            />
                            <AvatarFallback>{sortedTraders[1].username.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <h3 className="mb-1 text-sm font-semibold truncate max-w-full">
                            {sortedTraders[1].username}
                          </h3>
                          <div className="flex items-center gap-1 text-sm font-bold text-primary">
                            <Trophy className="h-3.5 w-3.5" />
                            {sortedTraders[1].scoreXPoints}
                          </div>
                          <div className="mt-2 flex flex-col items-center gap-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current text-primary" />
                              {sortedTraders[1].avgStars.toFixed(1)}
                            </span>
                            <span
                              className={cn(
                                "font-medium",
                                sortedTraders[1].totalPLPercent >= 0 ? "text-success" : "text-destructive",
                              )}
                            >
                              {formatProfitPercent(sortedTraders[1].totalPLPercent)}
                            </span>
                            <span>{sortedTraders[1].totalSignals} signals</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )}

                  {/* #1 - Gold (Center, elevated) */}
                  {sortedTraders[0] && (
                    <Link href={`/u/${sortedTraders[0].username}`} className="block -mt-4">
                      <Card className="relative overflow-hidden transition-all hover:shadow-xl border-primary/30 bg-gradient-to-b from-primary/10 via-card to-primary/5 dark:from-primary/20 dark:via-card dark:to-primary/10 shadow-lg shadow-primary/10">
                        <div className="absolute top-2 left-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-md">
                            <Trophy className="h-4 w-4" />
                          </div>
                        </div>
                        <CardContent className="flex flex-col items-center pt-12 pb-6 px-3">
                          <Avatar
                            className="mb-3 h-18 w-18 ring-3 ring-primary/50 ring-offset-2 ring-offset-background shadow-lg"
                            style={{ height: "4.5rem", width: "4.5rem" }}
                          >
                            <AvatarImage
                              src={sortedTraders[0].avatar || "/placeholder.svg"}
                              alt={sortedTraders[0].username}
                            />
                            <AvatarFallback className="text-lg">
                              {sortedTraders[0].username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="mb-1 text-base font-bold truncate max-w-full">{sortedTraders[0].username}</h3>
                          <div className="flex items-center gap-1.5 text-base font-bold text-primary">
                            <Trophy className="h-4 w-4" />
                            {sortedTraders[0].scoreXPoints}
                          </div>
                          <div className="mt-3 flex flex-col items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-current text-primary" />
                              {sortedTraders[0].avgStars.toFixed(1)} avg
                            </span>
                            <span
                              className={cn(
                                "font-semibold text-sm",
                                sortedTraders[0].totalPLPercent >= 0 ? "text-success" : "text-destructive",
                              )}
                            >
                              {formatProfitPercent(sortedTraders[0].totalPLPercent)}
                            </span>
                            <span>{sortedTraders[0].totalSignals} signals</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )}

                  {/* #3 - Bronze */}
                  {sortedTraders[2] && (
                    <Link href={`/u/${sortedTraders[2].username}`} className="block">
                      <Card className="relative overflow-hidden transition-all hover:shadow-lg border-warning/20 bg-gradient-to-b from-card to-warning/5 dark:from-card dark:to-warning/10">
                        <div className="absolute top-2 left-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-warning/20 text-xs font-bold text-warning shadow-sm">
                            3
                          </div>
                        </div>
                        <CardContent className="flex flex-col items-center pt-10 pb-5 px-3">
                          <Avatar className="mb-3 h-14 w-14 ring-2 ring-warning/30 ring-offset-2 ring-offset-background">
                            <AvatarImage
                              src={sortedTraders[2].avatar || "/placeholder.svg"}
                              alt={sortedTraders[2].username}
                            />
                            <AvatarFallback>{sortedTraders[2].username.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <h3 className="mb-1 text-sm font-semibold truncate max-w-full">
                            {sortedTraders[2].username}
                          </h3>
                          <div className="flex items-center gap-1 text-sm font-bold text-primary">
                            <Trophy className="h-3.5 w-3.5" />
                            {sortedTraders[2].scoreXPoints}
                          </div>
                          <div className="mt-2 flex flex-col items-center gap-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current text-primary" />
                              {sortedTraders[2].avgStars.toFixed(1)}
                            </span>
                            <span
                              className={cn(
                                "font-medium",
                                sortedTraders[2].totalPLPercent >= 0 ? "text-success" : "text-destructive",
                              )}
                            >
                              {formatProfitPercent(sortedTraders[2].totalPLPercent)}
                            </span>
                            <span>{sortedTraders[2].totalSignals} signals</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )}
                </div>
              </div>

              {/* Full Leaderboard Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">All Traders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto -mx-6 px-6">
                    <table className="w-full min-w-[500px]">
                      <thead className="sticky top-0 bg-card z-10">
                        <tr className="border-b border-border text-left text-xs text-muted-foreground">
                          <th className="pb-3 pr-4 font-medium">Rank</th>
                          <th className="pb-3 pr-4 font-medium">Trader</th>
                          <th className="pb-3 pr-4 text-right font-medium">ScoreX</th>
                          <th className="pb-3 pr-4 text-right font-medium">Stars</th>
                          <th className="hidden pb-3 pr-4 text-right font-medium sm:table-cell">Signals</th>
                          <th className="pb-3 text-right font-medium">Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedTraders.map((trader, index) => (
                          <tr key={trader.id} className="border-b border-border last:border-0">
                            <td className="py-4 pr-4">
                              <span
                                className={cn(
                                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                                  index === 0 && "bg-primary text-primary-foreground",
                                  index === 1 && "bg-muted-foreground/20",
                                  index === 2 && "bg-warning/20 text-warning",
                                  index > 2 && "text-muted-foreground",
                                )}
                              >
                                {index + 1}
                              </span>
                            </td>
                            <td className="py-4 pr-4">
                              <Link href={`/u/${trader.username}`} className="flex items-center gap-3 hover:underline">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={trader.avatar || "/placeholder.svg"} alt={trader.username} />
                                  <AvatarFallback className="text-xs">
                                    {trader.username.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{trader.username}</span>
                              </Link>
                            </td>
                            <td className="py-4 pr-4 text-right font-mono text-sm font-semibold text-primary">
                              {trader.scoreXPoints}
                            </td>
                            <td className="py-4 pr-4 text-right">
                              <span className="flex items-center justify-end gap-1 text-sm">
                                <Star className="h-3 w-3 fill-current text-primary" />
                                {trader.avgStars.toFixed(1)}
                              </span>
                            </td>
                            <td className="hidden py-4 pr-4 text-right text-sm sm:table-cell">{trader.totalSignals}</td>
                            <td
                              className={cn(
                                "py-4 text-right font-mono text-sm font-semibold",
                                trader.totalPLPercent >= 0 ? "text-success" : "text-destructive",
                              )}
                            >
                              {formatProfitPercent(trader.totalPLPercent)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      ) : (
        <>
          <div className="mb-6 flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  Sort by: {centerSortLabels[centerSortBy]}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setCenterSortBy("rating")}>Top Rated</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCenterSortBy("students")}>Most Students</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCenterSortBy("newest")}>Newest</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {approvedCenters.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No training centers yet"
              description="Be the first to register your training center!"
              action={
                <Link href="/training-centers/register">
                  <Button>Register Center</Button>
                </Link>
              }
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Training Centers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-6 px-6">
                  <table className="w-full min-w-[600px]">
                    <thead className="sticky top-0 bg-card z-10">
                      <tr className="border-b border-border text-left text-xs text-muted-foreground">
                        <th className="pb-3 pr-4 font-medium">Rank</th>
                        <th className="pb-3 pr-4 font-medium">Center</th>
                        <th className="pb-3 pr-4 font-medium">City</th>
                        <th className="pb-3 pr-4 text-right font-medium">Rating</th>
                        <th className="pb-3 pr-4 text-right font-medium">Students</th>
                        <th className="hidden pb-3 text-right font-medium sm:table-cell">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...approvedCenters]
                        .sort((a, b) => {
                          switch (centerSortBy) {
                            case "students":
                              return b.studentsCount - a.studentsCount
                            case "newest":
                              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                            case "rating":
                            default:
                              return b.rating - a.rating
                          }
                        })
                        .map((center, index) => (
                          <tr
                            key={center.id}
                            className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-4 pr-4">
                              <span
                                className={cn(
                                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                                  index === 0 && "bg-primary text-primary-foreground",
                                  index === 1 && "bg-muted-foreground/20",
                                  index === 2 && "bg-warning/20 text-warning",
                                  index > 2 && "text-muted-foreground",
                                )}
                              >
                                {index + 1}
                              </span>
                            </td>
                            <td className="py-4 pr-4">
                              <Link
                                href={`/training-centers/${center.id}`}
                                className="flex items-center gap-3 hover:underline"
                              >
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={center.logo || "/placeholder.svg"} alt={center.name} />
                                  <AvatarFallback className="text-xs">
                                    {center.name.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{center.name}</span>
                              </Link>
                            </td>
                            <td className="py-4 pr-4">
                              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {center.city}
                              </span>
                            </td>
                            <td className="py-4 pr-4 text-right">
                              <span className="flex items-center justify-end gap-1 text-sm">
                                <Star className="h-3 w-3 fill-current text-primary" />
                                {center.rating.toFixed(1)}
                                <span className="text-muted-foreground">({center.ratingCount})</span>
                              </span>
                            </td>
                            <td className="py-4 pr-4 text-right">
                              <span className="flex items-center justify-end gap-1 text-sm">
                                <Users className="h-3 w-3 text-muted-foreground" />
                                {center.studentsCount}
                              </span>
                            </td>
                            <td className="hidden py-4 text-right text-sm text-muted-foreground sm:table-cell">
                              <span className="flex items-center justify-end gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(center.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
