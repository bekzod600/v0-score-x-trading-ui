"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Menu, X, Wallet, User, Moon, Sun, Shield, LogIn } from "lucide-react"
import { useState, Suspense } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { useAdmin } from "@/lib/admin-context"
import { useUser } from "@/lib/user-context"
import { useI18n } from "@/lib/i18n-context"
import { LanguageSwitcher, LanguageSwitcherMobile } from "@/components/layout/language-switcher"

function HeaderContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { isAdmin } = useAdmin()
  const { isLoggedIn, isHydrating } = useUser()
  const { t } = useI18n()

  // Check if current page is results tab
  const isResultsTab = pathname === "/signals" && searchParams.get("tab") === "results"

  const navItems = [
    { href: "/", label: t("nav.home") },
    { href: "/signals", label: t("nav.signals") },
    { href: "/rating", label: t("nav.rating") },
    { href: "/training-centers", label: t("nav.training") },
    { href: "/news", label: t("nav.news") },
  ]

  const isActiveNav = (href: string) => {
    if (href === "/signals?tab=results") {
      return isResultsTab
    }
    if (href === "/signals") {
      return pathname === "/signals" && !isResultsTab
    }
    return pathname === href
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">SX</span>
          </div>
          <span className="hidden text-lg font-bold sm:inline-block">ScoreX</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-2 text-sm font-medium transition-colors rounded-md",
                isActiveNav(item.href)
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "px-3 py-2 text-sm font-medium transition-colors rounded-md flex items-center gap-1",
                pathname.startsWith("/admin")
                  ? "bg-primary text-primary-foreground"
                  : "text-primary hover:bg-primary/10",
              )}
            >
              <Shield className="h-3.5 w-3.5" />
              {t("nav.admin")}
            </Link>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          {isHydrating ? (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-muted animate-pulse" />
              <div className="h-8 w-8 rounded-md bg-muted animate-pulse" />
              <div className="h-8 w-20 rounded-md bg-muted animate-pulse" />
            </div>
          ) : isLoggedIn ? (
            <>
              <NotificationBell />
              <Link href="/wallet">
                <Button variant="ghost" size="icon">
                  <Wallet className="h-4 w-4" />
                  <span className="sr-only">{t("nav.wallet")}</span>
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-4 w-4" />
                  <span className="sr-only">{t("nav.profile")}</span>
                </Button>
              </Link>
              <Link href="/signals/add">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {t("nav.addSignal")}
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <LogIn className="h-4 w-4" />
                {t("auth.login")}
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          {isLoggedIn && <NotificationBell />}
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="container mx-auto flex flex-col gap-1 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors rounded-md",
                  isActiveNav(item.href)
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors rounded-md flex items-center gap-2",
                  pathname.startsWith("/admin")
                    ? "bg-primary text-primary-foreground"
                    : "text-primary hover:bg-primary/10",
                )}
              >
                <Shield className="h-4 w-4" />
                {t("nav.admin")}
              </Link>
            )}

            {/* Language Switcher in Mobile */}
            <div className="mt-2 border-t border-border pt-4">
              <p className="px-3 pb-2 text-xs font-medium text-muted-foreground">{t("misc.language")}</p>
              <LanguageSwitcherMobile onSelect={() => setMobileMenuOpen(false)} />
            </div>

            {/* Auth/Profile Actions */}
            <div className="mt-2 flex gap-2 border-t border-border pt-4">
              {isHydrating ? (
                <div className="flex gap-2 flex-1">
                  <div className="h-10 flex-1 rounded-md bg-muted animate-pulse" />
                  <div className="h-10 flex-1 rounded-md bg-muted animate-pulse" />
                </div>
              ) : isLoggedIn ? (
                <>
                  <Link href="/wallet" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Wallet className="mr-2 h-4 w-4" />
                      {t("nav.wallet")}
                    </Button>
                  </Link>
                  <Link href="/profile" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full bg-transparent">
                      <User className="mr-2 h-4 w-4" />
                      {t("nav.profile")}
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">
                    <LogIn className="mr-2 h-4 w-4" />
                    {t("auth.login")}
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export function Header() {
  return (
    <Suspense fallback={<HeaderFallback />}>
      <HeaderContent />
    </Suspense>
  )
}

function HeaderFallback() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">SX</span>
          </div>
          <span className="hidden text-lg font-bold sm:inline-block">ScoreX</span>
        </div>
      </div>
    </header>
  )
}
