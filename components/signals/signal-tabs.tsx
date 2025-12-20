"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n-context"

interface SignalTabsProps {
  activeTab: "live" | "results"
}

export function SignalTabs({ activeTab }: SignalTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useI18n()

  const handleTabChange = (tab: "live" | "results") => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.push(`/signals?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex rounded-lg bg-muted p-1">
      <button
        onClick={() => handleTabChange("live")}
        className={cn(
          "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
          activeTab === "live"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {t("signals.live")}
      </button>
      <button
        onClick={() => handleTabChange("results")}
        className={cn(
          "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
          activeTab === "results"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {t("signals.results")}
      </button>
    </div>
  )
}
