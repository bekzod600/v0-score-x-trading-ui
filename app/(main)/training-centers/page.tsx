"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { Search, MapPin, Star, Users, SlidersHorizontal, ArrowUpDown, Loader2, GraduationCap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState } from "@/components/ui/empty-state"
import { useUser } from "@/lib/user-context"
import { listCenters, type TrainingCenter } from "@/lib/services/training-centers-service"

type SortOption = "rating" | "students" | "newest"

function CenterSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Skeleton className="h-16 w-16 rounded-lg shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-4 pt-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TrainingCentersPage() {
  const { token } = useUser()
  const [centers, setCenters] = useState<TrainingCenter[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [cityFilter, setCityFilter] = useState("all")
  const [sortBy, setSortBy] = useState<SortOption>("rating")

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search)
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  // Extract unique cities from loaded centers for filter dropdown
  const [cities, setCities] = useState<string[]>([])

  const loadCenters = useCallback(
    async (reset = false) => {
      const currentPage = reset ? 1 : page
      if (reset) {
        setPage(1)
        setCenters([])
      }

      reset ? setLoading(true) : setLoadingMore(true)
      setError(null)

      try {
        const res = await listCenters({
          page: currentPage,
          limit: 12,
          search: debouncedSearch || undefined,
          city: cityFilter !== "all" ? cityFilter : undefined,
          sort: sortBy,
          token,
        })

        if (reset) {
          setCenters(res.centers)
        } else {
          setCenters((prev) => [...prev, ...res.centers])
        }
        setTotal(res.total)
        if (!reset) setPage((p) => p + 1)

        // Collect unique cities
        if (reset) {
          const uniqueCities = new Set<string>()
          res.centers.forEach((c) => {
            if (c.city) uniqueCities.add(c.city)
          })
          setCities((prev) => {
            const merged = new Set([...prev, ...uniqueCities])
            return Array.from(merged).sort()
          })
        }
      } catch {
        setError("Failed to load training centers")
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [page, debouncedSearch, cityFilter, sortBy, token],
  )

  // Load on filter changes
  useEffect(() => {
    loadCenters(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, cityFilter, sortBy])

  const hasMore = centers.length < total

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

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CenterSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <EmptyState
          icon={GraduationCap}
          title="Failed to load centers"
          description={error}
          action={{ label: "Try Again", onClick: () => loadCenters(true) }}
        />
      )}

      {/* Centers List */}
      {!loading && !error && centers.length > 0 && (
        <div className="space-y-4">
          {centers.map((center) => (
            <Link key={center.id} href={`/training-centers/${center.id}`} className="block">
              <Card className="overflow-hidden hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Avatar className="h-16 w-16 rounded-lg shrink-0">
                      <AvatarImage src={center.logo_url || undefined} alt={center.name} />
                      <AvatarFallback className="rounded-lg text-lg">{center.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-base truncate">{center.name}</h3>
                          {center.city && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{center.city}</span>
                            </div>
                          )}
                        </div>
                        {center.is_enrolled && (
                          <Badge variant="secondary" className="shrink-0 text-xs">
                            Studied Here
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="font-medium">{Number(center.rating).toFixed(1)}</span>
                          <span className="text-sm text-muted-foreground">({center.rating_count})</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{center.students_count} students</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => loadCenters(false)}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && centers.length === 0 && (
        <EmptyState
          icon={GraduationCap}
          title="No centers found"
          description={
            search || cityFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Be the first to register a training center!"
          }
          action={
            !search && cityFilter === "all"
              ? { label: "Register Your Center", href: "/training-centers/register" }
              : undefined
          }
        />
      )}
    </div>
  )
}
