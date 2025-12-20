import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle, Wallet, TrendingUp, Shield, Users, Bell } from "lucide-react"

export default function HelpPage() {
  const categories = [
    {
      icon: TrendingUp,
      title: "Signals",
      faqs: [
        {
          q: "What is a trading signal?",
          a: "A trading signal is a suggestion to BUY a specific stock at a certain price (Entry Point/EP), with target prices to take profit (TP1, TP2) and a stop loss (SL) level to limit potential losses.",
        },
        {
          q: "What do EP, TP1, TP2, and SL mean?",
          a: "EP = Entry Point (buy price), TP1/TP2 = Take Profit targets (sell price), SL = Stop Loss (exit if price drops to this level).",
        },
        {
          q: "Why are some signals locked?",
          a: "Paid signals are locked until you purchase them. The ticker symbol and price levels are hidden to protect the signal provider's work.",
        },
        {
          q: "How do I unlock a signal?",
          a: "Click 'Buy to Unlock' on any paid signal. The cost will be deducted from your wallet balance.",
        },
      ],
    },
    {
      icon: Wallet,
      title: "Wallet & Payments",
      faqs: [
        {
          q: "How do I add money to my wallet?",
          a: "Go to Wallet → Top Up. You can use Click.uz (instant, 3% fee) or P2P transfer (manual, 0% fee).",
        },
        {
          q: "What is P2P top-up?",
          a: "P2P allows you to transfer money directly to our card and upload a screenshot. An admin will verify and credit your wallet within 24 hours.",
        },
        {
          q: "Why was my P2P request rejected?",
          a: "Common reasons: incorrect amount, blurry screenshot, or transfer to wrong card. Contact support for clarification.",
        },
        {
          q: "Is my payment information secure?",
          a: "Yes, we use secure payment processors and never store your card details on our servers.",
        },
      ],
    },
    {
      icon: Shield,
      title: "Halal/Shariah Compliance",
      faqs: [
        {
          q: "What does Islamicly status mean?",
          a: "Islamicly is a Shariah compliance screening tool. COMPLIANT means the stock passes their Islamic criteria, NON_COMPLIANT means it doesn't, and QUESTIONABLE requires further review.",
        },
        {
          q: "What does Musaffa status mean?",
          a: "Musaffa is another Shariah screening service. HALAL means compliant, NOT_HALAL means non-compliant, and DOUBTFUL requires caution.",
        },
        {
          q: "Should I only trade COMPLIANT/HALAL stocks?",
          a: "This is a personal decision based on your understanding of Islamic finance. We provide the screening data to help you make informed choices.",
        },
      ],
    },
    {
      icon: Users,
      title: "Accounts & Profiles",
      faqs: [
        {
          q: "How do I become a signal provider?",
          a: "Any registered user can post signals. Go to 'Add Signal' to create your first signal. Your performance will be tracked publicly.",
        },
        {
          q: "What is ScoreX Points?",
          a: "ScoreX Points measure a trader's overall performance and reputation. Higher points indicate better historical results.",
        },
        {
          q: "Can I change my username?",
          a: "Yes, go to Profile → Edit Profile to update your username, display name, and other information.",
        },
      ],
    },
    {
      icon: Bell,
      title: "Notifications",
      faqs: [
        {
          q: "How do I get notified about new signals?",
          a: "Subscribe to traders you want to follow. Click the bell icon to customize notification settings.",
        },
        {
          q: "Can I turn off notifications?",
          a: "Yes, go to Profile → Settings → Notifications to manage your preferences.",
        },
      ],
    },
  ]

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <HelpCircle className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold md:text-4xl">Help Center</h1>
        <p className="mt-2 text-muted-foreground">Find answers to common questions</p>
      </div>

      <div className="space-y-6">
        {categories.map((category) => (
          <Card key={category.title}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <category.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>{category.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {category.faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`${category.title}-${index}`}>
                    <AccordionTrigger className="text-left text-sm">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardContent className="p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Still need help?</h2>
          <p className="text-sm text-muted-foreground mb-4">Our support team is here to assist you.</p>
          <a href="mailto:support@scorex.uz" className="text-primary hover:underline">
            Contact Support →
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
