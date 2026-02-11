"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAdmin } from "@/lib/admin-context"
import { useUser } from "@/lib/user-context"
import { useToast } from "@/lib/toast-context"

export default function RegisterCenterPage() {
  const router = useRouter()
  const { getUserCenter, registerCenter } = useAdmin()
  const { profile, isLoggedIn } = useUser()
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    phone: "",
    telegram: "",
    website: "",
    description: "",
  })
  const [submitted, setSubmitted] = useState(false)

  // During SSR prerendering, profile may be null
  if (!profile) return null

  // Check if user already has a center
  const existingCenter = getUserCenter(profile.id)

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Login Required</AlertTitle>
          <AlertDescription>Please log in to register a training center.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (existingCenter) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Already Registered</AlertTitle>
          <AlertDescription>
            You can only register one training center. Your center "{existingCenter.name}" is currently{" "}
            {existingCenter.status === "pending" ? "pending approval" : existingCenter.status}.
          </AlertDescription>
        </Alert>
        {existingCenter.status === "approved" && (
          <Button className="mt-4" onClick={() => router.push("/profile/settings")}>
            Manage Your Center
          </Button>
        )}
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Submitted for Approval</h2>
            <p className="text-muted-foreground mb-6">
              Your training center registration has been submitted. We will review your application and notify you once
              approved.
            </p>
            <Button onClick={() => router.push("/training-centers")}>Back to Training Centers</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.city || !formData.phone || !formData.description) {
      showToast("Please fill in all required fields.", "error")
      return
    }

    registerCenter({
      ...formData,
      ownerId: profile.id,
      ownerUsername: profile.username,
      ownerAvatar: profile.avatar,
      logo: "",
    })

    setSubmitted(true)
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Register Your Training Center</CardTitle>
          <CardDescription>Submit your center for admin approval. You can only register one center.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Center Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Your trading center name"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">
                  City/Region <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="e.g., Tashkent"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+998 90 123 45 67"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Full address (optional)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telegram">Telegram</Label>
                <Input
                  id="telegram"
                  value={formData.telegram}
                  onChange={(e) => setFormData((prev) => ({ ...prev, telegram: e.target.value }))}
                  placeholder="@yourtelegram"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your training center, courses offered, experience, etc."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Logo upload coming soon</p>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Submit for Approval
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
