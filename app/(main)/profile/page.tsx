"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Suspense } from "react"
import { Settings, Edit, Trophy, Star, TrendingUp, Wallet, Award, Heart, Plus, FileText, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { SignalCard } from "@/components/signals/signal-card"
import { MySignalCard } from "@/components/profile/my-signal-card"
import { SubscriptionCard } from "@/components/wallet/subscription-card"
import { EmptyState } from "@/components/ui/empty-state"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { useUser } from "@/lib/user-context"
import { useWallet } from "@/lib/wallet-context"
import { useI18n } from "@/lib/i18n-context"
import { useSearchParams } from "next/navigation"
import { getMySignals, type ApiSignal } from "@/lib/services/signals-service"
import { getMyFavorites } from "@/lib/services/favorites-service"
import { cn } from "@/lib/utils"

function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "signals"
  const { t } = useI18n()

  const { profile, favorites, isLoggedIn, isHydrating, isWebApp, token } = useUser()
  const { balance } = useWallet()

  // ALL hooks must be called before any conditional returns
  const [userSignals, setUserSignals] = useState<ApiSignal[]>([])
  const [isLoadingSignals, setIsLoadingSignals] = useState(true)
  const [signalsError, setSignalsError] = useState<string | null>(null)

  const [favoriteSignals, setFavoriteSignals] = useState<ApiSignal[]>([])
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false)
  const [favoritesError, setFavoritesError] = useState<string | null>(null)

  const [profileStats, setProfileStats] = useState<{
    scoreXPoints: number
    rank: number
    totalSignals: number
    successfulSignals: number
    avgStars: number
    totalPLPercent: number
    subscribers: number
    avgDaysToResult: number
  } | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  const [signalsSubTab, setSignalsSubTab] = useState<"all" | "live" | "results">("all")

  useEffect(() => {
    if (!isHydrating && !isLoggedIn && !isWebApp) {
      router.push("/login")
    }
  }, [isLoggedIn, isHydrating, isWebApp, router])

  // Fetch user's signals from API
  useEffect(() => {
    async function fetchUserSignals() {
      if (!token || !profile) {
        setIsLoadingSignals(false)
        return
      }

      try {
        setIsLoadingSignals(true)
        setSignalsError(null)
        const response = await getMySignals(token)
        setUserSignals(response.signals || [])
      } catch (err) {
        setSignalsError(err instanceof Error ? err.message : "Failed to load signals")
        setUserSignals([])
      } finally {
        setIsLoadingSignals(false)
      }
    }

    fetchUserSignals()
  }, [token, profile])

  // Fetch full profile stats from /me/stats API
  useEffect(() => {
    async function fetchProfileStats() {
      if (!token) {
        setIsLoadingProfile(false)
        return
      }
      try {
        setIsLoadingProfile(true)
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/me/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        )
        if (!res.ok) throw new Error("Failed")
        const data = await res.json()
        setProfileStats(data)
      } catch {
        // silently fail — default 0 values used
      } finally {
        setIsLoadingProfile(false)
      }
    }
    if (token) {
      fetchProfileStats()
    } else {
      setIsLoadingProfile(false)
    }
  }, [token])

  // Fetch favorites when tab is "favorites"
  useEffect(() => {
    async function fetchFavorites() {
      if (tab !== "favorites" || !token) return
      
      setIsLoadingFavorites(true)
      setFavoritesError(null)
      try {
        const response = await getMyFavorites(token)
        setFavoriteSignals(response?.signals || [])
      } catch {
        setFavoriteSignals([])
      } finally {
        setIsLoadingFavorites(false)
      }
    }
    
    fetchFavorites()
  }, [tab, token])

  // Conditional returns AFTER all hooks
  if (isHydrating) {
    return <ProfileLoading />
  }
  if (!profile || !isLoggedIn) {
    return null
  }

  // Merge context profile with API stats (API takes priority)
  const displayProfile = {
    ...profile,
    rank: profileStats?.rank ?? profile.rank ?? 0,
    avgStars: profileStats?.avgStars ?? profile.avgStars ?? 0,
    totalPLPercent: profileStats?.totalPLPercent ?? profile.totalPLPercent ?? 0,
    totalSignals: profileStats?.totalSignals ?? profile.totalSignals ?? 0,
    successfulSignals: profileStats?.successfulSignals ?? 0,
    subscribers: profileStats?.subscribers ?? profile.subscribers ?? 0,
    scoreXPoints: profileStats?.scoreXPoints ?? profile.scoreXPoints ?? 0,
    avgDaysToResult: profileStats?.avgDaysToResult ?? 0,
  }
  const winRate = displayProfile.totalSignals > 0
    ? Math.round((displayProfile.successfulSignals / displayProfile.totalSignals) * 100)
    : 0

  // Favorites count - use loaded data if available, otherwise context
  const favoritesCount = favoriteSignals.length || favorites?.length || 0

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      {/* Profile Header */}
      <Card className="mb-6 overflow-hidden">
        <div className="bg-primary p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Avatar className="h-20 w-20 border-4 border-primary-foreground/20">
                <AvatarImage src={displayProfile.avatar || "/placeholder.svg"} alt={displayProfile.username} />
                <AvatarFallback className="text-2xl">
                  {displayProfile.username ? displayProfile.username.slice(0, 2).toUpperCase() : "??"}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold text-primary-foreground">
                  {displayProfile.displayName || displayProfile.username || "User"}
                </h1>
                <p className="text-sm text-primary-foreground/80">
                  @{displayProfile.telegramUsername || (displayProfile.username || "user").toLowerCase()}
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm text-primary-foreground/80 sm:justify-start">
                  {isLoadingProfile ? (
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-16 rounded" />
                      <Skeleton className="h-4 w-14 rounded" />
                      <Skeleton className="h-4 w-10 rounded" />
                      <Skeleton className="h-4 w-12 rounded" />
                    </div>
                  ) : (
                    <>
                      <span className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        {displayProfile.scoreXPoints} pts
                      </span>
                      <span>Rank #{displayProfile.rank || "\u2014"}</span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-current" />
                        {displayProfile.avgStars.toFixed(1)}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />+{displayProfile.totalPLPercent}%
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
              <Link href="/profile/edit">
                <Button variant="secondary" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  {t("action.edit")}
                </Button>
              </Link>
              <Link href="/signals/add">
                <Button size="sm" className="bg-background text-foreground hover:bg-background/90">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("nav.addSignal")}
                </Button>
              </Link>
              <Link href="/wallet">
                <Button variant="secondary" size="sm">
                  <Wallet className="mr-2 h-4 w-4" />${balance.toFixed(0)}
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4">
            {/* Row 1 */}
            <div className="text-center">
              {isLoadingProfile
                ? <><Skeleton className="h-7 w-14 mx-auto mb-1" /><Skeleton className="h-3 w-20 mx-auto" /></>
                : <><div className="text-2xl font-bold">{displayProfile.totalSignals}</div><div className="text-xs text-muted-foreground">Total Signals</div></>
              }
            </div>
            <div className="text-center">
              {isLoadingProfile
                ? <><Skeleton className="h-7 w-12 mx-auto mb-1" /><Skeleton className="h-3 w-16 mx-auto" /></>
                : <>
                    <div className={cn("text-2xl font-bold", winRate >= 50 ? "text-success" : winRate > 0 ? "text-destructive" : "")}>
                      {displayProfile.totalSignals > 0 ? `${winRate}%` : "\u2014"}
                    </div>
                    <div className="text-xs text-muted-foreground">Win Rate</div>
                  </>
              }
            </div>
            <div className="text-center">
              {isLoadingProfile
                ? <><Skeleton className="h-7 w-16 mx-auto mb-1" /><Skeleton className="h-3 w-16 mx-auto" /></>
                : <>
                    <div className={cn("text-2xl font-bold", displayProfile.totalPLPercent >= 0 ? "text-success" : "text-destructive")}>
                      {displayProfile.totalPLPercent >= 0 ? "+" : ""}{displayProfile.totalPLPercent}%
                    </div>
                    <div className="text-xs text-muted-foreground">Total P/L</div>
                  </>
              }
            </div>
            {/* Row 2 */}
            <div className="text-center">
              {isLoadingProfile
                ? <><Skeleton className="h-7 w-14 mx-auto mb-1" /><Skeleton className="h-3 w-20 mx-auto" /></>
                : <><div className="text-2xl font-bold">{displayProfile.scoreXPoints}</div><div className="text-xs text-muted-foreground">ScoreX Points</div></>
              }
            </div>
            <div className="text-center">
              {isLoadingProfile
                ? <><Skeleton className="h-7 w-10 mx-auto mb-1" /><Skeleton className="h-3 w-18 mx-auto" /></>
                : <><div className="text-2xl font-bold flex items-center justify-center gap-1"><Users className="h-5 w-5 text-muted-foreground" />{displayProfile.subscribers}</div><div className="text-xs text-muted-foreground">Subscribers</div></>
              }
            </div>
            <div className="text-center">
              {isLoadingProfile
                ? <><Skeleton className="h-7 w-12 mx-auto mb-1" /><Skeleton className="h-3 w-14 mx-auto" /></>
                : <>
                    <div className="text-2xl font-bold flex items-center justify-center gap-1 text-muted-foreground">
                      <Clock className="h-5 w-5" />
                      {displayProfile.avgDaysToResult > 0 ? `${displayProfile.avgDaysToResult.toFixed(1)}d` : "\u2014"}
                    </div>
                    <div className="text-xs text-muted-foreground">Avg Days</div>
                  </>
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link href="/wallet">
          <Card className="transition-shadow hover:shadow-md h-full">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold font-mono truncate">${balance.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">{t("nav.wallet")}</div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/profile?tab=favorites">
          <Card className="transition-shadow hover:shadow-md h-full">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 shrink-0">
                <Heart className="h-5 w-5 text-destructive" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold">{favoritesCount}</div>
                <div className="text-xs text-muted-foreground">{t("profile.favorites")}</div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/profile?tab=certificates">
          <Card className="transition-shadow hover:shadow-md h-full">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 shrink-0">
                <Award className="h-5 w-5 text-warning" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-muted-foreground">{"\u2014"}</div>
                <div className="text-xs text-muted-foreground">Coming Soon</div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/profile/settings">
          <Card className="transition-shadow hover:shadow-md h-full">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold">{t("nav.settings")}</div>
                <div className="text-xs text-muted-foreground">Preferences</div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs value={tab}>
        {/* Mobile: Select dropdown */}
        <div className="mb-6 sm:hidden">
          <Select value={tab} onValueChange={(value) => router.push(`/profile?tab=${value}`)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select tab" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="signals">{t("profile.mySignals")}</SelectItem>
              <SelectItem value="favorites">{t("profile.favorites")}</SelectItem>
              <SelectItem value="certificates">{t("profile.certificates")}</SelectItem>
              <SelectItem value="subscription">{t("profile.subscription")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: TabsList */}
        <TabsList className="mb-6 hidden w-full grid-cols-4 sm:grid">
          <TabsTrigger value="signals" asChild>
            <Link href="/profile?tab=signals" className="flex items-center gap-1.5">
              {t("profile.mySignals")}
              {!isLoadingSignals && userSignals.length > 0 && (
                <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-xs font-medium text-primary leading-none">
                  {userSignals.length}
                </span>
              )}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="favorites" asChild>
            <Link href="/profile?tab=favorites" className="flex items-center gap-1.5">
              {t("profile.favorites")}
              {favoritesCount > 0 && (
                <span className="rounded-full bg-destructive/15 px-1.5 py-0.5 text-xs font-medium text-destructive leading-none">
                  {favoritesCount}
                </span>
              )}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="certificates" asChild>
            <Link href="/profile?tab=certificates">{t("profile.certificates")}</Link>
          </TabsTrigger>
          <TabsTrigger value="subscription" asChild>
            <Link href="/profile?tab=subscription">{t("profile.subscription")}</Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signals">
          {isLoadingSignals ? (
            <div className="space-y-4">{[1,2,3].map(i => <SkeletonCard key={i} variant="signal" />)}</div>
          ) : signalsError ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <p className="text-sm text-destructive">{signalsError}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          ) : (
            <>
              {/* Sub-filter pills */}
              {userSignals.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {(["all", "live", "results"] as const).map(f => {
                    const count = f === "all"
                      ? userSignals.length
                      : f === "live"
                        ? userSignals.filter(s => ["WAITING_ENTRY","ACTIVE","HOLD"].includes(s.status)).length
                        : userSignals.filter(s => ["TP1_HIT","TP2_HIT","SL_HIT","CANCEL"].includes(s.status)).length
                    return (
                      <button
                        key={f}
                        onClick={() => setSignalsSubTab(f)}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                          signalsSubTab === f
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {f === "all" ? "All" : f === "live" ? "Live" : "Results"}
                        <span className="ml-1 opacity-60">({count})</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Signals list */}
              {(() => {
                const filtered = signalsSubTab === "all"
                  ? userSignals
                  : signalsSubTab === "live"
                    ? userSignals.filter(s => ["WAITING_ENTRY","ACTIVE","HOLD"].includes(s.status))
                    : userSignals.filter(s => ["TP1_HIT","TP2_HIT","SL_HIT","CANCEL"].includes(s.status))

                return filtered.length > 0 ? (
                  <div className="space-y-4">
                    {filtered.map(signal => (
                      <MySignalCard
                        key={signal.id}
                        signal={signal as any}
                        token={token || undefined}
                        onCancel={(id) => setUserSignals(prev =>
                          prev.map(s => s.id === id ? { ...s, status: "CANCEL" } : s)
                        )}
                      />
                    ))}
                  </div>
                ) : userSignals.length === 0 ? (
                  <EmptyState icon={FileText} title={t("profile.noSignals")} description={t("profile.noSignalsDesc")} action={{ label: t("nav.addSignal"), href: "/signals/add" }} />
                ) : (
                  <EmptyState icon={FileText} title="No signals in this category" description="Switch to 'All' to see all your signals." />
                )
              })()}
            </>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          {isLoadingFavorites ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} variant="signal" />
              ))}
            </div>
          ) : favoritesError ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <p className="text-sm text-destructive">{favoritesError}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : favoriteSignals.length > 0 ? (
            favoriteSignals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))
          ) : (
            <EmptyState
              icon={Heart}
              title={t("profile.noFavorites")}
              description={t("profile.noFavoritesDesc")}
              action={{ label: t("nav.signals"), href: "/signals" }}
            />
          )}
        </TabsContent>

        <TabsContent value="certificates">
          <EmptyState
            icon={Award}
            title="Certificates Coming Soon"
            description="Earn certificates by completing trading challenges and maintaining consistent performance."
            className="py-12"
          />
        </TabsContent>

        <TabsContent value="subscription">
          <div className="max-w-md">
            <SubscriptionCard />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProfileLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <SkeletonCard variant="profile" className="mb-6" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="h-10 animate-pulse rounded bg-muted mb-6" />
      <div className="space-y-4">
        <SkeletonCard variant="signal" />
        <SkeletonCard variant="signal" />
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileContent />
    </Suspense>
  )
}
