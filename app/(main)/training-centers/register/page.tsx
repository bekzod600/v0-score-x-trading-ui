"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload, CheckCircle, AlertCircle, Clock, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useUser } from "@/lib/user-context"
import { useToast } from "@/lib/toast-context"
import {
  getMyCenter,
  registerCenter,
  type TrainingCenter,
  type RegisterCenterPayload,
} from "@/lib/services/training-centers-service"

export default function RegisterCenterPage() {
  const router = useRouter()
  const { profile, isLoggedIn, token, isHydrating } = useUser()
  const { showToast } = useToast()

  const [myCenter, setMyCenter] = useState<TrainingCenter | null | undefined>(undefined) // undefined = loading
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState<RegisterCenterPayload>({
    name: "",
    city: "",
    phone: "",
    description: "",
    address: "",
    telegram: "",
    website: "",
    logo_url: "",
  })

  // Check if user already has a center
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

  // Login check
  if (!isHydrating && !isLoggedIn) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Login Required</AlertTitle>
          <AlertDescription>
            Please log in to register a training center.
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push("/login")}>
          Go to Login
        </Button>
      </div>
    )
  }

  // Loading state
  if (myCenter === undefined) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <Skeleton className="h-8 w-20 mb-4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Already registered
  if (myCenter !== null) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Already Registered</CardTitle>
            <CardDescription>You can only register one training center.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                {myCenter.status.charAt(0).toUpperCase() + myCenter.status.slice(1)}
              </Badge>
            </div>

            {myCenter.status === "pending" && (
              <p className="text-sm text-muted-foreground">
                Your center is under review. We will notify you once approved.
              </p>
            )}

            {myCenter.status === "approved" && (
              <div className="flex gap-2">
                <Link href={`/training-centers/${myCenter.id}`} className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">View Center</Button>
                </Link>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => router.push("/profile/settings")}>
                  Manage Settings
                </Button>
              </div>
            )}

            {myCenter.status === "rejected" && (
              <div className="space-y-3">
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm">
                  <p className="text-destructive font-medium">Registration Rejected</p>
                  {myCenter.rejection_reason && (
                    <p className="text-muted-foreground mt-1">{myCenter.rejection_reason}</p>
                  )}
                </div>
                <a href="https://t.me/scorex_support" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full bg-transparent">Contact Support</Button>
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Submitted success
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.city || !formData.phone || !formData.description) {
      showToast("error", "Please fill in all required fields.")
      return
    }

    if (!token) return

    setSubmitting(true)
    try {
      // Clean optional empty strings to undefined
      const payload: RegisterCenterPayload = {
        name: formData.name,
        description: formData.description,
        city: formData.city,
        phone: formData.phone,
        address: formData.address || undefined,
        telegram: formData.telegram || undefined,
        website: formData.website || undefined,
        logo_url: formData.logo_url || undefined,
      }

      await registerCenter(token, payload)
      setSubmitted(true)
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Registration failed"
      showToast("error", msg)
    } finally {
      setSubmitting(false)
    }
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
                disabled={submitting}
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
                  disabled={submitting}
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
                  disabled={submitting}
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
                disabled={submitting}
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
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                  disabled={submitting}
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
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                value={formData.logo_url}
                onChange={(e) => setFormData((prev) => ({ ...prev, logo_url: e.target.value }))}
                placeholder="https://example.com/logo.png"
                disabled={submitting}
              />
              <p className="text-xs text-muted-foreground">Paste a direct URL to your logo image</p>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit for Approval"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
