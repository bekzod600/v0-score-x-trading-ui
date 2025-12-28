"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogIn, MessageCircle, ExternalLink, Copy, Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/lib/user-context"
import { useI18n } from "@/lib/i18n-context"
import { useToast } from "@/lib/toast-context"
import { initiateTelegramLogin, getTelegramStatus, type TelegramInitiateResponse } from "@/lib/services/auth-service"

type LoginStep = "idle" | "loading" | "awaiting" | "success" | "error"

export default function LoginPage() {
  const router = useRouter()
  const { setToken, hydrateAuth, isLoggedIn } = useUser()
  const { t } = useI18n()
  const { showToast } = useToast()

  const [step, setStep] = useState<LoginStep>("idle")
  const [error, setError] = useState("")
  const [loginData, setLoginData] = useState<TelegramInitiateResponse | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [copied, setCopied] = useState(false)

  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.push("/")
    }
  }, [isLoggedIn, router])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  useEffect(() => {
    if (step === "awaiting" && countdown > 0) {
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Expired
            if (countdownRef.current) clearInterval(countdownRef.current)
            if (pollingRef.current) clearInterval(pollingRef.current)
            setStep("error")
            setError("Login session expired. Please try again.")
            showToast("Login session expired", "error")
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [step, countdown, showToast])

  const startPolling = useCallback(
    (loginId: string) => {
      pollingRef.current = setInterval(async () => {
        try {
          const statusRes = await getTelegramStatus(loginId)

          if (statusRes.status === "CONFIRMED" && statusRes.accessToken) {
            // Stop polling
            if (pollingRef.current) clearInterval(pollingRef.current)
            if (countdownRef.current) clearInterval(countdownRef.current)

            // Save token and hydrate
            setToken(statusRes.accessToken)
            await hydrateAuth()

            setStep("success")
            showToast("Successfully logged in!", "success")

            // Redirect to home after brief delay
            setTimeout(() => {
              router.push("/")
            }, 500)
          } else if (statusRes.status === "EXPIRED") {
            // Stop polling
            if (pollingRef.current) clearInterval(pollingRef.current)
            if (countdownRef.current) clearInterval(countdownRef.current)

            setStep("error")
            setError("Login session expired. Please try again.")
            showToast("Login session expired", "error")
          }
          // If PENDING, continue polling
        } catch {
          // Network error during poll - continue silently
        }
      }, 2000) // Poll every 2 seconds
    },
    [setToken, hydrateAuth, showToast, router],
  )

  const handleTelegramLogin = async () => {
    setStep("loading")
    setError("")

    try {
      const response = await initiateTelegramLogin()
      setLoginData(response)
      setCountdown(response.expiresIn)
      setStep("awaiting")

      // Start polling for status
      startPolling(response.loginId)
    } catch (err) {
      setStep("error")
      const message = err instanceof Error ? err.message : "Failed to initiate login"
      setError(message)
      showToast(message, "error")
    }
  }

  const handleCancel = () => {
    if (pollingRef.current) clearInterval(pollingRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
    setStep("idle")
    setLoginData(null)
    setCountdown(0)
    setError("")
  }

  const handleCopyLoginId = async () => {
    if (loginData?.loginId) {
      await navigator.clipboard.writeText(loginData.loginId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Format countdown as MM:SS
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <LogIn className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">{t("auth.login")}</CardTitle>
          <CardDescription>Sign in to your ScoreX account using Telegram</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error display */}
          {error && step === "error" && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          {/* Idle state - show login button */}
          {(step === "idle" || step === "error") && (
            <>
              <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
                <p className="mb-2 font-medium text-foreground">Telegram Authentication</p>
                <p>
                  ScoreX uses Telegram for secure, passwordless authentication. Click the button below to sign in with
                  your Telegram account.
                </p>
              </div>

              <Button onClick={handleTelegramLogin} className="w-full gap-2" size="lg">
                <MessageCircle className="h-5 w-5" />
                Login with Telegram
              </Button>
            </>
          )}

          {/* Loading state */}
          {step === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Initiating Telegram login...</p>
            </div>
          )}

          {/* Awaiting Telegram confirmation */}
          {step === "awaiting" && loginData && (
            <div className="space-y-4">
              {/* Countdown timer */}
              <div className="flex items-center justify-center gap-2 rounded-md bg-muted p-3">
                <span className="text-sm text-muted-foreground">Session expires in:</span>
                <span className="font-mono text-lg font-semibold text-foreground">{formatCountdown(countdown)}</span>
              </div>

              {/* Open Telegram button */}
              <Button asChild className="w-full gap-2" size="lg">
                <a href={loginData.deepLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5" />
                  Open Telegram
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>

              {/* Login ID display */}
              <div className="rounded-md border bg-muted/50 p-3">
                <p className="mb-2 text-xs text-muted-foreground">Or send this code to @{loginData.botUsername}:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-background px-2 py-1 font-mono text-sm">{loginData.loginId}</code>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0 bg-transparent"
                    onClick={handleCopyLoginId}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Waiting indicator */}
              <div className="flex items-center justify-center gap-2 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Waiting for Telegram confirmation...</span>
              </div>

              {/* Cancel button */}
              <Button variant="outline" className="w-full gap-2 bg-transparent" onClick={handleCancel}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}

          {/* Success state */}
          {step === "success" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground">Login successful! Redirecting...</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <p className="text-center text-sm text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link href="/register" className="text-primary hover:underline">
              {t("auth.register")}
            </Link>
          </p>
          <p className="text-center text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
