import Link from "next/link"
import { ArrowRight, Shield, Wallet, BarChart3, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: Shield,
    title: "Verified Traders",
    description: "Every trader is verified with transparent track records and performance history.",
  },
  {
    icon: Wallet,
    title: "Wallet-First Payments",
    description: "Secure transactions with multiple payment options and low fees.",
  },
  {
    icon: BarChart3,
    title: "Transparent Rating",
    description: "Real-time leaderboard with ScoreX points, profit tracking, and user ratings.",
  },
  {
    icon: CheckCircle,
    title: "Halal Compliance",
    description: "All signals are screened with Islamicly and Musaffa compliance verification.",
  },
]

const stats = [
  { value: "10K+", label: "Active Traders" },
  { value: "50K+", label: "Signals Delivered" },
  { value: "85%", label: "Success Rate" },
  { value: "$2M+", label: "Profits Generated" },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background px-4 py-16 md:py-24">
        <div className="container mx-auto text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 inline-flex items-center rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary">
              Halal BUY-Only Stock Signals
            </div>
            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Trade Smarter with <span className="text-primary">Verified Signals</span>
            </h1>
            <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl">
              Join the trusted marketplace for halal stock signals. Follow top traders, track performance, and grow your
              portfolio with confidence.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signals">
                <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto">
                  Explore Signals
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                  Join ScoreX
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-secondary/50 px-4 py-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary md:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="container mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Why Choose ScoreX?</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Built for traders who value transparency, performance, and halal compliance.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="border-border bg-card transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary px-4 py-16 md:py-20">
        <div className="container mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl">Ready to Start Trading?</h2>
          <p className="mx-auto mb-8 max-w-xl text-primary-foreground/80">
            Join thousands of traders who trust ScoreX for halal stock signals.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90">
              Create Free Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
