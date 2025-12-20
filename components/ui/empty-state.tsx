"use client"

import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-xs">{description}</p>
      {action &&
        (action.href ? (
          <Link href={action.href}>
            <Button variant="outline" size="sm" className="mt-4 bg-transparent">
              {action.label}
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" className="mt-4 bg-transparent" onClick={action.onClick}>
            {action.label}
          </Button>
        ))}
    </div>
  )
}
