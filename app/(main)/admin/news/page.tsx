"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff, Newspaper, Loader2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { useUser } from "@/lib/user-context"
import { useToast } from "@/lib/toast-context"
import {
  adminListNews,
  adminCreateNews,
  adminUpdateNews,
  adminTogglePublish,
  adminDeleteNews,
  type NewsPost,
  type CreateNewsPayload,
  type UpdateNewsPayload,
} from "@/lib/services/news-service"
import type { ApiError } from "@/lib/api-client"

// ==========================================
// FORM STATE
// ==========================================

interface NewsForm {
  title: string
  summary: string
  content: string
  cover_image: string
  published: boolean
}

const emptyForm: NewsForm = {
  title: "",
  summary: "",
  content: "",
  cover_image: "",
  published: false,
}

// ==========================================
// VALIDATION
// ==========================================

function validateForm(form: NewsForm): string | null {
  if (form.title.length < 3 || form.title.length > 255) {
    return "Title must be between 3 and 255 characters"
  }
  if (form.summary.length < 10 || form.summary.length > 500) {
    return "Summary must be between 10 and 500 characters"
  }
  if (form.content.length < 10) {
    return "Content must be at least 10 characters"
  }
  return null
}

function isFormValid(form: NewsForm): boolean {
  return (
    form.title.length >= 3 &&
    form.title.length <= 255 &&
    form.summary.length >= 10 &&
    form.summary.length <= 500 &&
    form.content.length >= 10
  )
}

// ==========================================
// COMPONENT
// ==========================================

export default function AdminNewsPage() {
  const router = useRouter()
  const { profile, token } = useUser()
  const { showToast } = useToast()

  // Data state
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<NewsForm>(emptyForm)
  const [saving, setSaving] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // ==========================================
  // AUTH GUARD
  // ==========================================

  // During SSR prerendering, profile may be null
  if (!profile) return null

  if (profile.role !== "admin" && profile.role !== "super_admin") {
    router.push("/admin")
    return null
  }

  // ==========================================
  // DATA FETCHING
  // ==========================================

  const fetchPosts = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)

    try {
      const data = await adminListNews(token, { page: 1, limit: 50 })
      setPosts(data.posts)
    } catch (err) {
      const apiErr = err as ApiError
      setError(apiErr.message || "Failed to load news posts")
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const handleEdit = (post: NewsPost) => {
    setEditingId(post.id)
    setForm({
      title: post.title,
      summary: post.summary,
      content: post.content,
      cover_image: post.cover_image || "",
      published: post.published,
    })
    setModalOpen(true)
  }

  const handleModalClose = (open: boolean) => {
    if (!open) {
      setModalOpen(false)
      setForm(emptyForm)
      setEditingId(null)
    }
  }

  const handleSave = async () => {
    if (!token) return

    const validationError = validateForm(form)
    if (validationError) {
      showToast("error", validationError)
      return
    }

    setSaving(true)

    try {
      if (editingId) {
        const payload: UpdateNewsPayload = {
          title: form.title,
          summary: form.summary,
          content: form.content,
          cover_image: form.cover_image || undefined,
          published: form.published,
        }
        await adminUpdateNews(token, editingId, payload)
        showToast("success", "News post updated")
      } else {
        const payload: CreateNewsPayload = {
          title: form.title,
          summary: form.summary,
          content: form.content,
          cover_image: form.cover_image || undefined,
          published: form.published,
        }
        await adminCreateNews(token, payload)
        showToast("success", "News post created")
      }

      setModalOpen(false)
      setForm(emptyForm)
      setEditingId(null)
      await fetchPosts()
    } catch (err) {
      const apiErr = err as ApiError
      showToast("error", apiErr.message || "Failed to save post")
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublish = async (id: string) => {
    if (!token) return

    try {
      await adminTogglePublish(token, id)
      await fetchPosts()
    } catch (err) {
      const apiErr = err as ApiError
      showToast("error", apiErr.message || "Failed to toggle publish")
    }
  }

  const handleDelete = async () => {
    if (!token || !deleteTarget) return

    setDeleting(true)

    try {
      await adminDeleteNews(token, deleteTarget)
      setDeleteTarget(null)
      showToast("info", "News post deleted")
      await fetchPosts()
    } catch (err) {
      const apiErr = err as ApiError
      showToast("error", apiErr.message || "Failed to delete post")
    } finally {
      setDeleting(false)
    }
  }

  // ==========================================
  // COVER IMAGE PREVIEW
  // ==========================================

  const isValidUrl = (url: string): boolean => {
    if (!url) return false
    try {
      if (url.startsWith("/")) return true
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">News Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage news posts
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="w-24 h-16 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
          <p className="text-sm text-destructive mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchPosts}>
            Try again
          </Button>
        </div>
      )}

      {/* Posts list */}
      {!loading && !error && posts.length > 0 && (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {post.cover_image && (
                    <div className="w-24 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      <img
                        src={post.cover_image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{post.title}</h3>
                          <Badge
                            variant={post.published ? "default" : "secondary"}
                            className={
                              post.published
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : ""
                            }
                          >
                            {post.published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {post.summary}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {post.author_username} &middot;{" "}
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTogglePublish(post.id)}
                          title={post.published ? "Unpublish" : "Publish"}
                        >
                          {post.published ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(post)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(post.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && posts.length === 0 && (
        <EmptyState
          icon={Newspaper}
          title="No news posts"
          description="Create your first news post to get started."
          action={{ label: "Create Post", onClick: handleCreate }}
        />
      )}

      {/* ==========================================
          CREATE / EDIT MODAL
          ========================================== */}
      <Dialog open={modalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit News Post" : "Create News Post"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label>
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="News title"
                maxLength={255}
              />
              <p className="text-xs text-muted-foreground text-right">
                {form.title.length}/255
              </p>
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <Label>
                Summary <span className="text-destructive">*</span>
              </Label>
              <Textarea
                value={form.summary}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, summary: e.target.value }))
                }
                placeholder="Brief summary for preview..."
                rows={2}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {form.summary.length}/500
              </p>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label>
                Content <span className="text-destructive">*</span>
              </Label>
              <Textarea
                value={form.content}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="Full article content..."
                rows={8}
              />
              {form.content.length > 0 && form.content.length < 10 && (
                <p className="text-xs text-destructive">
                  Content must be at least 10 characters
                </p>
              )}
            </div>

            {/* Cover Image URL */}
            <div className="space-y-2">
              <Label>Cover Image URL</Label>
              <Input
                value={form.cover_image}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, cover_image: e.target.value }))
                }
                placeholder="/image.jpg or https://..."
              />
              {form.cover_image && isValidUrl(form.cover_image) && (
                <div className="mt-2 aspect-video max-w-xs rounded-lg overflow-hidden bg-secondary">
                  <img
                    src={form.cover_image}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                </div>
              )}
              {form.cover_image && !isValidUrl(form.cover_image) && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <ImageIcon className="h-3 w-3" />
                  <span>Enter a valid URL to preview the image</span>
                </div>
              )}
            </div>

            {/* Published toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Publish immediately</Label>
                <p className="text-sm text-muted-foreground">
                  Make this post visible to all users
                </p>
              </div>
              <Switch
                checked={form.published}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, published: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !isFormValid(form)}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingId ? (
                "Save Changes"
              ) : (
                "Create Post"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==========================================
          DELETE CONFIRMATION
          ========================================== */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this news post. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
