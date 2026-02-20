"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Moon,
  Sun,
  Bell,
  LogOut,
  ExternalLink,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useUser } from "@/lib/user-context"
import { useI18n } from "@/lib/i18n-context"
import { useToast } from "@/lib/toast-context"
import { useTheme } from "next-themes"
import { LanguageSwitcherMobile } from "@/components/layout/language-switcher"
import {
  getMyCenter,
  updateMyCenter,
  type TrainingCenter,
  type UpdateCenterPayload,
} from "@/lib/services/training-centers-service"

export default function ProfileSettingsPage() {
  const router = useRouter()
  const { profile, logout, isLoggedIn, isHydrating, isWebApp, token } = useUser()
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()
  const { showToast } = useToast()

  // Training center state
  const [myCenter, setMyCenter] = useState<TrainingCenter | null | undefined>(undefined) // undefined = loading
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editForm, setEditForm] = useState<UpdateCenterPayload>({
    description: "",
    phone: "",
    telegram: "",
    website: "",
    address: "",
    logo_url: "",
  })

  // Load user's center
  useEffect(() => {
    if (isHydrating) return
    if (!token) {
      setMyCenter(null)
      return
    }
    getMyCenter(token)
      .then((c) => setMyCenter(c))
      .catch(() => setMyCenter(null))
  }, [token, isHydrating])

  // During SSR prerendering, profile may be null
  if (!profile) return null

  const handleLogout = () => {
    logout()
    showToast("success", "Successfully logged out")
    router.push("/")
  }

  const handleOpenEditModal = () => {
    if (myCenter) {
      setEditForm({
        description: myCenter.description || "",
        phone: myCenter.phone || "",
        telegram: myCenter.telegram || "",
        website: myCenter.website || "",
        address: myCenter.address || "",
        logo_url: myCenter.logo_url || "",
      })
      setEditModalOpen(true)
    }
  }

  const handleSaveEdit = async () => {
    if (!token) return
    setEditSubmitting(true)
    try {
      const updated = await updateMyCenter(token, editForm)
      setMyCenter(updated)
      showToast("success", "Training center updated successfully")
      setEditModalOpen(false)
    } catch {
      showToast("error", "Update failed. Try again.")
    } finally {
      setEditSubmitting(false)
    }
  }

  // Redirect guests to login (skip in WebApp mode or while hydrating)
  if (!isHydrating && !isLoggedIn && !isWebApp) {
    router.push("/login")
    return null
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("action.back")}
      </Button>

      <h1 className="text-2xl font-bold mb-6">{t("nav.settings")}</h1>

      {/* Language */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("misc.language")}</CardTitle>
        </CardHeader>
        <CardContent>
          <LanguageSwitcherMobile />
        </CardContent>
      </Card>

      {/* Training Center */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {t("training.title")}
          </CardTitle>
          <CardDescription>Manage your training center registration</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Loading state */}
          {myCenter === undefined && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-9 w-full" />
            </div>
          )}

          {/* Has center */}
          {myCenter !== undefined && myCenter !== null && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{myCenter.name}</p>
                  {myCenter.city && <p className="text-sm text-muted-foreground">{myCenter.city}</p>}
                </div>
                <Badge
                  variant={
                    myCenter.status === "approved"
                      ? "default"
                      : myCenter.status === "pending"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {myCenter.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                  {myCenter.status === "approved" && <CheckCircle className="mr-1 h-3 w-3" />}
                  {myCenter.status === "rejected" && <XCircle className="mr-1 h-3 w-3" />}
                  {myCenter.status === "approved" && myCenter.is_listed
                    ? "Active"
                    : myCenter.status === "approved" && !myCenter.is_listed
                      ? "Unlisted by Admin"
                      : myCenter.status === "pending"
                        ? "Under Review"
                        : "Rejected"}
                </Badge>
              </div>

              {/* Approved status - show view & edit actions */}
              {myCenter.status === "approved" && (
                <div className="flex gap-2">
                  {myCenter.is_listed && (
                    <Link href={`/training-centers/${myCenter.id}`} className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Center
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    className={myCenter.is_listed ? "flex-1 bg-transparent" : "w-full bg-transparent"}
                    onClick={handleOpenEditModal}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Center
                  </Button>
                </div>
              )}

              {/* Pending status */}
              {myCenter.status === "pending" && (
                <p className="text-sm text-muted-foreground">
                  Your center is pending admin approval. You will be notified once reviewed.
                </p>
              )}

              {/* Rejected status */}
              {myCenter.status === "rejected" && (
                <div className="space-y-3">
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm">
                    <p className="text-destructive font-medium">Registration Rejected</p>
                    {myCenter.rejection_reason ? (
                      <p className="text-muted-foreground mt-1">{myCenter.rejection_reason}</p>
                    ) : (
                      <p className="text-muted-foreground mt-1">
                        Your application was not approved. Please review your information and try again.
                      </p>
                    )}
                  </div>
                  <a href="https://t.me/scorex_support" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full bg-transparent">
                      Contact Support
                    </Button>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* No center */}
          {myCenter === null && (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">You haven&apos;t registered a training center yet.</p>
              <Link href="/training-centers/register">
                <Button>{t("training.register")}</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("misc.theme")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <div>
                <Label>{t("misc.darkMode")}</Label>
                <p className="text-sm text-muted-foreground">Toggle dark/light theme</p>
              </div>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive push notifications</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive email updates</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full text-destructive hover:text-destructive bg-transparent"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        {t("nav.logout")}
      </Button>

      {/* Edit Center Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Training Center</DialogTitle>
            <DialogDescription>
              Update your training center information. Only these fields can be modified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
                disabled={editSubmitting}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  disabled={editSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-telegram">Telegram</Label>
                <Input
                  id="edit-telegram"
                  value={editForm.telegram}
                  onChange={(e) => setEditForm({ ...editForm, telegram: e.target.value })}
                  disabled={editSubmitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-website">Website</Label>
              <Input
                id="edit-website"
                value={editForm.website}
                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                disabled={editSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                disabled={editSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-logo">Logo URL</Label>
              <Input
                id="edit-logo"
                value={editForm.logo_url}
                onChange={(e) => setEditForm({ ...editForm, logo_url: e.target.value })}
                disabled={editSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={editSubmitting}>
              {t("action.cancel")}
            </Button>
            <Button onClick={handleSaveEdit} disabled={editSubmitting}>
              {editSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                t("action.save")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
