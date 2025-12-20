"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, X, Clock, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EmptyState } from "@/components/ui/empty-state"
import { useAdmin } from "@/lib/admin-context"
import { useToast } from "@/lib/toast-context"

export default function AdminP2PPage() {
  const router = useRouter()
  const { isAdmin, p2pPayments, approveP2P, rejectP2P } = useAdmin()
  const { showToast } = useToast()

  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [screenshotModal, setScreenshotModal] = useState<string | null>(null)

  if (!isAdmin) {
    router.push("/admin")
    return null
  }

  const pendingPayments = p2pPayments.filter((p) => p.status === "pending")
  const processedPayments = p2pPayments.filter((p) => p.status !== "pending")

  const handleApprove = (id: string) => {
    approveP2P(id)
    showToast("Payment approved. User balance updated.", "success")
  }

  const handleReject = () => {
    if (selectedPayment) {
      rejectP2P(selectedPayment, rejectReason || "Payment rejected by admin")
      showToast("Payment rejected.", "info")
      setRejectModalOpen(false)
      setSelectedPayment(null)
      setRejectReason("")
    }
  }

  const openRejectModal = (id: string) => {
    setSelectedPayment(id)
    setRejectModalOpen(true)
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">P2P Payment Approvals</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and approve P2P top-up requests</p>
      </div>

      {/* Pending */}
      <h2 className="font-semibold mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Pending ({pendingPayments.length})
      </h2>

      {pendingPayments.length > 0 ? (
        <div className="space-y-3 mb-8">
          {pendingPayments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={payment.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{payment.username.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-medium">{payment.username}</p>
                      <span className="text-xl font-bold text-primary">${payment.amount}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Badge variant="secondary">{payment.cardType}</Badge>
                      <span>{new Date(payment.createdAt).toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => setScreenshotModal(payment.screenshot)}
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ImageIcon className="h-4 w-4" />
                      View Screenshot
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => handleApprove(payment.id)} className="flex-1">
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button variant="outline" onClick={() => openRejectModal(payment.id)} className="flex-1">
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Check}
          title="All caught up"
          description="No pending P2P payments to review."
          className="mb-8"
        />
      )}

      {/* Processed */}
      {processedPayments.length > 0 && (
        <>
          <h2 className="font-semibold mb-3">Recently Processed</h2>
          <div className="space-y-2">
            {processedPayments.slice(0, 5).map((payment) => (
              <Card key={payment.id} className="opacity-60">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={payment.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{payment.username.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{payment.username}</p>
                      <p className="text-xs text-muted-foreground">
                        ${payment.amount} via {payment.cardType}
                      </p>
                    </div>
                  </div>
                  <Badge variant={payment.status === "approved" ? "default" : "destructive"}>{payment.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
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
              Reject Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Screenshot Modal */}
      <Dialog open={!!screenshotModal} onOpenChange={() => setScreenshotModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
          </DialogHeader>
          <div className="aspect-[3/4] bg-secondary rounded-lg overflow-hidden">
            <img
              src={screenshotModal || "/placeholder.svg?height=400&width=300"}
              alt="Payment screenshot"
              className="w-full h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
