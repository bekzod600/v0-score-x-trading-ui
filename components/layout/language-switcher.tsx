"use client"

import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useI18n, type Language } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage, languages } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("gap-2", className)}>
          <Globe className="h-4 w-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.entries(languages) as [Language, string][]).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLanguage(code)}
            className={cn(language === code && "bg-accent")}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function LanguageSwitcherMobile({ onSelect }: { onSelect?: () => void }) {
  const { language, setLanguage, languages } = useI18n()

  return (
    <div className="space-y-1">
      {(Object.entries(languages) as [Language, string][]).map(([code, name]) => (
        <button
          key={code}
          onClick={() => {
            setLanguage(code)
            onSelect?.()
          }}
          className={cn(
            "w-full px-3 py-2 text-sm font-medium text-left rounded-md transition-colors",
            language === code
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          {name}
        </button>
      ))}
    </div>
  )
}
