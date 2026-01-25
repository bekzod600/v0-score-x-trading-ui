import { Shield, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { IslamiclyStatus, MusaffaStatus } from "@/lib/mock-data"

interface HalalBadgesProps {
  islamiclyStatus: IslamiclyStatus
  musaffaStatus: MusaffaStatus
  size?: "sm" | "md"
  className?: string
}
type BackendIslamiclyStatus = "COMPLIANT" | "NON_COMPLIANT" | "NOT_COVERED"
type BackendMusaffaStatus = "COMPLIANT" | "NON_COMPLIANT" | "NOT_COVERED"

const islamiclyConfig: Record<BackendIslamiclyStatus, { label: string; className: string }> = {
  COMPLIANT: { label: "Compliant", className: "border-success/50 text-success bg-success/10" },
  NON_COMPLIANT: { label: "Non-Compliant", className: "border-destructive/50 text-destructive bg-destructive/10" },
  NOT_COVERED: { label: "Unknown", className: "border-muted-foreground/50 text-muted-foreground bg-muted" },
}

const musaffaConfig: Record<BackendMusaffaStatus, { label: string; className: string }> = {
  COMPLIANT: { label: "Halal", className: "border-success/50 text-success bg-success/10" },
  NON_COMPLIANT: { label: "Not Halal", className: "border-destructive/50 text-destructive bg-destructive/10" },
  NOT_COVERED: { label: "Unknown", className: "border-muted-foreground/50 text-muted-foreground bg-muted" },
}

const defaultConfig = { label: "Unknown", className: "border-muted-foreground/50 text-muted-foreground bg-muted" }

export function HalalBadges({ islamiclyStatus, musaffaStatus, size = "sm", className }: HalalBadgesProps) {
  const islamicly = islamiclyConfig[islamiclyStatus] || defaultConfig
  const musaffa = musaffaConfig[musaffaStatus] || defaultConfig

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Badge
        variant="outline"
        className={cn("font-normal", islamicly.className, size === "sm" ? "text-xs" : "text-sm")}
      >
        <Shield className={cn("mr-1", size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
        Islamicly: {islamicly.label}
      </Badge>
      <Badge variant="outline" className={cn("font-normal", musaffa.className, size === "sm" ? "text-xs" : "text-sm")}>
        <CheckCircle className={cn("mr-1", size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
        Musaffa: {musaffa.label}
      </Badge>
    </div>
  )
}
