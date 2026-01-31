"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Suspense } from "react"
import { Settings, Edit, Trophy, Star, TrendingUp, Wallet, Award, Heart, Plus, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "signals"
  const { t } = useI18n()

  const { profile, favorites, isLoggedIn, token } = useUser()
  const { balance } = useWallet()

  // State for user signals from API
  const [userSignals, setUserSignals] = useState<ApiSignal[]>([])
  const [isLoadingSignals, setIsLoadingSignals] = useState(true)
  const [signalsError, setSignalsError] = useState<string | null>(null)

  // State for favorite signals from API
  const [favoriteSignals, setFavoriteSignals] = useState<ApiSignal[]>([])
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false)
  const [favoritesError, setFavoritesError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [isLoggedIn, router])

  // Fetch user's signals from API
  useEffect(() => {
    async function fetchUserSignals() {
      if (!token) {
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
  }, [token])

  // Fetch favorites when tab is "favorites"
  useEffect(() => {
    async function fetchFavorites() {
      if (tab !== "favorites" || !token) return
      
      setIsLoadingFavorites(true)
      setFavoritesError(null)
      try {
        const response = await getMyFavorites(token)
        // Backend returns { signals: [...], total: number }
        setFavoriteSignals(response.signals || [])
      } catch (err) {
        console.error("Failed to fetch favorites:", err)
        setFavoritesError(err instanceof Error ? err.message : "Failed to load favorites")
      } finally {
        setIsLoadingFavorites(false)
      }
    }
    
    fetchFavorites()
  }, [tab, token])

  if (!isLoggedIn) {
    return null
  }

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
                <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.username} />
                <AvatarFallback className="text-2xl">{profile.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold text-primary-foreground">{profile.displayName}</h1>
                <p className="text-sm text-primary-foreground/80">@{profile.username.toLowerCase()}</p>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm text-primary-foreground/80 sm:justify-start">
                  <span className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    {profile.scoreXPoints} pts
                  </span>
                  <span>Rank #{profile.rank}</span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current" />
                    {profile.avgStars.toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />+{profile.totalPLPercent}%
                  </span>
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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{profile.totalSignals}</div>
              <div className="text-xs text-muted-foreground">Total Signals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">+{profile.totalPLPercent}%</div>
              <div className="text-xs text-muted-foreground">Total P/L</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{profile.scoreXPoints}</div>
              <div className="text-xs text-muted-foreground">ScoreX Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{profile.subscribers}</div>
              <div className="text-xs text-muted-foreground">Subscribers</div>
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
                <div className="text-sm font-semibold">0</div>
                <div className="text-xs text-muted-foreground">{t("profile.certificates")}</div>
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
      <Tabs defaultValue={tab}>
        <TabsList className="mb-6 grid w-full grid-cols-4">
          <TabsTrigger value="signals" asChild>
            <Link href="/profile?tab=signals" className="text-xs sm:text-sm">
              {t("profile.mySignals")}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="favorites" asChild>
            <Link href="/profile?tab=favorites" className="text-xs sm:text-sm">
              {t("profile.favorites")}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="certificates" asChild>
            <Link href="/profile?tab=certificates" className="text-xs sm:text-sm">
              {t("profile.certificates")}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="subscription" asChild>
            <Link href="/profile?tab=subscription" className="text-xs sm:text-sm">
              {t("profile.subscription")}
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signals" className="space-y-4">
          {isLoadingSignals ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} variant="signal" />
              ))}
            </div>
          ) : signalsError ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <p className="text-sm text-destructive">{signalsError}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : userSignals.length > 0 ? (
            userSignals.map((signal) => <MySignalCard key={signal.id} signal={signal as any} />)
          ) : (
            <EmptyState
              icon={FileText}
              title={t("profile.noSignals")}
              description={t("profile.noSignalsDesc")}
              action={{ label: t("nav.addSignal"), href: "/signals/add" }}
            />
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
