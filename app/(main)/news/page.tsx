"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { Newspaper, Loader2, Calendar, User } from "lucide-react"
import { listNews, type NewsPost } from "@/lib/services/news-service"
import { useI18n } from "@/lib/i18n-context"
import type { ApiError } from "@/lib/api-client"

const LIMIT = 20

export default function NewsPage() {
  const { t } = useI18n()
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNews = useCallback(async (pageNum: number, append: boolean) => {
    if (append) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const data = await listNews({ page: pageNum, limit: LIMIT })
      if (append) {
        setPosts((prev) => [...prev, ...data.posts])
      } else {
        setPosts(data.posts)
      }
      setTotal(data.total)
      setPage(pageNum)
    } catch (err) {
      const apiErr = err as ApiError
      setError(apiErr.message || "Failed to load news")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    fetchNews(1, false)
  }, [fetchNews])

  const handleLoadMore = () => {
    fetchNews(page + 1, true)
  }

  const hasMore = posts.length < total

  // Loading skeleton
  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <Skeleton className="sm:w-48 h-32 sm:h-auto" />
                <CardContent className="p-4 flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold md:text-3xl">{t("news.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("news.subtitle")}</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
          <p className="text-sm text-destructive mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchNews(1, false)}>
            {t("misc.tryAgain")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">{t("news.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("news.subtitle")}</p>
      </div>

      {posts.length > 0 ? (
        <>
          <div className="space-y-4">
            {posts.map((post) => (
              <Link key={post.id} href={`/news/${post.id}`}>
                <Card className="overflow-hidden hover:bg-secondary/50 transition-colors cursor-pointer">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-48 h-32 sm:h-auto bg-secondary flex-shrink-0">
                      <img
                        src={post.cover_image || "/placeholder.svg?height=128&width=192"}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4 flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h2 className="font-semibold text-lg leading-snug line-clamp-2">{post.title}</h2>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{post.summary}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {post.author_username}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load more"
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={Newspaper}
          title={t("news.noNews")}
          description={t("news.noNewsDesc")}
        />
      )}
    </div>
  )
}
