import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { SignalStatus } from "@/lib/mock-data"

interface StatusBadgeProps {
  status: SignalStatus
  size?: "sm" | "md" | "lg"
  className?: string
}

const statusConfig: Record<SignalStatus, { label: string; className: string }> = {
  WAITING_ENTRY: { label: "Waiting Entry", className: "bg-warning/15 text-warning border-warning/30" },
  ACTIVE: { label: "Active", className: "bg-primary/15 text-primary border-primary/30" },
  TP1_HIT: { label: "TP1 Hit", className: "bg-success/15 text-success border-success/30" },
  TP2_HIT: { label: "TP2 Hit", className: "bg-success/15 text-success border-success/30" },
  SL_HIT: { label: "SL Hit", className: "bg-destructive/15 text-destructive border-destructive/30" },
  HOLD: { label: "Hold", className: "bg-muted text-muted-foreground border-border" },
  CANCEL: { label: "Cancelled", className: "bg-muted text-muted-foreground border-border" },
}

const defaultConfig = { label: "Unknown", className: "bg-muted text-muted-foreground border-border" }

export function StatusBadge({ status, size = "sm", className }: StatusBadgeProps) {
  const config = statusConfig[status] || defaultConfig

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border",
        config.className,
        size === "sm" && "text-xs px-2 py-0.5",
        size === "md" && "text-sm px-2.5 py-1",
        size === "lg" && "text-base px-3 py-1.5",
        className,
      )}
    >
      {config.label}
    </Badge>
  )
}
