"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, X, Eye, EyeOff, MapPin, Star, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EmptyState } from "@/components/ui/empty-state"
import { useAdmin } from "@/lib/admin-context"
import { useToast } from "@/lib/toast-context"
import { Building } from "lucide-react"

export default function AdminCentersPage() {
  const router = useRouter()
  const { isAdmin, trainingCenters, approveCenter, rejectCenter, toggleCenterListing } = useAdmin()
  const { showToast } = useToast()

  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [search, setSearch] = useState("")

  if (!isAdmin) {
    router.push("/admin")
    return null
  }

  const pendingCenters = trainingCenters.filter((c) => c.status === "pending")
  const approvedCenters = trainingCenters.filter((c) => c.status === "approved" || c.status === "unlisted")

  const filteredApproved = approvedCenters.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase()),
  )

  const handleApprove = (id: string) => {
    approveCenter(id)
    showToast("Training center approved and now public.", "success")
  }

  const handleReject = () => {
    if (selectedCenter) {
      rejectCenter(selectedCenter, rejectReason)
      showToast("Training center rejected.", "info")
      setRejectModalOpen(false)
      setSelectedCenter(null)
      setRejectReason("")
    }
  }

  const handleToggleListing = (id: string, currentStatus: string) => {
    toggleCenterListing(id)
    showToast(currentStatus === "approved" ? "Center unlisted." : "Center relisted.", "info")
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

      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending ({pendingCenters.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedCenters.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingCenters.length > 0 ? (
            <div className="space-y-4">
              {pendingCenters.map((center) => (
                <Card key={center.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Avatar className="h-16 w-16 rounded-lg">
                        <AvatarImage src={center.logo || "/placeholder.svg?height=64&width=64"} />
                        <AvatarFallback className="rounded-lg">{center.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{center.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{center.city}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Submitted by: <span className="font-medium">{center.ownerUsername}</span>
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{center.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={() => handleApprove(center.id)} className="flex-1">
                        <Check className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedCenter(center.id)
                          setRejectModalOpen(true)
                        }}
                        className="flex-1"
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

        <TabsContent value="approved">
          <Input
            placeholder="Search centers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />
          {filteredApproved.length > 0 ? (
            <div className="space-y-3">
              {filteredApproved.map((center) => (
                <Card key={center.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 rounded-lg">
                        <AvatarImage src={center.logo || "/placeholder.svg?height=48&width=48"} />
                        <AvatarFallback className="rounded-lg">{center.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{center.name}</h3>
                          {center.status === "unlisted" && <Badge variant="secondary">Unlisted</Badge>}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {center.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5" />
                            {center.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {center.studentsCount}
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
                          onClick={() => handleToggleListing(center.id, center.status)}
                        >
                          {center.status === "approved" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
      </Tabs>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Center Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
