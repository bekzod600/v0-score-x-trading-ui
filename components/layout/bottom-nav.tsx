"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, TrendingUp, Plus, Trophy, User, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@/lib/user-context"
import { useI18n } from "@/lib/i18n-context"

export function BottomNav() {
  const pathname = usePathname()
  const { isLoggedIn } = useUser()
  const { t } = useI18n()

  const navItems = isLoggedIn
    ? [
        { href: "/", label: t("nav.home"), icon: Home },
        { href: "/signals", label: t("nav.signals"), icon: TrendingUp },
        { href: "/signals/add", label: t("nav.addSignal"), icon: Plus, highlight: true },
        { href: "/rating", label: t("nav.rating"), icon: Trophy },
        { href: "/profile", label: t("nav.profile"), icon: User },
      ]
    : [
        { href: "/", label: t("nav.home"), icon: Home },
        { href: "/signals", label: t("nav.signals"), icon: TrendingUp },
        { href: "/rating", label: t("nav.rating"), icon: Trophy },
        { href: "/login", label: t("auth.login"), icon: LogIn },
      ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden pb-safe">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          const Icon = item.icon

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-4"
                aria-label={item.label}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg transition-transform hover:scale-105 active:scale-95">
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-3 py-2 min-w-[4rem] transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[11px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
