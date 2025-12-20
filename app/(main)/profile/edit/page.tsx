"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Camera, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useUser } from "@/lib/user-context"
import { useWallet } from "@/lib/wallet-context"

export default function EditProfilePage() {
  const router = useRouter()
  const { profile, updateProfile } = useUser()
  const { addNotification } = useWallet()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [displayName, setDisplayName] = useState(profile.displayName)
  const [username, setUsername] = useState(profile.username)
  const [bio, setBio] = useState(profile.bio)
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar)
  const [isSaving, setIsSaving] = useState(false)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addNotification({
          title: "File too large",
          message: "Please select an image under 2MB.",
          type: "warning",
        })
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setAvatarPreview(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    updateProfile({
      displayName,
      username,
      bio,
      avatar: avatarPreview,
    })

    addNotification({
      title: "Profile Updated",
      message: "Your profile changes have been saved.",
      type: "success",
      link: "/profile",
    })

    setIsSaving(false)
    router.push("/profile")
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <Link href="/profile" className="mb-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Profile
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarPreview || "/placeholder.svg"} alt={username} />
                  <AvatarFallback className="text-2xl">{username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  Change Avatar
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="flex items-center">
                <span className="flex h-9 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                  @
                </span>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-l-none"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">{bio.length}/300 characters</p>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1 bg-transparent" asChild>
                <Link href="/profile">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
