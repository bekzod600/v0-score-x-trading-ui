"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Newspaper } from "lucide-react"
import { useAdmin } from "@/lib/admin-context"

export default function NewsPage() {
  const { newsPosts } = useAdmin()

  // Only show published news
  const publishedNews = newsPosts.filter((p) => p.published)

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">News</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform announcements and updates</p>
      </div>

      {publishedNews.length > 0 ? (
        <div className="space-y-4">
          {publishedNews.map((post) => (
            <Link key={post.id} href={`/news/${post.id}`}>
              <Card className="overflow-hidden hover:bg-secondary/50 transition-colors cursor-pointer">
                <div className="flex flex-col sm:flex-row">
                  {post.coverImage && (
                    <div className="sm:w-48 h-32 sm:h-auto bg-secondary flex-shrink-0">
                      <img
                        src={post.coverImage || "/placeholder.svg?height=128&width=192"}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4 flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h2 className="font-semibold text-lg leading-snug line-clamp-2">{post.title}</h2>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.summary}</p>
                  </CardContent>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Newspaper}
          title="No news yet"
          description="Check back later for platform announcements and updates."
        />
      )}
    </div>
  )
}
