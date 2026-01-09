"use client"

import { useState, useMemo, useEffect, Suspense, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Filter, TrendingUp, RefreshCw, Save, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SignalCard } from "@/components/signals/signal-card"
import { SignalTabs } from "@/components/signals/signal-tabs"
import { SignalFilters, ActiveFilterChips } from "@/components/signals/signal-filters"
import { EmptyState } from "@/components/ui/empty-state"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { useI18n } from "@/lib/i18n-context"
import { useUser } from "@/lib/user-context"
import { listSignals, type ApiSignal } from "@/lib/services/signals-service"
import { listFilters, createFilter, type SavedFilter } from "@/lib/services/filters-service"
import { type FilterState, type SignalStatus, defaultFilters } from "@/lib/mock-data"

function calculatePotentialProfitFromApi(signal: ApiSignal): number {
  if (!signal.entry || !signal.tp2) return 0
  return Number((((signal.tp2 - signal.entry) / signal.entry) * 100).toFixed(1))
}

function calculatePotentialLossFromApi(signal: ApiSignal): number {
  if (!signal.entry || !signal.sl) return 0
  return Number((((signal.entry - signal.sl) / signal.entry) * 100).toFixed(1))
}

function calculateRiskRatioFromApi(signal: ApiSignal): number {
  const profit = calculatePotentialProfitFromApi(signal)
  const loss = calculatePotentialLossFromApi(signal)
  if (loss === 0) return 0
  return Number((profit / loss).toFixed(1))
}

function SignalsContent() {
  const searchParams = useSearchParams()
  const { t } = useI18n()
  const { isLoggedIn, token } = useUser()
  const tabParam = searchParams.get("tab")
  const activeTab = (tabParam === "results" ? "results" : "live") as "live" | "results"

  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const [signals, setSignals] = useState<ApiSignal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [savedFiltersLoading, setSavedFiltersLoading] = useState(false)
  const [saveFilterDialogOpen, setSaveFilterDialogOpen] = useState(false)
  const [newFilterName, setNewFilterName] = useState("")
  const [savingFilter, setSavingFilter] = useState(false)

  const fetchSignals = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await listSignals({ tab: activeTab })
      setSignals(Array.isArray(response?.signals) ? response.signals : [])
    } catch (err: any) {
      console.error("[v0] Failed to fetch signals:", err)
      setError(err?.message || "Failed to load signals. Please try again.")
      setSignals([])
    } finally {
      setIsLoading(false)
    }
  }, [activeTab])

  const fetchSavedFilters = useCallback(async () => {
    if (!isLoggedIn || !token) return

    setSavedFiltersLoading(true)
    try {
      const response = await listFilters(token)
      setSavedFilters(response.filters)
    } catch (err) {
      console.error("[v0] Failed to fetch saved filters:", err)
    } finally {
      setSavedFiltersLoading(false)
    }
  }, [isLoggedIn, token])

  useEffect(() => {
    fetchSignals()
  }, [fetchSignals])

  useEffect(() => {
    fetchSavedFilters()
  }, [fetchSavedFilters])

  const handleSaveFilter = async () => {
    if (!token || !newFilterName.trim()) return

    setSavingFilter(true)
    try {
      const response = await createFilter(
        { name: newFilterName.trim(), criteria: filters as unknown as Record<string, unknown> },
        token,
      )
      setSavedFilters((prev) => [...prev, response.filter])
      setNewFilterName("")
      setSaveFilterDialogOpen(false)
    } catch (err) {
      console.error("[v0] Failed to save filter:", err)
    } finally {
      setSavingFilter(false)
    }
  }

  const handleApplySavedFilter = (savedFilter: SavedFilter) => {
    setFilters(savedFilter.criteria as unknown as FilterState)
  }

  const filteredSignals = useMemo(() => {
    let result = [...signals]

    if (filters.statuses.length > 0) {
      result = result.filter((s) => filters.statuses.includes(s.status as SignalStatus))
    }

    if (filters.priceType === "free") {
      result = result.filter((s) => s.isFree)
    } else if (filters.priceType === "paid") {
      result = result.filter((s) => !s.isFree)
    } else if (filters.priceType === "discounted") {
      result = result.filter((s) => !s.isFree && s.discountPercent > 0)
    }

    if (filters.islamiclyStatus !== "any") {
      result = result.filter((s) => s.islamiclyStatus === filters.islamiclyStatus)
    }
    if (filters.musaffaStatus !== "any") {
      result = result.filter((s) => s.musaffaStatus === filters.musaffaStatus)
    }

    if (filters.minScoreXPoints > 0) {
      result = result.filter((s) => s.trader.scoreXPoints >= filters.minScoreXPoints)
    }
    if (filters.minStars > 0) {
      result = result.filter((s) => s.trader.avgStars >= filters.minStars)
    }

    if (filters.minProfitPercent > 0) {
      result = result.filter((s) => calculatePotentialProfitFromApi(s) >= filters.minProfitPercent)
    }
    if (filters.maxLossPercent < 100) {
      result = result.filter((s) => calculatePotentialLossFromApi(s) <= filters.maxLossPercent)
    }
    if (filters.maxRiskRatio < 10) {
      result = result.filter((s) => calculateRiskRatioFromApi(s) <= filters.maxRiskRatio)
    }

    return result
  }, [signals, filters])

  const handleRemoveFilter = (key: keyof FilterState, value?: string) => {
    if (key === "statuses" && value) {
      setFilters((prev) => ({
        ...prev,
        statuses: prev.statuses.filter((s) => s !== value),
      }))
    } else {
      setFilters((prev) => ({
        ...prev,
        [key]: defaultFilters[key],
      }))
    }
  }

  const hasActiveFilters = JSON.stringify(filters) !== JSON.stringify(defaultFilters)

  const mapApiSignalToCard = (apiSignal: ApiSignal) => ({
    id: apiSignal.id,
    ticker: apiSignal.ticker || "***",
    entry: apiSignal.entry || 0,
    tp1: apiSignal.tp1 || 0,
    tp2: apiSignal.tp2 || 0,
    sl: apiSignal.sl || 0,
    currentPrice: apiSignal.currentPrice,
    status: apiSignal.status,
    isFree: apiSignal.isFree,
    price: apiSignal.price,
    discountPercent: apiSignal.discountPercent,
    islamiclyStatus: apiSignal.islamiclyStatus,
    musaffaStatus: apiSignal.musaffaStatus,
    trader: {
      id: apiSignal.trader.id,
      username: apiSignal.trader.username,
      avatar: apiSignal.trader.avatar,
      scoreXPoints: apiSignal.trader.scoreXPoints,
      rank: apiSignal.trader.rank,
      avgStars: apiSignal.trader.avgStars,
      totalPLPercent: apiSignal.trader.totalPLPercent,
      totalSignals: apiSignal.trader.totalSignals,
      subscribers: apiSignal.trader.subscribers,
      avgDaysToResult: apiSignal.trader.avgDaysToResult,
    },
    likes: apiSignal.likes,
    dislikes: apiSignal.dislikes,
    createdAt: apiSignal.createdAt,
    closedAt: apiSignal.closedAt,
    isLocked: apiSignal.isLocked,
    isPurchased: apiSignal.isPurchased,
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">{t("signals.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("signals.subtitle")}</p>
      </div>

      <div className="sticky top-14 z-10 -mx-4 bg-background px-4 py-3 md:relative md:top-0 md:mx-0 md:px-0 md:py-0">
        <SignalTabs activeTab={activeTab} />
      </div>

      <div className="mt-4 flex items-center justify-between md:hidden">
        <span className="text-sm text-muted-foreground">
          {filteredSignals.length} signal{filteredSignals.length !== 1 ? "s" : ""}
        </span>
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              {t("signals.filters")}
              {hasActiveFilters && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  !
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] max-h-[80vh] overflow-hidden rounded-t-xl">
            <SheetHeader className="pb-4 border-b border-border">
              <SheetTitle>{t("signals.filters")}</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto h-[calc(100%-8rem)] py-4">
              <SignalFilters filters={filters} onFiltersChange={setFilters} activeTab={activeTab} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-background p-4 pb-safe">
              <Button className="w-full" onClick={() => setMobileFiltersOpen(false)}>
                Show {filteredSignals.length} Results
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <ActiveFilterChips filters={filters} onRemoveFilter={handleRemoveFilter} className="mt-4" />

      <div className="mt-6 flex gap-6">
        <aside className="hidden w-72 shrink-0 md:block">
          <div className="sticky top-20 rounded-lg border border-border bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{t("signals.filters")}</h2>
              <span className="text-xs text-muted-foreground">{filteredSignals.length} results</span>
            </div>
            <SignalFilters filters={filters} onFiltersChange={setFilters} activeTab={activeTab} />

            {isLoggedIn && (
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Bookmark className="h-4 w-4" />
                    Saved Filters
                  </h3>
                  <Dialog open={saveFilterDialogOpen} onOpenChange={setSaveFilterDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" disabled={!hasActiveFilters}>
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Save Filter Preset</DialogTitle>
                        <DialogDescription>Give your filter preset a name to quickly apply it later.</DialogDescription>
                      </DialogHeader>
                      <Input
                        placeholder="Filter name..."
                        value={newFilterName}
                        onChange={(e) => setNewFilterName(e.target.value)}
                      />
                      <DialogFooter>
                        <Button onClick={handleSaveFilter} disabled={!newFilterName.trim() || savingFilter}>
                          {savingFilter ? "Saving..." : "Save Filter"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {savedFiltersLoading ? (
                  <div className="h-8 w-full animate-pulse rounded bg-muted" />
                ) : savedFilters.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No saved filters yet</p>
                ) : (
                  <div className="space-y-1">
                    {savedFilters.map((sf) => (
                      <button
                        key={sf.id}
                        onClick={() => handleApplySavedFilter(sf)}
                        className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
                      >
                        {sf.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          {error && (
            <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm text-destructive mb-2">{error}</p>
              <Button size="sm" variant="outline" onClick={fetchSignals} className="gap-2 bg-transparent">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {isLoading ? (
              <>
                <SkeletonCard variant="signal" />
                <SkeletonCard variant="signal" />
                <SkeletonCard variant="signal" />
              </>
            ) : filteredSignals.length > 0 ? (
              filteredSignals.map((signal) => (
                <SignalCard key={signal.id} signal={mapApiSignalToCard(signal)} isResult={activeTab === "results"} />
              ))
            ) : (
              <EmptyState
                icon={TrendingUp}
                title={t("signals.noSignals")}
                description={t("signals.noSignalsDesc")}
                action={{
                  label: t("signals.clearFilters"),
                  onClick: () => setFilters(defaultFilters),
                }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function SignalsLoading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 space-y-2">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-10 w-full animate-pulse rounded bg-muted mb-6" />
      <div className="flex gap-6">
        <aside className="hidden w-72 shrink-0 md:block">
          <div className="h-96 animate-pulse rounded-lg bg-muted" />
        </aside>
        <main className="flex-1 space-y-4">
          <SkeletonCard variant="signal" />
          <SkeletonCard variant="signal" />
          <SkeletonCard variant="signal" />
        </main>
      </div>
    </div>
  )
}

export default function SignalsPage() {
  return (
    <Suspense fallback={<SignalsLoading />}>
      <SignalsContent />
    </Suspense>
  )
}
