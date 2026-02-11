"use client"

import { useState } from "react"
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
  Shield,
  LogOut,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
import { useAdmin } from "@/lib/admin-context"
import { useUser } from "@/lib/user-context"
import { useI18n } from "@/lib/i18n-context"
import { useToast } from "@/lib/toast-context"
import { useTheme } from "next-themes"
import { LanguageSwitcherMobile } from "@/components/layout/language-switcher"

export default function ProfileSettingsPage() {
  const router = useRouter()
  const { getUserCenter, updateCenter, setRole, currentUserRole, isAdmin } = useAdmin()
  const { profile, logout, isLoggedIn } = useUser()
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()
  const { showToast } = useToast()

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    description: "",
    phone: "",
    telegram: "",
    website: "",
    address: "",
    logo: "",
  })

  // During SSR prerendering, profile may be null
  if (!profile) return null

  const userCenter = getUserCenter(profile.id)

  const handleLogout = () => {
    logout()
    showToast("Successfully logged out", "success")
    router.push("/")
  }

  const handleOpenEditModal = () => {
    if (userCenter) {
      setEditForm({
        description: userCenter.description,
        phone: userCenter.phone,
        telegram: userCenter.telegram,
        website: userCenter.website,
        address: userCenter.address,
        logo: userCenter.logo,
      })
      setEditModalOpen(true)
    }
  }

  const handleSaveEdit = () => {
    if (userCenter) {
      updateCenter(userCenter.id, editForm)
      showToast("Training center updated successfully", "success")
      setEditModalOpen(false)
    }
  }

  // Redirect guests to login
  if (!isLoggedIn) {
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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {t("training.title")}
          </CardTitle>
          <CardDescription>Manage your training center registration</CardDescription>
        </CardHeader>
        <CardContent>
          {userCenter ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{userCenter.name}</p>
                  <p className="text-sm text-muted-foreground">{userCenter.city}</p>
                </div>
                <Badge
                  variant={
                    userCenter.status === "approved"
                      ? "default"
                      : userCenter.status === "pending"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {userCenter.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                  {userCenter.status === "approved" && <CheckCircle className="mr-1 h-3 w-3" />}
                  {userCenter.status === "rejected" && <XCircle className="mr-1 h-3 w-3" />}
                  {userCenter.status.charAt(0).toUpperCase() + userCenter.status.slice(1)}
                </Badge>
              </div>

              {/* Approved status - show view & edit actions */}
              {userCenter.status === "approved" && (
                <div className="flex gap-2">
                  <Link href={`/training-centers/${userCenter.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Center
                    </Button>
                  </Link>
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={handleOpenEditModal}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Center
                  </Button>
                </div>
              )}

              {/* Pending status - show message */}
              {userCenter.status === "pending" && (
                <p className="text-sm text-muted-foreground">
                  Your center is pending admin approval. You will be notified once reviewed.
                </p>
              )}

              {/* Rejected status - show reason and allow resubmission */}
              {userCenter.status === "rejected" && (
                <div className="space-y-3">
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm">
                    <p className="text-destructive font-medium">Registration Rejected</p>
                    <p className="text-muted-foreground mt-1">
                      Your application was not approved. Please review your information and try again.
                    </p>
                  </div>
                  <Link href="/training-centers/register">
                    <Button variant="outline" className="w-full bg-transparent">
                      Resubmit Application
                    </Button>
                  </Link>
                </div>
              )}

              {/* Unlisted status */}
              {userCenter.status === "unlisted" && (
                <p className="text-sm text-muted-foreground">
                  Your center has been unlisted by admin. Contact support for more information.
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">You haven't registered a training center yet.</p>
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

      {/* Dev/Demo: Role Switcher */}
      <Card className="mb-6 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Demo: Role Switcher
          </CardTitle>
          <CardDescription>For testing purposes only</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>Admin Mode</Label>
              <p className="text-sm text-muted-foreground">
                Current role: <Badge variant={isAdmin ? "default" : "secondary"}>{currentUserRole}</Badge>
              </p>
            </div>
            <Switch checked={isAdmin} onCheckedChange={(checked) => setRole(checked ? "admin" : "user")} />
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
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-telegram">Telegram</Label>
                <Input
                  id="edit-telegram"
                  value={editForm.telegram}
                  onChange={(e) => setEditForm({ ...editForm, telegram: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-website">Website</Label>
              <Input
                id="edit-website"
                value={editForm.website}
                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-logo">Logo URL</Label>
              <Input
                id="edit-logo"
                value={editForm.logo}
                onChange={(e) => setEditForm({ ...editForm, logo: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              {t("action.cancel")}
            </Button>
            <Button onClick={handleSaveEdit}>{t("action.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
