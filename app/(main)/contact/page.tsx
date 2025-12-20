import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MessageSquare, MapPin, Clock } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">Contact Us</h1>
        <p className="mt-2 text-muted-foreground">Get in touch with the ScoreX team</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Email Support</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">For general inquiries and support:</p>
            <a href="mailto:support@scorex.uz" className="text-primary hover:underline">
              support@scorex.uz
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Telegram</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">Join our community or get quick support:</p>
            <a
              href="https://t.me/scorex_support"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              @scorex_support
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Location</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tashkent, Uzbekistan
              <br />
              <span className="text-xs">Online platform - no physical office visits</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Support Hours</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Monday - Friday: 9:00 - 18:00 (UZT)
              <br />
              Saturday: 10:00 - 14:00 (UZT)
              <br />
              Sunday: Closed
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium">How quickly do you respond to inquiries?</p>
              <p className="text-muted-foreground">We typically respond within 24 hours during business days.</p>
            </div>
            <div>
              <p className="font-medium">Can I request a feature?</p>
              <p className="text-muted-foreground">
                Yes! Send your suggestions to support@scorex.uz with subject "Feature Request".
              </p>
            </div>
            <div>
              <p className="font-medium">How do I report a bug?</p>
              <p className="text-muted-foreground">
                Please email support@scorex.uz with "Bug Report" in the subject line and include screenshots if
                possible.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
