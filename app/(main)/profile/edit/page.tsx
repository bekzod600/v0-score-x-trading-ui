"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Camera, Loader2, CheckCircle, AlertCircle, Upload, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useUser } from "@/lib/user-context"
import { uploadImage } from "@/lib/services/upload-service"

// Backend /me/profile dan keladigan response tipi
interface RemoteProfile {
  id: string
  telegramId?: number
  telegramUsername?: string | null
  telegramFirstName?: string | null
  telegramLastName?: string | null
  displayName?: string | null
  bio?: string | null
  avatar?: string | null
  role?: string
  scoreXPoints?: number
}

export default function EditProfilePage() {
  const router = useRouter()
  const { token, isHydrating, updateProfile } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Remote data
  const [remoteProfile, setRemoteProfile] = useState<RemoteProfile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Form state — initialized after API response
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null)

  // Save state
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // ─── Fetch profile from backend ──────────────────────────
  const fetchProfile = useCallback(async () => {
    if (!token) return
    setIsLoadingProfile(true)
    setLoadError(null)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/me/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      )

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data: RemoteProfile = await res.json()
      setRemoteProfile(data)

      // MUHIM: forma fieldlarini faqat shu yerda to'ldiramiz
      setDisplayName(data.displayName || data.telegramFirstName || "")
      setBio(data.bio || "")
      setAvatarPreview(data.avatar || "")
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to load profile"
      )
    } finally {
      setIsLoadingProfile(false)
    }
  }, [token])

  useEffect(() => {
    if (!isHydrating && token) {
      fetchProfile()
    } else if (!isHydrating && !token) {
      router.push("/login")
    }
  }, [isHydrating, token, fetchProfile, router])

  // ─── Avatar change ──────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowed.includes(file.type)) {
      setAvatarError("Only JPG, PNG, WebP or GIF files are allowed")
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      setAvatarError("File must be under 4MB")
      return
    }

    setAvatarError(null)

    // Local preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to Vercel Blob
    setIsUploadingAvatar(true)
    try {
      const result = await uploadImage(file)
      setUploadedAvatarUrl(result.url)
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Upload failed")
      // Revert preview
      setAvatarPreview(remoteProfile?.avatar || "")
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // ─── Form submit ────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setSaveError(null)
    setSaveSuccess(false)
    setIsSaving(true)

    try {
      const payload: Record<string, string | null> = {}

      const trimmedName = displayName.trim()
      const trimmedBio = bio.trim()

      payload.displayName = trimmedName || null
      payload.bio = trimmedBio || null

      if (uploadedAvatarUrl) {
        payload.avatar = uploadedAvatarUrl
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/me/profile`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(
          (errData as { message?: string }).message || `Error ${res.status}`
        )
      }

      const data = await res.json() as {
        success: boolean
        profile?: RemoteProfile
      }

      // Context ni yangilash — header va boshqa joylarda avatar/name ko'rinsin
      const updated = data.profile
      updateProfile({
        displayName: updated?.displayName || trimmedName || undefined,
        bio: updated?.bio || trimmedBio || undefined,
        avatar: updated?.avatar || uploadedAvatarUrl || remoteProfile?.avatar || undefined,
      })

      setSaveSuccess(true)

      setTimeout(() => {
        router.push("/profile")
      }, 1500)
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save changes"
      )
    } finally {
      setIsSaving(false)
    }
  }

  // ─── Loading / error states ─────────────────────────────
  if (isHydrating || (!remoteProfile && isLoadingProfile)) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-72 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Skeleton className="h-24 w-24 rounded-full shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-9 w-36" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-28 w-full" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <Link
          href="/profile"
          className="mb-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-sm text-muted-foreground text-center">
              {loadError}
            </p>
            <Button
              variant="outline"
              onClick={fetchProfile}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const telegramHandle =
    remoteProfile?.telegramUsername || ""
  const initials = (displayName || telegramHandle || "U")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <Link
        href="/profile"
        className="mb-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Profile
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>
            Update your display name, bio, and profile picture.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Avatar ─────────────────────────────────────── */}
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="relative shrink-0">
                <Avatar className="h-24 w-24 ring-2 ring-border">
                  <AvatarImage
                    src={avatarPreview || "/placeholder.svg"}
                    alt={displayName || telegramHandle}
                  />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50 transition-all"
                >
                  {isUploadingAvatar
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Camera className="h-4 w-4" />
                  }
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="gap-2"
                >
                  {isUploadingAvatar
                    ? <><Loader2 className="h-4 w-4 animate-spin" />Uploading...</>
                    : <><Upload className="h-4 w-4" />Change Photo</>
                  }
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WebP or GIF · Max 4 MB
                </p>
                {uploadedAvatarUrl && !isUploadingAvatar && !avatarError && (
                  <p className="flex items-center gap-1.5 text-xs text-success justify-center sm:justify-start">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Photo uploaded
                  </p>
                )}
                {avatarError && (
                  <p className="flex items-center gap-1.5 text-xs text-destructive justify-center sm:justify-start">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {avatarError}
                  </p>
                )}
              </div>
            </div>

            {/* ── Telegram username (read-only) ───────────────── */}
            {telegramHandle && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Telegram Username
                  <Badge variant="secondary" className="text-xs font-normal">
                    Read-only
                  </Badge>
                </Label>
                <div className="flex h-10 items-center rounded-md border border-input bg-muted/50 px-3 text-sm text-muted-foreground">
                  @{telegramHandle}
                </div>
              </div>
            )}

            {/* ── Display Name ────────────────────────────────── */}
            <div className="space-y-2">
              <Label htmlFor="displayName">
                Display Name
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value.slice(0, 100))}
                placeholder={remoteProfile?.telegramFirstName || "Your display name"}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground text-right">
                {displayName.length}/100
              </p>
            </div>

            {/* ── Bio ─────────────────────────────────────────── */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 300))}
                placeholder="Describe your trading style, strategy, or experience..."
                rows={4}
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground text-right">
                {bio.length}/300
              </p>
            </div>

            {/* ── Success / Error ──────────────────────────────── */}
            {saveSuccess && (
              <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
                <CheckCircle className="h-4 w-4 shrink-0" />
                Profile saved successfully! Redirecting...
              </div>
            )}
            {saveError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {saveError}
              </div>
            )}

            {/* ── Actions ─────────────────────────────────────── */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent"
                asChild
                disabled={isSaving}
              >
                <Link href="/profile">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSaving || isUploadingAvatar || saveSuccess}
                className="flex-1"
              >
                {isSaving
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                  : "Save Changes"
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
