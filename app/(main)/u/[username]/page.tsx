"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Trophy, TrendingUp, Users, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SignalCard } from "@/components/signals/signal-card"
import { StarRating } from "@/components/profile/star-rating"
import { SubscribeButton } from "@/components/profile/subscribe-button"
import { useSearchParams } from "next/navigation"
import { getTraderByUsername, getTraderSignals, type ApiTrader, type ApiSignal } from "@/lib/services/signals-service"

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "live"

  const [trader, setTrader] = useState<ApiTrader | null>(null)
  const [signals, setSignals] = useState<ApiSignal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTraderData() {
      setIsLoading(true)
      setError(null)
      try {
        const [traderData, signalsData] = await Promise.all([
          getTraderByUsername(username),
          getTraderSignals(username),
        ])
        setTrader(traderData)
        setSignals(signalsData.signals)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load trader profile")
      } finally {
        setIsLoading(false)
      }
    }
    fetchTraderData()
  }, [username])

  const liveSignals = signals.filter((s) => ["WAITING_ENTRY", "ACTIVE"].includes(s.status))
  const resultSignals = signals.filter((s) =>
    ["TP1_HIT", "TP2_HIT", "SL_HIT", "HOLD", "CANCEL"].includes(s.status),
  )

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading trader profile...</p>
        </div>
      </div>
    )
  }

  if (error || !trader) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-destructive">{error || "Trader not found"}</p>
          <Link href="/rating" className="text-primary hover:underline">
            Back to Leaderboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Link href="/rating" className="mb-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Leaderboard
      </Link>

      {/* Profile Header */}
      <Card className="mb-6 overflow-hidden">
        <div className="bg-primary p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20 border-4 border-primary-foreground/20">
              <AvatarImage src={trader.avatar || "/placeholder.svg"} alt={trader.username} />
              <AvatarFallback className="text-2xl">{trader.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-primary-foreground">{trader.username}</h1>
              <p className="text-primary-foreground/80">@{trader.username.toLowerCase()}</p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-primary-foreground/80 sm:justify-start">
                <span className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  {trader.scoreXPoints} pts
                </span>
                <span className="flex items-center gap-1">Rank #{trader.rank}</span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />+{trader.totalPLPercent}%
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {trader.subscribers}
                </span>
              </div>
            </div>
            <SubscribeButton traderId={trader.id} traderUsername={trader.username} />
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{trader.totalSignals}</div>
              <div className="text-sm text-muted-foreground">Total Signals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">+{trader.totalPLPercent}%</div>
              <div className="text-sm text-muted-foreground">Total P/L</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{trader.scoreXPoints}</div>
              <div className="text-sm text-muted-foreground">ScoreX Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{trader.subscribers}</div>
              <div className="text-sm text-muted-foreground">Subscribers</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Trader */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <span className="font-medium">Trader Rating</span>
            <StarRating
              traderId={trader.id}
              avgStars={trader.avgStars}
              totalCount={156}
              size="lg"
              showRateButton={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* Signals */}
      <Tabs defaultValue={tab}>
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="live" asChild>
            <Link href={`/u/${username}?tab=live`}>Live Signals ({liveSignals.length})</Link>
          </TabsTrigger>
          <TabsTrigger value="results" asChild>
            <Link href={`/u/${username}?tab=results`}>Results ({resultSignals.length})</Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          {liveSignals.length > 0 ? (
            liveSignals.map((signal) => <SignalCard key={signal.id} signal={signal} />)
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No live signals from this trader</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {resultSignals.length > 0 ? (
            resultSignals.map((signal) => <SignalCard key={signal.id} signal={signal} isResult />)
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No results yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
