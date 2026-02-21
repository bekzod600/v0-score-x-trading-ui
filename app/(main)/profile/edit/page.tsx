"use client"

import type React from "react"
import { useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Camera, Loader2, CheckCircle, AlertCircle, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/lib/user-context"
import { uploadImage } from "@/lib/services/upload-service"

export default function EditProfilePage() {
  const router = useRouter()
  const { profile, updateProfile, token } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [displayName, setDisplayName] = useState(profile?.displayName ?? "")
  const [bio, setBio] = useState(profile?.bio ?? "")
  
  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string>(profile?.avatar ?? "")
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null)

  // Save state
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  if (!profile) return null

  // ─── Avatar handling ───────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate
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

    // Show local preview immediately
    const reader = new FileReader()
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to Vercel Blob immediately
    setIsUploadingAvatar(true)
    try {
      const result = await uploadImage(file)
      setUploadedAvatarUrl(result.url)
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Upload failed")
      setAvatarPreview(profile.avatar ?? "")
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // ─── Form submit ────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setSaveError(null)
    setSaveSuccess(false)
    setIsSaving(true)

    try {
      // Build payload — only send changed fields
      const payload: Record<string, string> = {}
      
      const trimmedDisplayName = displayName.trim()
      const trimmedBio = bio.trim()

      if (trimmedDisplayName !== (profile.displayName ?? "")) {
        payload.displayName = trimmedDisplayName
      }
      if (trimmedBio !== (profile.bio ?? "")) {
        payload.bio = trimmedBio
      }
      if (uploadedAvatarUrl && uploadedAvatarUrl !== profile.avatar) {
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
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || `Error ${res.status}`)
      }

      const data = await res.json()

      // Update local context so header/profile reflects changes immediately
      updateProfile({
        displayName: data.profile?.displayName ?? trimmedDisplayName,
        bio: data.profile?.bio ?? trimmedBio,
        avatar: data.profile?.avatar ?? uploadedAvatarUrl ?? profile.avatar,
      })

      setSaveSuccess(true)
      
      // Redirect after short delay
      setTimeout(() => {
        router.push("/profile")
      }, 1200)

    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save changes")
    } finally {
      setIsSaving(false)
    }
  }

  const displayInitials = (profile.displayName || profile.username || "??")
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
            Your Telegram username cannot be changed here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Avatar Upload ─────────────────────────────── */}
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="relative">
                <Avatar className="h-24 w-24 ring-2 ring-border">
                  <AvatarImage
                    src={avatarPreview || "/placeholder.svg"}
                    alt={profile.username}
                  />
                  <AvatarFallback className="text-2xl">
                    {displayInitials}
                  </AvatarFallback>
                </Avatar>

                {/* Upload overlay button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50 transition-opacity"
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

              <div className="flex-1 text-center sm:text-left space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="gap-2"
                >
                  {isUploadingAvatar
                    ? <><Loader2 className="h-4 w-4 animate-spin" />Uploading...</>
                    : <><Upload className="h-4 w-4" />Change Avatar</>
                  }
                </Button>

                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WebP or GIF &middot; Max 4MB
                </p>

                {/* Upload success indicator */}
                {uploadedAvatarUrl && !isUploadingAvatar && !avatarError && (
                  <div className="flex items-center gap-1.5 text-xs text-success">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Avatar uploaded successfully
                  </div>
                )}

                {/* Upload error */}
                {avatarError && (
                  <div className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {avatarError}
                  </div>
                )}
              </div>
            </div>

            {/* ── Telegram Username (read-only) ──────────────── */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Telegram Username
                <Badge variant="secondary" className="text-xs font-normal">Read-only</Badge>
              </Label>
              <div className="flex items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                @{profile.telegramUsername || profile.username || "\u2014"}
              </div>
              <p className="text-xs text-muted-foreground">
                Your Telegram username is managed by Telegram and cannot be changed here.
              </p>
            </div>

            {/* ── Display Name ───────────────────────────────── */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your public display name"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground text-right">
                {displayName.length}/100
              </p>
            </div>

            {/* ── Bio ────────────────────────────────────────── */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 300))}
                placeholder="Tell others about yourself and your trading style..."
                rows={4}
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground text-right">
                {bio.length}/300
              </p>
            </div>

            {/* ── Success / Error messages ────────────────────── */}
            {saveSuccess && (
              <div className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">
                <CheckCircle className="h-4 w-4 shrink-0" />
                Profile saved! Redirecting...
              </div>
            )}

            {saveError && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {saveError}
              </div>
            )}

            {/* ── Actions ────────────────────────────────────── */}
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
