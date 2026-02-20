"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Check,
  X,
  Eye,
  EyeOff,
  MapPin,
  Star,
  Users,
  Search,
  Building,
  Loader2,
  Phone,
  Send,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { useUser } from "@/lib/user-context"
import { useToast } from "@/lib/toast-context"
import {
  adminListCenters,
  adminApproveCenter,
  adminRejectCenter,
  adminToggleListing,
  type TrainingCenter,
} from "@/lib/services/training-centers-service"

function AdminCenterSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Skeleton className="h-16 w-16 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminCentersPage() {
  const router = useRouter()
  const { token, profile } = useUser()
  const { showToast } = useToast()

  const [centers, setCenters] = useState<TrainingCenter[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "all">("pending")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null })
  const [rejectReason, setRejectReason] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null) // center id

  // Counts per tab
  const [pendingCount, setPendingCount] = useState(0)
  const [approvedCount, setApprovedCount] = useState(0)

  // Debounce search
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  // Admin guard
  if (profile && profile.role !== "admin" && profile.role !== "super_admin") {
    router.push("/admin")
    return null
  }

  const loadCenters = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await adminListCenters(token, {
        status: activeTab === "all" ? "all" : activeTab,
        search: debouncedSearch || undefined,
        limit: 50,
      })
      setCenters(res.centers)

      // Update counts: if no search, use response for current tab count
      if (!debouncedSearch) {
        if (activeTab === "pending") setPendingCount(res.total)
        else if (activeTab === "approved") setApprovedCount(res.total)
      }
    } catch {
      showToast("error", "Failed to load centers")
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, debouncedSearch, token])

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    loadCenters()
  }, [loadCenters])

  // Load counts once on mount
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!token) return
    const fetchCounts = async () => {
      try {
        const [pendingRes, approvedRes] = await Promise.all([
          adminListCenters(token, { status: "pending", limit: 1 }),
          adminListCenters(token, { status: "approved", limit: 1 }),
        ])
        setPendingCount(pendingRes.total)
        setApprovedCount(approvedRes.total)
      } catch {
        // silently fail
      }
    }
    fetchCounts()
  }, [token])

  const handleApprove = async (id: string) => {
    if (!token) return
    setActionLoading(id)
    try {
      await adminApproveCenter(token, id)
      showToast("success", "Center approved and now public.")
      loadCenters()
    } catch {
      showToast("error", "Failed to approve.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!token || !rejectModal.id) return
    setActionLoading(rejectModal.id)
    try {
      await adminRejectCenter(token, rejectModal.id, rejectReason || undefined)
      showToast("info", "Center rejected.")
      setRejectModal({ open: false, id: null })
      setRejectReason("")
      loadCenters()
    } catch {
      showToast("error", "Failed to reject.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleListing = async (id: string) => {
    if (!token) return
    setActionLoading(id)
    try {
      const updated = await adminToggleListing(token, id)
      showToast("info", updated.is_listed ? "Center relisted." : "Center unlisted.")
      loadCenters()
    } catch {
      showToast("error", "Failed.")
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Training Centers</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage center approvals and listings</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "pending" | "approved" | "all")}>
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        {/* Search for approved & all tabs */}
        {(activeTab === "approved" || activeTab === "all") && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search centers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <AdminCenterSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Pending Tab */}
        {!loading && (
          <TabsContent value="pending" className="mt-0">
            {centers.length > 0 ? (
              <div className="space-y-4">
                {centers.map((center) => (
                  <Card key={center.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Avatar className="h-16 w-16 rounded-lg shrink-0">
                          <AvatarImage src={center.logo_url || undefined} />
                          <AvatarFallback className="rounded-lg">
                            <Building className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{center.name}</h3>
                          {center.city && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{center.city}</span>
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            Submitted by: <span className="font-medium">{center.owner.username}</span>
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{center.description}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                            {center.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {center.phone}
                              </span>
                            )}
                            {center.telegram && (
                              <span className="flex items-center gap-1">
                                <Send className="h-3 w-3" />
                                {center.telegram}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(center.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => handleApprove(center.id)}
                          className="flex-1"
                          disabled={actionLoading === center.id}
                        >
                          {actionLoading === center.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="mr-2 h-4 w-4" />
                          )}
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setRejectModal({ open: true, id: center.id })
                          }}
                          className="flex-1"
                          disabled={actionLoading === center.id}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState icon={Check} title="All caught up" description="No pending center applications to review." />
            )}
          </TabsContent>
        )}

        {/* Approved Tab */}
        {!loading && (
          <TabsContent value="approved" className="mt-0">
            {centers.length > 0 ? (
              <div className="space-y-3">
                {centers.map((center) => (
                  <Card key={center.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 rounded-lg shrink-0">
                          <AvatarImage src={center.logo_url || undefined} />
                          <AvatarFallback className="rounded-lg">
                            <Building className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium truncate">{center.name}</h3>
                            {!center.is_listed && <Badge variant="secondary">Unlisted</Badge>}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            {center.city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {center.city}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5" />
                              {Number(center.rating).toFixed(1)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {center.students_count}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/training-centers/${center.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleListing(center.id)}
                            disabled={actionLoading === center.id}
                          >
                            {actionLoading === center.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : center.is_listed ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState icon={Building} title="No centers found" description="No approved centers match your search." />
            )}
          </TabsContent>
        )}

        {/* All Tab */}
        {!loading && (
          <TabsContent value="all" className="mt-0">
            {centers.length > 0 ? (
              <div className="space-y-3">
                {centers.map((center) => (
                  <Card key={center.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 rounded-lg shrink-0">
                          <AvatarImage src={center.logo_url || undefined} />
                          <AvatarFallback className="rounded-lg">
                            <Building className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium truncate">{center.name}</h3>
                            <Badge
                              variant={
                                center.status === "approved"
                                  ? "default"
                                  : center.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {center.status}
                            </Badge>
                            {center.status === "approved" && !center.is_listed && (
                              <Badge variant="secondary">Unlisted</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            {center.city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {center.city}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5" />
                              {Number(center.rating).toFixed(1)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {center.students_count}
                            </span>
                            <span className="flex items-center gap-1 text-xs">
                              by {center.owner.username}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Link href={`/training-centers/${center.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {center.status === "approved" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleListing(center.id)}
                              disabled={actionLoading === center.id}
                            >
                              {actionLoading === center.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : center.is_listed ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          {center.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleApprove(center.id)}
                                disabled={actionLoading === center.id}
                              >
                                {actionLoading === center.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4 text-green-500" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setRejectModal({ open: true, id: center.id })}
                                disabled={actionLoading === center.id}
                              >
                                <X className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState icon={Building} title="No centers found" description="No centers match your search." />
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Reject Modal */}
      <Dialog open={rejectModal.open} onOpenChange={(open) => {
        if (!open) {
          setRejectModal({ open: false, id: null })
          setRejectReason("")
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Center Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rejection Reason (optional)</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRejectModal({ open: false, id: null })
              setRejectReason("")
            }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading === rejectModal.id}
            >
              {actionLoading === rejectModal.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Application"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
