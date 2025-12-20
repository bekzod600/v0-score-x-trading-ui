import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Shield, Users, Award } from "lucide-react"

export default function AboutPage() {
  const features = [
    {
      icon: TrendingUp,
      title: "Trading Signals",
      description: "Access high-quality BUY signals from verified professional traders with transparent track records.",
    },
    {
      icon: Shield,
      title: "Halal Trading",
      description: "All signals are screened for Shariah compliance using Islamicly and Musaffa verification systems.",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join a community of like-minded traders sharing knowledge and improving together.",
    },
    {
      icon: Award,
      title: "Verified Results",
      description: "Every signal's performance is tracked and publicly visible. No hidden losses.",
    },
  ]

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">About ScoreX</h1>
        <p className="mt-2 text-muted-foreground">Your trusted halal stock signals marketplace</p>
      </div>

      <Card className="mb-8">
        <CardContent className="prose prose-sm dark:prose-invert max-w-none p-6">
          <h2 className="text-xl font-semibold mb-4">Our Mission</h2>
          <p className="text-muted-foreground">
            ScoreX is a marketplace for BUY-only stock trading signals, designed specifically for traders who want to
            invest in Shariah-compliant stocks. Our platform connects signal providers (professional traders) with
            signal consumers (retail investors) in a transparent and accountable environment.
          </p>
          <p className="text-muted-foreground mt-4">
            Every signal on our platform includes Entry Point (EP), Take Profit levels (TP1, TP2), and Stop Loss (SL),
            along with real-time status tracking. We believe in full transparency - all results, both wins and losses,
            are publicly visible and contribute to each trader's ScoreX rating.
          </p>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4">What Makes Us Different</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Company Information</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Platform:</strong> ScoreX Trading Signals Marketplace
            </p>
            <p>
              <strong>Location:</strong> Tashkent, Uzbekistan
            </p>
            <p>
              <strong>Founded:</strong> 2024
            </p>
            <p>
              <strong>Focus:</strong> Halal/Shariah-Compliant Stock Trading Signals
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
