"use client"

import { useState } from "react"
import { X, Save, ChevronDown, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
// Filter types - defined locally, no mock-data dependency
export type SignalStatus = "WAITING_ENTRY" | "ACTIVE" | "TP1_HIT" | "TP2_HIT" | "SL_HIT" | "HOLD" | "CANCEL"

export interface FilterState {
  priceType: "all" | "free" | "paid" | "discounted"
  islamiclyStatus: "any" | "COMPLIANT" | "NON_COMPLIANT" | "NOT_COVERED"
  musaffaStatus: "any" | "COMPLIANT" | "NON_COMPLIANT" | "NOT_COVERED"
  minScoreXPoints: number
  minStars: number
  minProfitPercent: number
  maxLossPercent: number
  maxRiskRatio: number
  statuses: SignalStatus[]
}

export interface SavedFilter {
  id: string
  name: string
  filters: FilterState
}

export const defaultFilters: FilterState = {
  priceType: "all",
  islamiclyStatus: "any",
  musaffaStatus: "any",
  minScoreXPoints: 0,
  minStars: 0,
  minProfitPercent: 0,
  maxLossPercent: 100,
  maxRiskRatio: 10,
  statuses: [],
}

interface SignalFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  activeTab: "live" | "results"
  className?: string
}

const statusOptions: { value: SignalStatus; label: string }[] = [
  { value: "WAITING_ENTRY", label: "Waiting Entry" },
  { value: "ACTIVE", label: "Active" },
  { value: "TP1_HIT", label: "TP1 Hit" },
  { value: "TP2_HIT", label: "TP2 Hit" },
  { value: "SL_HIT", label: "SL Hit" },
  { value: "HOLD", label: "Hold" },
  { value: "CANCEL", label: "Cancelled" },
]

export function SignalFilters({ filters, onFiltersChange, activeTab, className }: SignalFiltersProps) {
  const [savedFilters] = useState<SavedFilter[]>([])

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearAllFilters = () => {
    onFiltersChange(defaultFilters)
  }

  const applySavedFilter = (saved: SavedFilter) => {
    onFiltersChange(saved.filters)
  }

  const toggleStatus = (status: SignalStatus) => {
    const current = filters.statuses
    const updated = current.includes(status) ? current.filter((s) => s !== status) : [...current, status]
    updateFilter("statuses", updated)
  }

  const hasActiveFilters = JSON.stringify(filters) !== JSON.stringify(defaultFilters)

  return (
    <div className={cn("space-y-5", className)}>
      {/* Saved Filters */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Saved Filters</Label>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
            <Save className="mr-1 h-3 w-3" />
            Save Current
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between bg-transparent">
              <span className="text-muted-foreground">Select preset...</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            {savedFilters.map((saved) => (
              <DropdownMenuItem key={saved.id} onClick={() => applySavedFilter(saved)}>
                {saved.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Price Type */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Price Type</Label>
        <Select
          value={filters.priceType}
          onValueChange={(v) => updateFilter("priceType", v as FilterState["priceType"])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="discounted">Discounted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Halal Status - Islamicly */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Islamicly Status</Label>
        <Select
          value={filters.islamiclyStatus}
          onValueChange={(v) => updateFilter("islamiclyStatus", v as FilterState["islamiclyStatus"])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="compliant">Compliant</SelectItem>
            <SelectItem value="non-compliant">Non-Compliant</SelectItem>
            <SelectItem value="unknown">Unknown</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Halal Status - Musaffa */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Musaffa Status</Label>
        <Select
          value={filters.musaffaStatus}
          onValueChange={(v) => updateFilter("musaffaStatus", v as FilterState["musaffaStatus"])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="halal">Halal</SelectItem>
            <SelectItem value="not-halal">Not Halal</SelectItem>
            <SelectItem value="unknown">Unknown</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Seller Quality */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Seller Quality</Label>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Min ScoreX Points</span>
            <span className="font-mono">{filters.minScoreXPoints}</span>
          </div>
          <Slider
            value={[filters.minScoreXPoints]}
            onValueChange={([v]) => updateFilter("minScoreXPoints", v)}
            max={3000}
            step={100}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Min Stars</span>
            <span className="font-mono">{filters.minStars.toFixed(1)}</span>
          </div>
          <Slider value={[filters.minStars]} onValueChange={([v]) => updateFilter("minStars", v)} max={5} step={0.5} />
        </div>
      </div>

      {/* Profit/Risk */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Profit / Risk</Label>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Min Profit %</span>
            <Input
              type="number"
              value={filters.minProfitPercent}
              onChange={(e) => updateFilter("minProfitPercent", Number(e.target.value))}
              min={0}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Max Loss %</span>
            <Input
              type="number"
              value={filters.maxLossPercent}
              onChange={(e) => updateFilter("maxLossPercent", Number(e.target.value))}
              min={0}
              className="h-8"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Max Risk Ratio</span>
            <span className="font-mono">{filters.maxRiskRatio}</span>
          </div>
          <Slider
            value={[filters.maxRiskRatio]}
            onValueChange={([v]) => updateFilter("maxRiskRatio", v)}
            max={10}
            step={0.5}
          />
        </div>
      </div>

      {/* Status (optional multi-select) */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Status Filter</Label>
        <p className="text-xs text-muted-foreground mb-2">
          {activeTab === "live"
            ? "Live tab shows: Waiting Entry, Active"
            : "Results tab shows: TP Hit, SL Hit, Hold, Cancel"}
        </p>
        <div className="space-y-2">
          {statusOptions.map((opt) => (
            <div key={opt.value} className="flex items-center gap-2">
              <Checkbox
                id={opt.value}
                checked={filters.statuses.includes(opt.value)}
                onCheckedChange={() => toggleStatus(opt.value)}
              />
              <label htmlFor={opt.value} className="text-sm cursor-pointer">
                {opt.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear All */}
      {hasActiveFilters && (
        <Button variant="outline" className="w-full bg-transparent" onClick={clearAllFilters}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Clear All Filters
        </Button>
      )}
    </div>
  )
}

interface ActiveFilterChipsProps {
  filters: FilterState
  onRemoveFilter: (key: keyof FilterState, value?: string) => void
  className?: string
}

export function ActiveFilterChips({ filters, onRemoveFilter, className }: ActiveFilterChipsProps) {
  const chips: { key: keyof FilterState; label: string; value?: string }[] = []

  if (filters.priceType !== "all") {
    chips.push({ key: "priceType", label: `Price: ${filters.priceType}` })
  }
  if (filters.islamiclyStatus !== "any") {
    chips.push({ key: "islamiclyStatus", label: `Islamicly: ${filters.islamiclyStatus}` })
  }
  if (filters.musaffaStatus !== "any") {
    chips.push({ key: "musaffaStatus", label: `Musaffa: ${filters.musaffaStatus}` })
  }
  if (filters.minScoreXPoints > 0) {
    chips.push({ key: "minScoreXPoints", label: `ScoreX ≥ ${filters.minScoreXPoints}` })
  }
  if (filters.minStars > 0) {
    chips.push({ key: "minStars", label: `Stars ≥ ${filters.minStars}` })
  }
  if (filters.minProfitPercent > 0) {
    chips.push({ key: "minProfitPercent", label: `Profit ≥ ${filters.minProfitPercent}%` })
  }
  if (filters.maxLossPercent < 100) {
    chips.push({ key: "maxLossPercent", label: `Loss ≤ ${filters.maxLossPercent}%` })
  }
  if (filters.maxRiskRatio < 10) {
    chips.push({ key: "maxRiskRatio", label: `Risk ≤ ${filters.maxRiskRatio}` })
  }
  filters.statuses.forEach((status) => {
    chips.push({ key: "statuses", label: status.replace("_", " "), value: status })
  })

  if (chips.length === 0) return null

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {chips.map((chip, i) => (
        <Badge key={`${chip.key}-${chip.value || i}`} variant="secondary" className="gap-1 pr-1 font-normal">
          {chip.label}
          <button
            onClick={() => onRemoveFilter(chip.key, chip.value)}
            className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  )
}
