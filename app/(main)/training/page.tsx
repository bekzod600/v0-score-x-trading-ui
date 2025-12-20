"use client"

import { EmptyState } from "@/components/ui/empty-state"
import { GraduationCap } from "lucide-react"

export default function TrainingPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">Training Centers</h1>
        <p className="text-sm text-muted-foreground mt-1">Learn trading strategies from expert traders</p>
      </div>

      <EmptyState
        icon={GraduationCap}
        title="Coming Soon"
        description="Training centers will be available soon. Learn trading strategies, technical analysis, and risk management from verified expert traders."
        className="py-16"
      />
    </div>
  )
}
