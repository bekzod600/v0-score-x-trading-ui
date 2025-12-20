"use client"

import Link from "next/link"
import { useI18n } from "@/lib/i18n-context"

export function Footer() {
  const { t } = useI18n()

  const footerLinks = [
    { href: "/about", label: t("footer.about") },
    { href: "/contact", label: t("footer.contact") },
    { href: "/privacy", label: t("footer.privacy") },
    { href: "/terms", label: t("footer.terms") },
    { href: "/help", label: t("footer.help") },
    { href: "/refund-policy", label: t("footer.refund") },
  ]

  return (
    <footer className="border-t border-border bg-background hidden md:block">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">SX</span>
            </div>
            <span className="text-lg font-bold">ScoreX</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ScoreX. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  )
}
