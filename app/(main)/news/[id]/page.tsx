"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getNews, type NewsPost } from "@/lib/services/news-service"
import { useI18n } from "@/lib/i18n-context"
import type { ApiError } from "@/lib/api-client"

export default function NewsDetailPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { t } = useI18n()

  const [post, setPost] = useState<NewsPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function fetchPost() {
      setLoading(true)
      setError(null)
      setNotFound(false)

      try {
        const data = await getNews(id)
        if (!cancelled) {
          setPost(data)
        }
      } catch (err) {
        if (cancelled) return
        const apiErr = err as ApiError
        if (apiErr.status === 404) {
          setNotFound(true)
        } else {
          setError(apiErr.message || "Failed to load article")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchPost()

    return () => {
      cancelled = true
    }
  }, [id])

  // Loading skeleton
  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <Skeleton className="h-8 w-16 mb-4" />
        <Skeleton className="aspect-video rounded-lg mb-6" />
        <Skeleton className="h-9 w-3/4 mb-4" />
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    )
  }

  // 404 state
  if (notFound) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="text-center py-12">
          <h1 className="text-xl font-semibold mb-2">Article not found</h1>
          <p className="text-muted-foreground mb-4">
            This news article does not exist or is no longer available.
          </p>
          <Link href="/news">
            <Button variant="outline">Back to News</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
          <p className="text-sm text-destructive mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={() => router.refresh()}>
            {t("misc.tryAgain")}
          </Button>
        </div>
      </div>
    )
  }

  if (!post) return null

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("action.back")}
      </Button>

      {post.cover_image && (
        <div className="aspect-video rounded-lg overflow-hidden mb-6 bg-secondary">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-balance">
        {post.title}
      </h1>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
        <div className="flex items-center gap-1">
          <User className="h-4 w-4" />
          <span>{post.author_username}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>{new Date(post.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-4">{post.summary}</p>
        <div className="whitespace-pre-wrap">{post.content}</div>
      </div>
    </div>
  )
}
