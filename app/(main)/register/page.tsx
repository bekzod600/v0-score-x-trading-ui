"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { UserPlus, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n-context"

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useI18n()

  const handleTelegramRegister = () => {
    // Registration happens automatically on first Telegram login
    // Redirect to login page
    router.push("/login")
  }

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <UserPlus className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">{t("auth.register")}</CardTitle>
          <CardDescription>Create an account to start trading on ScoreX</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
            <p className="mb-2 font-medium text-foreground">How Registration Works</p>
            <p className="mb-3">
              ScoreX uses Telegram for secure, passwordless authentication. When you sign in with Telegram for the first
              time, your account is automatically created.
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>No email or password required</li>
              <li>Secure authentication via Telegram</li>
              <li>Your Telegram username becomes your ScoreX username</li>
            </ul>
          </div>

          <Button onClick={handleTelegramRegister} className="w-full gap-2" size="lg">
            <MessageCircle className="h-5 w-5" />
            Sign up with Telegram
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-center text-sm text-muted-foreground">
            {t("auth.haveAccount")}{" "}
            <Link href="/login" className="text-primary hover:underline">
              {t("auth.login")}
            </Link>
          </p>
          <p className="text-center text-xs text-muted-foreground">
            By signing up, you agree to our{" "}
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
