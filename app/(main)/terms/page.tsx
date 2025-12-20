import { Card, CardContent } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">Terms of Service</h1>
        <p className="mt-2 text-muted-foreground">Last updated: December 2024</p>
      </div>

      <Card>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none p-6 space-y-6">
          <section>
            <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using ScoreX, you agree to be bound by these Terms of Service and all applicable laws and
              regulations. If you do not agree with any of these terms, you are prohibited from using this platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Description of Service</h2>
            <p className="text-muted-foreground">
              ScoreX is a marketplace for trading signals. Signal providers share BUY signals with entry points, take
              profit levels, and stop loss levels. Signal consumers can purchase access to these signals. ScoreX does
              not provide financial advice and is not responsible for any trading decisions made based on signals.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. User Accounts</h2>
            <p className="text-muted-foreground">You are responsible for:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
              <li>Providing accurate and complete registration information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Signal Providers</h2>
            <p className="text-muted-foreground">Signal providers agree to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Provide accurate and timely signal information</li>
              <li>Not manipulate or falsify performance records</li>
              <li>Update signal statuses promptly and honestly</li>
              <li>Comply with all applicable securities laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground">
              <strong>IMPORTANT:</strong> Trading signals are provided for informational purposes only. ScoreX makes no
              guarantees about the accuracy, reliability, or profitability of any signal. Past performance does not
              guarantee future results. You should conduct your own research and consult with a qualified financial
              advisor before making any investment decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              ScoreX and its affiliates shall not be liable for any direct, indirect, incidental, special,
              consequential, or punitive damages resulting from your use of the platform or any signals provided through
              it. This includes, but is not limited to, losses from trading activities.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Prohibited Activities</h2>
            <p className="text-muted-foreground">Users are prohibited from:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Sharing purchased signals with non-subscribers</li>
              <li>Creating multiple accounts to abuse the system</li>
              <li>Posting fraudulent or misleading signals</li>
              <li>Engaging in market manipulation or insider trading</li>
              <li>Using the platform for any illegal purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms, contact us at:
              <br />
              <a href="mailto:legal@scorex.uz" className="text-primary hover:underline">
                legal@scorex.uz
              </a>
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
