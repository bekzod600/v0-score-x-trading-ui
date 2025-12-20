"use client"

import { useState, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Filter, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SignalCard } from "@/components/signals/signal-card"
import { SignalTabs } from "@/components/signals/signal-tabs"
import { SignalFilters, ActiveFilterChips } from "@/components/signals/signal-filters"
import { EmptyState } from "@/components/ui/empty-state"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { useI18n } from "@/lib/i18n-context"
import {
  mockSignals,
  type FilterState,
  type SignalStatus,
  defaultFilters,
  calculatePotentialProfit,
  calculatePotentialLoss,
  calculateRiskRatio,
} from "@/lib/mock-data"

function SignalsContent() {
  const searchParams = useSearchParams()
  const { t } = useI18n()
  const tabParam = searchParams.get("tab")
  const activeTab = (tabParam === "results" ? "results" : "live") as "live" | "results"

  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Filter signals based on active tab and filters
  const filteredSignals = useMemo(() => {
    // First filter by tab
    const liveStatuses: SignalStatus[] = ["WAITING_ENTRY", "ACTIVE"]
    const resultStatuses: SignalStatus[] = ["TP1_HIT", "TP2_HIT", "SL_HIT", "HOLD", "CANCEL"]
    const tabStatuses = activeTab === "live" ? liveStatuses : resultStatuses

    let signals = mockSignals.filter((s) => tabStatuses.includes(s.status))

    // Apply custom status filter if set
    if (filters.statuses.length > 0) {
      signals = signals.filter((s) => filters.statuses.includes(s.status))
    }

    // Price type filter
    if (filters.priceType === "free") {
      signals = signals.filter((s) => s.isFree)
    } else if (filters.priceType === "paid") {
      signals = signals.filter((s) => !s.isFree)
    } else if (filters.priceType === "discounted") {
      signals = signals.filter((s) => !s.isFree && s.discountPercent > 0)
    }

    // Halal filters
    if (filters.islamiclyStatus !== "any") {
      signals = signals.filter((s) => s.islamiclyStatus === filters.islamiclyStatus)
    }
    if (filters.musaffaStatus !== "any") {
      signals = signals.filter((s) => s.musaffaStatus === filters.musaffaStatus)
    }

    // Seller quality filters
    if (filters.minScoreXPoints > 0) {
      signals = signals.filter((s) => s.trader.scoreXPoints >= filters.minScoreXPoints)
    }
    if (filters.minStars > 0) {
      signals = signals.filter((s) => s.trader.avgStars >= filters.minStars)
    }

    // Profit/Risk filters
    if (filters.minProfitPercent > 0) {
      signals = signals.filter((s) => calculatePotentialProfit(s) >= filters.minProfitPercent)
    }
    if (filters.maxLossPercent < 100) {
      signals = signals.filter((s) => calculatePotentialLoss(s) <= filters.maxLossPercent)
    }
    if (filters.maxRiskRatio < 10) {
      signals = signals.filter((s) => calculateRiskRatio(s) <= filters.maxRiskRatio)
    }

    return signals
  }, [activeTab, filters])

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

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">{t("signals.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("signals.subtitle")}</p>
      </div>

      {/* Tabs - Sticky on mobile */}
      <div className="sticky top-14 z-10 -mx-4 bg-background px-4 py-3 md:relative md:top-0 md:mx-0 md:px-0 md:py-0">
        <SignalTabs activeTab={activeTab} />
      </div>

      {/* Mobile Filter Button */}
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

      {/* Active Filter Chips */}
      <ActiveFilterChips filters={filters} onRemoveFilter={handleRemoveFilter} className="mt-4" />

      {/* Desktop Layout */}
      <div className="mt-6 flex gap-6">
        {/* Sidebar Filters - Desktop Only */}
        <aside className="hidden w-72 shrink-0 md:block">
          <div className="sticky top-20 rounded-lg border border-border bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{t("signals.filters")}</h2>
              <span className="text-xs text-muted-foreground">{filteredSignals.length} results</span>
            </div>
            <SignalFilters filters={filters} onFiltersChange={setFilters} activeTab={activeTab} />
          </div>
        </aside>

        {/* Signal Feed */}
        <main className="flex-1 min-w-0">
          <div className="space-y-4">
            {filteredSignals.length > 0 ? (
              filteredSignals.map((signal) => (
                <SignalCard key={signal.id} signal={signal} isResult={activeTab === "results"} />
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
