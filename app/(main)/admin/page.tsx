"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { CreditCard, Building, Newspaper, AlertTriangle, ArrowRight, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAdmin } from "@/lib/admin-context"

export default function AdminDashboardPage() {
  const router = useRouter()
  const { isAdmin, p2pPayments, trainingCenters, newsPosts } = useAdmin()

  // Redirect non-admins
  if (!isAdmin) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">You need admin privileges to access this page.</p>
            <p className="text-sm text-muted-foreground mb-4">Enable admin mode in Settings to test admin features.</p>
            <Button onClick={() => router.push("/profile/settings")}>Go to Settings</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const pendingP2P = p2pPayments.filter((p) => p.status === "pending").length
  const pendingCenters = trainingCenters.filter((c) => c.status === "pending").length
  const totalNews = newsPosts.length
  const draftNews = newsPosts.filter((n) => !n.published).length

  const stats = [
    {
      title: "P2P Payments",
      description: "Pending approvals",
      value: pendingP2P,
      href: "/admin/p2p",
      icon: CreditCard,
      urgent: pendingP2P > 0,
    },
    {
      title: "Training Centers",
      description: "Pending approvals",
      value: pendingCenters,
      href: "/admin/centers",
      icon: Building,
      urgent: pendingCenters > 0,
    },
    {
      title: "News Posts",
      description: `${draftNews} drafts / ${totalNews} total`,
      value: totalNews,
      href: "/admin/news",
      icon: Newspaper,
      urgent: false,
    },
    {
      title: "Reports",
      description: "Coming soon",
      value: 0,
      href: "#",
      icon: AlertTriangle,
      urgent: false,
      disabled: true,
    },
  ]

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage platform content and approvals</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <Link
            key={stat.title}
            href={stat.disabled ? "#" : stat.href}
            className={stat.disabled ? "cursor-not-allowed" : ""}
          >
            <Card
              className={`h-full transition-colors ${stat.disabled ? "opacity-50" : "hover:bg-secondary/50 cursor-pointer"}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <stat.icon className={`h-5 w-5 ${stat.urgent ? "text-primary" : "text-muted-foreground"}`} />
                  {stat.urgent && (
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg">{stat.title}</CardTitle>
                <CardDescription>{stat.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{stat.value}</span>
                  {!stat.disabled && <ArrowRight className="h-5 w-5 text-muted-foreground" />}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
