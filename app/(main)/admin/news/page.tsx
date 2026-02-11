"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff, Newspaper } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { EmptyState } from "@/components/ui/empty-state"
import { useAdmin } from "@/lib/admin-context"
import { useToast } from "@/lib/toast-context"
import { useUser } from "@/lib/user-context"

interface NewsForm {
  title: string
  summary: string
  content: string
  coverImage: string
  published: boolean
}

const emptyForm: NewsForm = {
  title: "",
  summary: "",
  content: "",
  coverImage: "",
  published: false,
}

export default function AdminNewsPage() {
  const router = useRouter()
  const { isAdmin, newsPosts, createNewsPost, updateNewsPost, deleteNewsPost, togglePublishNews } = useAdmin()
  const { profile } = useUser()
  const { showToast } = useToast()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<NewsForm>(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // During SSR prerendering, profile may be null
  if (!profile) return null

  if (!isAdmin) {
    router.push("/admin")
    return null
  }

  const handleCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const handleEdit = (post: (typeof newsPosts)[0]) => {
    setEditingId(post.id)
    setForm({
      title: post.title,
      summary: post.summary,
      content: post.content,
      coverImage: post.coverImage,
      published: post.published,
    })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!form.title || !form.summary || !form.content) {
      showToast("Please fill in all required fields.", "error")
      return
    }

    if (editingId) {
      updateNewsPost(editingId, form)
      showToast("News post updated.", "success")
    } else {
      createNewsPost({
        ...form,
        authorId: profile.id,
        authorUsername: "ScoreX Team",
      })
      showToast("News post created.", "success")
    }

    setModalOpen(false)
    setForm(emptyForm)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    deleteNewsPost(id)
    setDeleteConfirm(null)
    showToast("News post deleted.", "info")
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">News Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage news posts</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      {newsPosts.length > 0 ? (
        <div className="space-y-3">
          {newsPosts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {post.coverImage && (
                    <div className="w-24 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      <img src={post.coverImage || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{post.title}</h3>
                          <Badge variant={post.published ? "default" : "secondary"}>
                            {post.published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{post.summary}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => togglePublishNews(post.id)}>
                          {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(post)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(post.id)}>
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
      ) : (
        <EmptyState
          icon={Newspaper}
          title="No news posts"
          description="Create your first news post to get started."
          action={<Button onClick={handleCreate}>Create Post</Button>}
        />
      )}

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit News Post" : "Create News Post"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="News title"
              />
            </div>
            <div className="space-y-2">
              <Label>
                Summary <span className="text-destructive">*</span>
              </Label>
              <Textarea
                value={form.summary}
                onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder="Brief summary for preview..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>
                Content <span className="text-destructive">*</span>
              </Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Full article content..."
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label>Cover Image URL</Label>
              <Input
                value={form.coverImage}
                onChange={(e) => setForm((prev) => ({ ...prev, coverImage: e.target.value }))}
                placeholder="/image.jpg or https://..."
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Publish immediately</Label>
                <p className="text-sm text-muted-foreground">Make this post visible to all users</p>
              </div>
              <Switch
                checked={form.published}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, published: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editingId ? "Save Changes" : "Create Post"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete News Post</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this news post? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
