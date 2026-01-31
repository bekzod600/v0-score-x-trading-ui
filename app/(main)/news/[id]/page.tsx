"use client"

import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAdmin } from "@/lib/admin-context"

export default function NewsDetailPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { newsPosts } = useAdmin()

  const post = newsPosts.find((p) => p.id === id && p.published)

  if (!post) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="text-center py-12">
          <h1 className="text-xl font-semibold mb-2">Article not found</h1>
          <p className="text-muted-foreground mb-4">This news article does not exist or is no longer available.</p>
          <Link href="/news">
            <Button variant="outline">Back to News</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {post.coverImage && (
        <div className="aspect-video rounded-lg overflow-hidden mb-6 bg-secondary">
          <img src={post.coverImage || "/placeholder.svg"} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-balance">{post.title}</h1>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
        <div className="flex items-center gap-1">
          <User className="h-4 w-4" />
          <span>{post.authorUsername}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-4">{post.summary}</p>
        <div className="whitespace-pre-wrap">{post.content}</div>
      </div>
    </div>
  )
}
