"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, AlertCircle, CheckCircle, Loader2, TrendingUp, TrendingDown, DollarSign, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FormField } from "@/components/ui/form-field"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/lib/toast-context"
import { useUser } from "@/lib/user-context"
import { useI18n } from "@/lib/i18n-context"
import { getMySignals, createSignal, type ApiSignal, type CreateSignalPayload } from "@/lib/services/signals-service"

interface FormErrors {
  ticker?: string
  entry?: string
  sl?: string
  tp1?: string
  tp2?: string
  price?: string
  general?: string
}

interface TickerValidation {
  isValid: boolean
  isLoading: boolean
  currentPrice: number | null
  error: string | null
}

export default function AddSignalPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { isLoggedIn, profile, token } = useUser()
  const { t } = useI18n()

  // Form state
  const [ticker, setTicker] = useState("")
  const [entry, setEntry] = useState("")
  const [sl, setSl] = useState("")
  const [tp1, setTp1] = useState("")
  const [tp2, setTp2] = useState("")
  const [signalType, setSignalType] = useState<"free" | "paid">("free")
  const [price, setPrice] = useState("")
  const [discount, setDiscount] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userSignals, setUserSignals] = useState<ApiSignal[]>([])
  const [isLoadingSignals, setIsLoadingSignals] = useState(true)

  // Ticker validation state
  const [tickerValidation, setTickerValidation] = useState<TickerValidation>({
    isValid: false,
    isLoading: false,
    currentPrice: null,
    error: null,
  })

  // Redirect if not logged in
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
        const response = await getMySignals(token)
        setUserSignals(response.signals)
      } catch {
        // Silently fail - user can still create signals
        setUserSignals([])
      } finally {
        setIsLoadingSignals(false)
      }
    }
    fetchUserSignals()
  }, [token])

  // During SSR prerendering, profile may be null
  if (!profile) return null

  const freeSignalsCount = userSignals.filter((s) => s.isFree).length
  const scoreXPoints = profile.scoreXPoints

  const canPublishPaid = freeSignalsCount >= 3 && scoreXPoints >= 1000
  const priceCap = Math.max(0, scoreXPoints - 1000)

  const hasDuplicateActiveTicker = useMemo(() => {
    if (!ticker) return false
    const normalizedTicker = ticker.toUpperCase().trim()
    return userSignals.some(
      (s) =>
        s.ticker?.toUpperCase() === normalizedTicker &&
        (s.status === "ACTIVE" || s.status === "WAITING_ENTRY"),
    )
  }, [ticker, userSignals])

  const entryNum = Number.parseFloat(entry) || 0
  const slNum = Number.parseFloat(sl) || 0
  const tp1Num = Number.parseFloat(tp1) || 0
  const tp2Num = Number.parseFloat(tp2) || 0
  const priceNum = Number.parseFloat(price) || 0
  const discountNum = Number.parseFloat(discount) || 0

  const potentialProfit = entryNum > 0 ? (((tp1Num - entryNum) / entryNum) * 100).toFixed(2) : "0.00"
  const potentialLoss = entryNum > 0 ? (((entryNum - slNum) / entryNum) * 100).toFixed(2) : "0.00"
  const riskRatio =
    entryNum > 0 && slNum > 0 && tp1Num > 0 ? ((tp1Num - entryNum) / (entryNum - slNum)).toFixed(2) : "0.00"

  const finalPrice = discountNum > 0 ? Math.round(priceNum * (1 - discountNum / 100)) : priceNum

  const validateTicker = async (tickerSymbol: string) => {
    if (!tickerSymbol || tickerSymbol.length < 1) {
      setTickerValidation({ isValid: false, isLoading: false, currentPrice: null, error: null })
      return
    }

    setTickerValidation({ isValid: false, isLoading: true, currentPrice: null, error: null })

    try {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${tickerSymbol.toUpperCase()}?interval=1m&range=1d&includePrePost=true`,
      )

      if (!response.ok) {
        setTickerValidation({
          isValid: false,
          isLoading: false,
          currentPrice: null,
          error: "Ticker not found on Yahoo Finance",
        })
        return
      }

      const data = await response.json()
      const quote = data?.chart?.result?.[0]?.meta

      if (!quote || !quote.regularMarketPrice) {
        setTickerValidation({
          isValid: false,
          isLoading: false,
          currentPrice: null,
          error: "Unable to fetch price data",
        })
        return
      }

      setTickerValidation({
        isValid: true,
        isLoading: false,
        currentPrice: quote.regularMarketPrice,
        error: null,
      })
    } catch {
      setTickerValidation({
        isValid: false,
        isLoading: false,
        currentPrice: null,
        error: "Failed to validate ticker",
      })
    }
  }

  // Debounced ticker validation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (ticker.length >= 1) {
        validateTicker(ticker)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [ticker])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Ticker validation
    if (!ticker || ticker.length < 1) {
      newErrors.ticker = "Ticker is required"
    } else if (ticker.length > 10) {
      newErrors.ticker = "Ticker must be 10 characters or less"
    } else if (!tickerValidation.isValid) {
      newErrors.ticker = tickerValidation.error || "Invalid ticker symbol"
    } else if (hasDuplicateActiveTicker) {
      newErrors.ticker = "You already have an active or waiting signal for this ticker"
    }

    // Entry price validation
    if (!entryNum || entryNum <= 0) {
      newErrors.entry = "Valid entry price is required"
    }

    // Stop Loss validation (must be below entry for BUY)
    if (!slNum || slNum <= 0) {
      newErrors.sl = "Valid stop loss is required"
    } else if (slNum >= entryNum) {
      newErrors.sl = "Stop loss must be below entry for BUY signal"
    }

    // TP1 validation (must be above entry)
    if (!tp1Num || tp1Num <= 0) {
      newErrors.tp1 = "Valid take profit 1 is required"
    } else if (tp1Num <= entryNum) {
      newErrors.tp1 = "TP1 must be above entry for BUY signal"
    }

    // TP2 validation (must be above TP1)
    if (!tp2Num || tp2Num <= 0) {
      newErrors.tp2 = "Valid take profit 2 is required"
    } else if (tp2Num <= tp1Num) {
      newErrors.tp2 = "TP2 must be above TP1"
    }

    // Paid signal price validation
    if (signalType === "paid") {
      if (!priceNum || priceNum < 1) {
        newErrors.price = "Price must be at least $1"
      } else if (priceNum > priceCap) {
        newErrors.price = `Price cannot exceed your cap of $${priceCap}`
      } else if (finalPrice > priceCap) {
        newErrors.price = `Final price after discount cannot exceed $${priceCap}`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!token) {
      showToast("Please login first", "error")
      return
    }

    if (!validateForm()) {
      showToast("Please fix the errors in the form", "error")
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const payload: CreateSignalPayload = {
        ticker: ticker.toUpperCase().trim(),
        ep: Number(entry),
        sl: Number(sl),
        tp1: Number(tp1),
        tp2: tp2 ? Number(tp2) : undefined,
        accessType: signalType === "paid" ? "PAID" : "FREE",
        price: signalType === "paid" ? Number(price) : undefined,
      }

      const result = await createSignal(payload, token)

      showToast("Your signal has been published successfully", "success")
      router.push(`/signals/${result.id}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create signal. Please try again."
      setErrors({ general: errorMessage })
      showToast(errorMessage, "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <Link
        href="/signals"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("action.back")}
      </Link>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Main Form */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{t("nav.addSignal")}</CardTitle>
            <CardDescription>Create a BUY signal for your followers (BUY only, no Sell)</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* General error message */}
              {errors.general && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {errors.general}
                </div>
              )}

              {/* Ticker with Yahoo validation */}
              <FormField label="Ticker Symbol" htmlFor="ticker" error={errors.ticker} required>
                <div className="relative">
                  <Input
                    id="ticker"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    placeholder="e.g., AAPL"
                    className="uppercase pr-10"
                    maxLength={10}
                    aria-invalid={!!errors.ticker}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {tickerValidation.isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    {!tickerValidation.isLoading && tickerValidation.isValid && (
                      <CheckCircle className="h-4 w-4 text-success" />
                    )}
                    {!tickerValidation.isLoading && tickerValidation.error && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>
                {tickerValidation.isValid && tickerValidation.currentPrice && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-muted">
                      Current Price: ${tickerValidation.currentPrice.toFixed(2)}
                    </Badge>
                  </div>
                )}
                {hasDuplicateActiveTicker && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    You already have an active signal for {ticker}
                  </div>
                )}
              </FormField>

              {/* Price Levels - NO TP3 */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Entry Price (EP)" htmlFor="entry" error={errors.entry} required>
                  <Input
                    id="entry"
                    type="number"
                    step="0.01"
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    placeholder="0.00"
                    aria-invalid={!!errors.entry}
                  />
                </FormField>
                <FormField label="Stop Loss (SL)" htmlFor="sl" error={errors.sl} required>
                  <Input
                    id="sl"
                    type="number"
                    step="0.01"
                    value={sl}
                    onChange={(e) => setSl(e.target.value)}
                    placeholder="0.00"
                    aria-invalid={!!errors.sl}
                  />
                </FormField>
                <FormField label="Take Profit 1 (TP1)" htmlFor="tp1" error={errors.tp1} required>
                  <Input
                    id="tp1"
                    type="number"
                    step="0.01"
                    value={tp1}
                    onChange={(e) => setTp1(e.target.value)}
                    placeholder="0.00"
                    aria-invalid={!!errors.tp1}
                  />
                </FormField>
                <FormField label="Take Profit 2 (TP2)" htmlFor="tp2" error={errors.tp2} required>
                  <Input
                    id="tp2"
                    type="number"
                    step="0.01"
                    value={tp2}
                    onChange={(e) => setTp2(e.target.value)}
                    placeholder="0.00"
                    aria-invalid={!!errors.tp2}
                  />
                </FormField>
              </div>

              {/* Signal Type */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Signal Type</label>
                <RadioGroup
                  value={signalType}
                  onValueChange={(v) => setSignalType(v as "free" | "paid")}
                  className="flex gap-4"
                >
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <RadioGroupItem value="free" id="free" />
                    <span className="text-sm">{t("signals.free")}</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <RadioGroupItem value="paid" id="paid" disabled={!canPublishPaid} />
                    <span className="text-sm">Paid</span>
                  </label>
                </RadioGroup>

                {!canPublishPaid && (
                  <div className="flex items-start gap-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
                    <Info className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Paid signals unavailable</p>
                      <p>
                        You need at least 3 FREE signals ({freeSignalsCount}/3) and 1000+ ScoreX points ({scoreXPoints}
                        /1000) to publish paid signals.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Paid Signal Options */}
              {signalType === "paid" && canPublishPaid && (
                <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center justify-between rounded-md bg-background p-3 border border-border">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Your Price Cap</span>
                    </div>
                    <span className="text-xl font-bold text-primary">${priceCap}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Price cap = ScoreX Points ({scoreXPoints}) - 1000 = ${priceCap}
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Price ($)" htmlFor="price" error={errors.price} required>
                      <Input
                        id="price"
                        type="number"
                        min="1"
                        max={priceCap}
                        placeholder={`Max $${priceCap}`}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        aria-invalid={!!errors.price}
                      />
                    </FormField>
                    <FormField label="Discount (%)" htmlFor="discount" hint="Optional">
                      <Input
                        id="discount"
                        type="number"
                        min="0"
                        max="99"
                        placeholder="0"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                      />
                    </FormField>
                  </div>

                  {/* Final price display */}
                  {priceNum > 0 && (
                    <div className="flex items-center justify-between rounded-md bg-background p-3 border border-border">
                      <div>
                        <span className="text-sm text-muted-foreground">Final Price:</span>
                        {discountNum > 0 && (
                          <Badge className="ml-2 bg-destructive text-destructive-foreground text-xs">
                            -{discountNum}%
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        {discountNum > 0 && (
                          <span className="text-sm text-muted-foreground line-through mr-2">${priceNum}</span>
                        )}
                        <span className="text-2xl font-bold text-primary">${finalPrice}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1 bg-transparent" asChild>
                  <Link href="/signals">{t("action.cancel")}</Link>
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isSubmitting || (signalType === "paid" && !canPublishPaid)}
                >
                  {isSubmitting ? t("misc.loading") : t("action.submit")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Right Sidebar - Live Calculations */}
        <div className="lg:col-span-2 space-y-4">
          {/* Live Calculations Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Live Calculations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-success/10 p-3">
                <span className="text-sm text-muted-foreground">Potential Profit</span>
                <span className="font-semibold text-success flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />+{potentialProfit}%
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-destructive/10 p-3">
                <span className="text-sm text-muted-foreground">Potential Loss</span>
                <span className="font-semibold text-destructive flex items-center gap-1">
                  <TrendingDown className="h-4 w-4" />-{potentialLoss}%
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                <span className="text-sm text-muted-foreground">Risk Ratio</span>
                <span className="font-semibold">{riskRatio}:1</span>
              </div>
            </CardContent>
          </Card>

          {/* User Stats Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Your Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">ScoreX Points</span>
                <span className="font-semibold">{scoreXPoints}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Free Signals</span>
                <span className="font-semibold">{freeSignalsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Signals</span>
                <span className="font-semibold">{userSignals.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Price Cap</span>
                <span className="font-semibold text-primary">${priceCap}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
