import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function RefundPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">Refund Policy</h1>
        <p className="mt-2 text-muted-foreground">Wallet, P2P payments, and signal purchase policies</p>
      </div>

      <Card className="mb-6 border-primary/50 bg-primary/5">
        <CardContent className="flex items-start gap-4 p-6">
          <AlertTriangle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-primary">Important Notice</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Please read this policy carefully before making any purchases or wallet top-ups. By using ScoreX, you
              agree to these terms.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none p-6 space-y-6">
          <section>
            <h2 className="text-xl font-semibold">1. Wallet Balance</h2>
            <p className="text-muted-foreground">
              Funds added to your ScoreX wallet are <strong>non-refundable</strong> and cannot be withdrawn back to your
              bank account or card. Your wallet balance can only be used to purchase signals within the platform.
            </p>
            <p className="text-muted-foreground">
              <strong>Reason:</strong> This policy helps prevent fraud and ensures the integrity of our marketplace.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. P2P Transfer Rules</h2>
            <p className="text-muted-foreground">When using P2P transfer to top up your wallet:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>
                Transfer the <strong>exact amount</strong> shown to the specified card number
              </li>
              <li>
                Upload a <strong>clear, legible screenshot</strong> of the transfer confirmation
              </li>
              <li>
                Wait up to <strong>24 hours</strong> for admin approval
              </li>
              <li>
                If your request is rejected, the transfer amount is <strong>not automatically returned</strong> -
                contact support
              </li>
            </ul>
            <p className="text-muted-foreground mt-4">
              <strong>Rejected P2P Requests:</strong> If your P2P top-up is rejected due to an error on your part (wrong
              amount, blurry screenshot, etc.), please contact support@scorex.uz with your transfer details. We will
              work to resolve the issue, but resolution is not guaranteed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Signal Purchases</h2>
            <p className="text-muted-foreground">Once a signal is purchased:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>
                The purchase is <strong>final and non-refundable</strong>
              </li>
              <li>You will have permanent access to the signal details</li>
              <li>No refunds will be issued regardless of signal outcome (profit or loss)</li>
              <li>The signal provider receives their share immediately</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Signal Cancellation by Provider</h2>
            <p className="text-muted-foreground">
              If a signal provider cancels their signal <strong>before it reaches entry point</strong>:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>
                Purchasers will receive a <strong>full refund</strong> to their wallet
              </li>
              <li>The refund is automatic and typically processed within 24 hours</li>
              <li>You will be notified via the app when a refund is processed</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              <strong>Note:</strong> Signals cannot be cancelled by the provider once they reach ACTIVE status (entry
              point hit).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Exceptions</h2>
            <p className="text-muted-foreground">Refunds may be considered in exceptional circumstances:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Technical errors on our platform causing duplicate charges</li>
              <li>Verified fraudulent signals (reported and confirmed by admin)</li>
              <li>System downtime preventing access to purchased signals</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              To request an exception review, email{" "}
              <a href="mailto:support@scorex.uz" className="text-primary hover:underline">
                support@scorex.uz
              </a>{" "}
              with:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Your account email/username</li>
              <li>Transaction details</li>
              <li>Detailed description of the issue</li>
              <li>Any supporting evidence (screenshots, etc.)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Contact</h2>
            <p className="text-muted-foreground">
              For refund inquiries or disputes:
              <br />
              Email:{" "}
              <a href="mailto:support@scorex.uz" className="text-primary hover:underline">
                support@scorex.uz
              </a>
              <br />
              Subject line: "Refund Request - [Your Username]"
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
