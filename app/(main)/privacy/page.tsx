import { Card, CardContent } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-muted-foreground">Last updated: December 2024</p>
      </div>

      <Card>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none p-6 space-y-6">
          <section>
            <h2 className="text-xl font-semibold">1. Information We Collect</h2>
            <p className="text-muted-foreground">We collect information you provide directly to us, including:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Account information (email, username, password)</li>
              <li>Profile information (display name, bio, avatar)</li>
              <li>Transaction data (wallet top-ups, signal purchases)</li>
              <li>Usage data (signals viewed, favorites, ratings)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send notifications about signals and account activity</li>
              <li>Respond to your comments, questions, and support requests</li>
              <li>Monitor and analyze trends, usage, and activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Information Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell, trade, or rent your personal information to third parties. We may share information only
              in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>With your consent or at your direction</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights, privacy, safety, or property</li>
              <li>With service providers who assist in our operations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate security measures to protect your personal information against unauthorized
              access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is
              100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Your Rights</h2>
            <p className="text-muted-foreground">You have the right to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of promotional communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              <a href="mailto:privacy@scorex.uz" className="text-primary hover:underline">
                privacy@scorex.uz
              </a>
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
