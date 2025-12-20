"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, MapPin, Star, Users, SlidersHorizontal, ArrowUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState } from "@/components/ui/empty-state"
import { useAdmin } from "@/lib/admin-context"
import { GraduationCap } from "lucide-react"

type SortOption = "rating" | "students" | "newest"

export default function TrainingCentersPage() {
  const { trainingCenters } = useAdmin()
  const [search, setSearch] = useState("")
  const [cityFilter, setCityFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortOption>("rating")

  // Only show approved centers
  const approvedCenters = trainingCenters.filter((c) => c.status === "approved")

  // Get unique cities for filter
  const cities = useMemo(() => {
    const uniqueCities = new Set(approvedCenters.map((c) => c.city))
    return Array.from(uniqueCities).sort()
  }, [approvedCenters])

  // Filter and sort centers
  const filteredCenters = useMemo(() => {
    let filtered = approvedCenters

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (c) => c.name.toLowerCase().includes(searchLower) || c.city.toLowerCase().includes(searchLower),
      )
    }

    // City filter
    if (cityFilter !== "all") {
      filtered = filtered.filter((c) => c.city === cityFilter)
    }

    // Sort
    switch (sortBy) {
      case "rating":
        filtered = [...filtered].sort((a, b) => b.rating - a.rating)
        break
      case "students":
        filtered = [...filtered].sort((a, b) => b.studentsCount - a.studentsCount)
        break
      case "newest":
        filtered = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    return filtered
  }, [approvedCenters, search, cityFilter, sortBy])

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Training Centers</h1>
          <p className="text-sm text-muted-foreground mt-1">Learn trading from verified experts</p>
        </div>
        <Link href="/training-centers/register">
          <Button className="w-full sm:w-auto">Register Your Center</Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-[140px]">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[160px]">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="students">Most Students</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Centers List */}
      {filteredCenters.length > 0 ? (
        <div className="space-y-4">
          {filteredCenters.map((center) => (
            <Card key={center.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Avatar className="h-16 w-16 rounded-lg">
                    <AvatarImage src={center.logo || "/placeholder.svg?height=64&width=64"} alt={center.name} />
                    <AvatarFallback className="rounded-lg text-lg">{center.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-base truncate">{center.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{center.city}</span>
                        </div>
                      </div>
                      <Link href={`/training-centers/${center.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="font-medium">{center.rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">({center.ratingCount})</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{center.studentsCount} students</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={GraduationCap}
          title="No centers found"
          description={
            search || cityFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Be the first to register a training center!"
          }
          action={
            !search && cityFilter === "all" ? (
              <Link href="/training-centers/register">
                <Button>Register Your Center</Button>
              </Link>
            ) : undefined
          }
        />
      )}
    </div>
  )
}
