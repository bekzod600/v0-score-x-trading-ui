"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff, Newspaper, Loader2, ImageIcon, X } from "lucide-react"
import { uploadImage } from "@/lib/services/upload-service"
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

  // Image upload state
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    setCoverFile(null)
    setCoverPreview("")
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
    setCoverFile(null)
    setCoverPreview(post.cover_image ?? "")
    setModalOpen(true)
  }

  const handleModalClose = (open: boolean) => {
    if (!open) {
      setModalOpen(false)
      setForm(emptyForm)
      setEditingId(null)
      setCoverFile(null)
      setCoverPreview("")
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
      let coverImageUrl = form.cover_image

      // Upload new file to Vercel Blob if selected
      if (coverFile) {
        setIsUploading(true)
        try {
          const result = await uploadImage(coverFile)
          coverImageUrl = result.url
        } catch {
          showToast("error", "Image upload failed. Try again.")
          setIsUploading(false)
          setSaving(false)
          return
        }
        setIsUploading(false)
      }

      if (editingId) {
        const payload: UpdateNewsPayload = {
          title: form.title,
          summary: form.summary,
          content: form.content,
          cover_image: coverImageUrl || undefined,
          published: form.published,
        }
        await adminUpdateNews(token, editingId, payload)
        showToast("success", "News post updated")
      } else {
        const payload: CreateNewsPayload = {
          title: form.title,
          summary: form.summary,
          content: form.content,
          cover_image: coverImageUrl || undefined,
          published: form.published,
        }
        await adminCreateNews(token, payload)
        showToast("success", "News post created")
      }

      setModalOpen(false)
      setForm(emptyForm)
      setEditingId(null)
      setCoverFile(null)
      setCoverPreview("")
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

            {/* Cover Image Upload */}
            <div className="space-y-2">
              <Label>Cover Image</Label>

              {/* Preview area */}
              {coverPreview && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-secondary border">
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverFile(null)
                      setCoverPreview("")
                      setForm((f) => ({ ...f, cover_image: "" }))
                      if (fileInputRef.current) fileInputRef.current.value = ""
                    }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 hover:bg-black/80 text-white"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Upload dropzone */}
              {!coverPreview && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/50 
                             flex flex-col items-center justify-center gap-2 cursor-pointer
                             bg-secondary/30 hover:bg-secondary/60 transition-colors"
                >
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload cover image</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, WebP -- max 4MB</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return

                  if (file.size > 4 * 1024 * 1024) {
                    showToast("error", "Image must be under 4MB")
                    return
                  }

                  setCoverFile(file)
                  const localUrl = URL.createObjectURL(file)
                  setCoverPreview(localUrl)
                }}
              />
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
              disabled={saving || isUploading || !isFormValid(form)}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading image...
                </>
              ) : saving ? (
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
