"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Plus,
  Wallet,
  History,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Receipt,
  RefreshCw,
  LogIn,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormField } from "@/components/ui/form-field"
import { EmptyState } from "@/components/ui/empty-state"
import { cn } from "@/lib/utils"
import { useUser } from "@/lib/user-context"
import { useI18n } from "@/lib/i18n-context"
import { P2PModal } from "@/components/wallet/p2p-modal"
import { ClickConfirmation } from "@/components/wallet/click-confirmation"
import { formatDistanceToNow } from "date-fns"
import { getWallet, getWalletTransactions, type WalletTransaction } from "@/lib/services/wallet-service"

type PaymentMethod = "click" | "p2p"

export default function WalletPage() {
  const router = useRouter()
  const { isLoggedIn, token } = useUser()
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState("topup")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("click")
  const [amount, setAmount] = useState("")
  const [amountError, setAmountError] = useState("")
  const [showClickModal, setShowClickModal] = useState(false)
  const [showP2PModal, setShowP2PModal] = useState(false)

  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWalletData = async () => {
    if (!token) return

    setIsLoading(true)
    setError(null)

    try {
      const [walletRes, txRes] = await Promise.all([getWallet(token), getWalletTransactions(token)])
      setBalance(walletRes.balance)
      setTransactions(txRes.transactions)
    } catch (err) {
      console.error("[v0] Failed to fetch wallet data:", err)
      setError("Failed to load wallet data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isLoggedIn && token) {
      fetchWalletData()
    }
  }, [isLoggedIn, token])

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <Wallet className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">{t("auth.loginRequired")}</h2>
            <p className="text-muted-foreground">Please log in to access your wallet</p>
            <Link href="/login">
              <Button className="gap-2">
                <LogIn className="h-4 w-4" />
                {t("auth.login")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const parsedAmount = Number.parseFloat(amount) || 0
  const clickFee = parsedAmount * 0.03
  const clickCredited = parsedAmount - clickFee

  const validateAmount = (value: string) => {
    const num = Number.parseFloat(value)
    if (!value) {
      setAmountError("")
      return false
    }
    if (Number.isNaN(num) || num < 5) {
      setAmountError("Minimum amount is $5")
      return false
    }
    if (num > 10000) {
      setAmountError("Maximum amount is $10,000")
      return false
    }
    setAmountError("")
    return true
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmount(value)
    validateAmount(value)
  }

  const handleProceed = () => {
    if (!validateAmount(amount)) return
    if (paymentMethod === "click") {
      setShowClickModal(true)
    } else {
      setShowP2PModal(true)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-success" />
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success/10 text-success border-success/20 text-xs">Completed</Badge>
      case "pending":
        return <Badge className="bg-warning/10 text-warning border-warning/20 text-xs">Pending</Badge>
      case "rejected":
        return (
          <Badge variant="destructive" className="text-xs">
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            {status}
          </Badge>
        )
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <Link
        href="/profile"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("action.back")}
      </Link>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive mb-2">{error}</p>
          <Button size="sm" variant="outline" onClick={fetchWalletData} className="gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      {/* Balance Card */}
      <Card className="mb-6 overflow-hidden">
        <div className="bg-gradient-to-br from-primary to-primary/80 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="h-6 w-6 text-primary-foreground/80" />
            <span className="text-sm text-primary-foreground/80">{t("wallet.balance")}</span>
          </div>
          {isLoading ? (
            <div className="h-10 w-32 animate-pulse rounded bg-primary-foreground/20" />
          ) : (
            <div className="text-4xl font-bold text-primary-foreground font-mono">${balance.toFixed(2)}</div>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="topup" className="gap-2">
            <Plus className="h-4 w-4" />
            {t("wallet.topUp")}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            {t("wallet.transactions")}
          </TabsTrigger>
        </TabsList>

        {/* Top Up Tab */}
        <TabsContent value="topup">
          <Card>
            <CardHeader>
              <CardTitle>{t("wallet.topUp")}</CardTitle>
              <CardDescription>Choose your preferred payment method and amount</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Input with validation */}
              <FormField
                label="Amount (USD)"
                htmlFor="amount"
                error={amountError}
                hint="Minimum $5, maximum $10,000"
                required
              >
                <Input
                  id="amount"
                  type="number"
                  min="5"
                  max="10000"
                  step="0.01"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={handleAmountChange}
                  className={cn(
                    "font-mono text-lg",
                    amountError && "border-destructive focus-visible:ring-destructive",
                  )}
                  aria-invalid={!!amountError}
                  aria-describedby={amountError ? "amount-error" : undefined}
                />
              </FormField>

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Payment Method</label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                  className="space-y-3"
                >
                  {/* Click.uz Option */}
                  <label
                    className={cn(
                      "flex flex-col rounded-lg border p-4 cursor-pointer transition-all hover:border-primary/50",
                      paymentMethod === "click" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="click" id="click" />
                        <span className="font-medium">Click.uz</span>
                      </div>
                      <Badge variant="outline" className="text-warning border-warning/50 text-xs">
                        3% fee
                      </Badge>
                    </div>
                    <p className="mt-2 ml-7 text-sm text-muted-foreground">
                      Instant. 3% fee. Balance updates automatically.
                    </p>
                  </label>

                  {/* P2P Option */}
                  <label
                    className={cn(
                      "flex flex-col rounded-lg border p-4 cursor-pointer transition-all hover:border-primary/50",
                      paymentMethod === "p2p" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="p2p" id="p2p" />
                        <span className="font-medium">P2P Transfer</span>
                      </div>
                      <Badge variant="outline" className="text-success border-success/50 text-xs">
                        0% fee
                      </Badge>
                    </div>
                    <p className="mt-2 ml-7 text-sm text-muted-foreground">
                      0% fee. Requires transfer screenshot. Admin approval needed.
                    </p>
                  </label>
                </RadioGroup>
              </div>

              {/* Summary for Click */}
              {paymentMethod === "click" && parsedAmount >= 5 && !amountError && (
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Entered amount</span>
                    <span className="font-mono">${parsedAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-destructive">
                    <span>Fee (3%)</span>
                    <span className="font-mono">-${clickFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex items-center justify-between">
                    <span className="font-medium text-sm">You receive</span>
                    <span className="font-bold text-success font-mono">${clickCredited.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Summary for P2P */}
              {paymentMethod === "p2p" && parsedAmount >= 5 && !amountError && (
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Transfer amount</span>
                    <span className="font-mono">${parsedAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-success">
                    <span>Fee</span>
                    <span className="font-mono">$0.00</span>
                  </div>
                  <div className="border-t border-border pt-2 flex items-center justify-between">
                    <span className="font-medium text-sm">You receive</span>
                    <span className="font-bold text-success font-mono">${parsedAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Proceed Button */}
              <Button onClick={handleProceed} disabled={parsedAmount < 5 || !!amountError} className="w-full" size="lg">
                {parsedAmount < 5 ? "Enter amount (min $5)" : "Proceed"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>{t("wallet.transactions")}</CardTitle>
              <CardDescription>Your recent wallet activity</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start justify-between gap-4 animate-pulse">
                      <div className="flex items-start gap-3">
                        <div className="h-4 w-4 rounded bg-muted" />
                        <div className="space-y-2">
                          <div className="h-4 w-24 rounded bg-muted" />
                          <div className="h-3 w-32 rounded bg-muted" />
                        </div>
                      </div>
                      <div className="h-4 w-16 rounded bg-muted" />
                    </div>
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title={t("wallet.noTransactions")}
                  description={t("wallet.noTransactionsDesc")}
                  className="py-8"
                />
              ) : (
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start gap-3">
                        {getStatusIcon(tx.status)}
                        <div>
                          <div className="text-sm font-medium capitalize">{tx.type.replace("-", " ")}</div>
                          <div className="text-xs text-muted-foreground">{tx.description}</div>
                          <div className="mt-1 flex items-center gap-2">
                            {getStatusBadge(tx.status)}
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={cn(
                            "text-sm font-semibold font-mono",
                            tx.type === "top-up" ? "text-success" : "text-foreground",
                          )}
                        >
                          {tx.type === "top-up" ? "+" : "-"}${tx.creditedAmount.toFixed(2)}
                        </div>
                        {tx.fee > 0 && <div className="text-xs text-muted-foreground">Fee: ${tx.fee.toFixed(2)}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Click Confirmation Modal */}
      <ClickConfirmation open={showClickModal} onOpenChange={setShowClickModal} amount={parsedAmount} />

      {/* P2P Modal */}
      <P2PModal open={showP2PModal} onOpenChange={setShowP2PModal} amount={parsedAmount} />
    </div>
  )
}
